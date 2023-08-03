import Main from "./Main";
import React, { useCallback, useEffect, useState } from 'react'
import { getAllDiscussionData, getRateLimitData } from '../helper/GitHubAPIs';
import { iTwinDetails } from '../db/local-database';
import { useDispatch } from 'react-redux';
import { setActiveRepos, setDateRangeFilter, setDevelopers, setDiscussionData, setFilter, setFilteredDiscussionData, setLastUpdated, setLoading, setOwner, setRateLimit, setSorting } from '../store/reducers/discussions';
import { GetNoRepliedData, GetUnAnsweredData, filteredDiscussionDataByDateRange, getAllDevelopers, getFilteredDataOnFilter } from '../helper/discussion';
import { BasicModal } from './BasicModal';
import { Config } from "../db/Config";
import { ToastNotify } from "./ToastNotify";
import { createDictionaryOfTagsWithDeveloperListAndAddTags } from "../helper/TrieClass";
import userConfiguration from '../db/userConfig.json'
import { arrayUnion, comparatorFunc } from "../helper/util";
import { removeToast, setToastState } from "../store/reducers/toast";

// import { removeToast, setToastState } from "../store/reducers/toast";

const storeName = 'iTwinData';
function SuperMainContainer({ repoStatus, setRepoStatus, repositories, removeRepoFromReposListAndUpdateITwindData }) {

  const owner = iTwinDetails.owner;
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [isModalOpen, setModel] = useState(true);

  const updateDataInLocalStorage = () => {

    // show Toast data is updated in store
    // dispatch(setToastState({ newState: { id: `${repositories[0]}`, title: `${repositories[0]} downloading...`, status: 'downloading', autoClose: false, isOpen: true } }))

    if (repositories.length > 0) {
      const currentTime = new Date().getTime();

      //save iTwin dat in localStorage.
      getAllDiscussionData(owner, repositories[0]).then((data) => {

        //extracting tags for repo data and build dictionary of tags with developer list.
        const repoDataWithTags = createDictionaryOfTagsWithDeveloperListAndAddTags(data);

        // Adding repoName in each discussions.
        const discussionDataWithRepoName = repoDataWithTags.map((data) => ({ ...data, repoName: repositories[0] }));

        const repoData = {
          repositoryName: repositories[0],
          discussionData: discussionDataWithRepoName,
          totalCount: data.length,
          lastUpdate: currentTime
        }
        removeRepoFromReposListAndUpdateITwindData(repositories[0], repoData);

      })
        .catch((err) => {
          console.error('ERROR:', err);
        });
    }
  }


  const updateUserConfiguration = (userConfig) => {
    // notify using toast that userConfiguration setup is in process
    dispatch(setToastState({ newState: { id: 'userConfigSetup', title: `User Configuration in process...`, status: 'downloading', autoClose: false, isOpen: true } }))

    // check selected repositories
    const selectedRepositories = userConfig.filter.repositories;
    //updating repositories in active repositories
    dispatch(setActiveRepos({ activeRepositories: selectedRepositories }))

    const iTwinData = JSON.parse(localStorage.getItem('iTwinData'))

    // merge all selected repo data.
    let selectedRepo = [];
    iTwinData.repositories.forEach(repoDetails => {
      if (selectedRepositories.find((ele) => ele === repoDetails.repositoryName)) {
        selectedRepo = [...selectedRepo, ...repoDetails.discussionData];
      }
    });

    // update discussion data in store 
    dispatch(setDiscussionData({ discussionData: selectedRepo }));

    let filteredData = [];

    // check either selectType filter or selectInAll filter applied or not
    const isAnyTypeOrSelectInAllFilter = userConfig.filter.selectInAll.length > 0 || userConfig.filter.selectType.length > 0;
    if (!isAnyTypeOrSelectInAllFilter) {
      filteredData = selectedRepo;
    }

    // if selectInAll Enabled 
    if (userConfig.filter.selectInAll.length > 0) {
      const keys = userConfig.filter.selectInAll;
      keys.forEach((key) => {
        if (key === "unanswered") {
          const unansweredData = GetUnAnsweredData(selectedRepo);
          filteredData = arrayUnion(filteredData, unansweredData, comparatorFunc);
        } else {
          const noRepliedData = GetNoRepliedData(selectedRepo);
          filteredData = arrayUnion(filteredData, noRepliedData, comparatorFunc);
        }
      })
    }
    // if selectType or developer filter Enabled
    else if (userConfig.filter.selectType.length > 0 || userConfig.filter.selectedDevelopers.length > 0) {
      const typeFilterKeys = userConfig.filter.selectType;
      const selectedDevelopers = userConfig.filter.selectedDevelopers;
      filteredData = getFilteredDataOnFilter(selectedRepo, selectedDevelopers, typeFilterKeys)

    }

    // set Developers in store with checkBox 
    if (filteredData.length > 0) {
      const allDeveLopersWithCheckBox = Array.from(getAllDevelopers(selectedRepo)).map((obj) => ({ isChecked: false, name: obj }))
      dispatch(setDevelopers({ developers: { isAny: false, dataWithCheckBox: allDeveLopersWithCheckBox } }));
    }

    // set filter in store 
    const filterObj = userConfig.filter;
    const isAnyFilter = filterObj.selectType.length > 0 || filterObj.selectedDevelopers.length > 0 || filterObj.selectInAll.length > 0;

    if (isAnyFilter) {
      const currFilterStatus = {
        isAny: isAnyFilter,
        typeFilterKey: filterObj.selectType,
        developerFilterKey: filterObj.selectedDevelopers,
        isTeamFilter: false,
        isSelectAllFilter: filterObj.selectInAll.length > 0,
      }

      dispatch(setFilter({ filter: currFilterStatus }));
    }

    // Apply date filter if enabled
    if (userConfig.filter.dateRange.isEnable) {
      const { startDate, endDate } = userConfig.filter.dateRange;

      // set store filed for date range - isDateRange
      filteredData = filteredDiscussionDataByDateRange(filteredData, startDate, endDate);
      dispatch(setDateRangeFilter({ isDateRangeFilter: true }));
    }

    // update filteredDiscussionData in store data in store 
    if (isAnyFilter || userConfig.filter.dateRange.isEnable)
      dispatch(setFilteredDiscussionData({ filteredDiscussionData: filteredData }));

    if (userConfig.sorting.isEnable) {
      const { key, order } = userConfig.sorting;
      dispatch(setSorting({
        sortingStatus: {
          isEnable: true,
          order: order,
          key: key
        }
      }))
    }
  }

  //update data in store 
  const setDefaultDataInStore = useCallback((isOldDataUpdate) => {
    const iTwinData = JSON.parse(localStorage.getItem(storeName))
    /**
     * Setting userConfig as default 
     */

    const { userConfig, isUserConfigEnable } = userConfiguration;
    if (isUserConfigEnable)
      updateUserConfiguration(userConfig);
    else {

      const primaryRepo = iTwinData.repositories.filter(repoDetails => repoDetails.repositoryName === iTwinDetails.primaryRepo);

      const discussionData = primaryRepo[0].discussionData;
      const allDeveLopersWithCheckBox = Array.from(getAllDevelopers(discussionData)).map((developer) => ({ isChecked: false, name: developer }));
      const devFilter = { isAny: false, dataWithCheckBox: allDeveLopersWithCheckBox }

      //dispatch default data to store ...
      dispatch(setDiscussionData({ discussionData: discussionData }));
      dispatch(setActiveRepos({ activeRepositories: [iTwinDetails.primaryRepo] }));
      dispatch(setOwner({ owner: iTwinData.owner }));
      dispatch(setDevelopers({ developers: devFilter }));
      dispatch(setLastUpdated({ lastUpdated: iTwinData.lastUpdate }))
    }

    //updating repoStatus for modal & toast
    if (isOldDataUpdate) {
      const newReposStatus = iTwinData.repositories.map((rep) => {
        return ({ status: 'positive', name: rep.repositoryName });
      })
      setTimeout(() => {
        setRepoStatus(newReposStatus);
        if (isUserConfigEnable) {
          // remove userConfiguration toast when userConfiguration setup is done.
          dispatch(removeToast({ id: 'userConfigSetup' }));
          dispatch(setToastState({ newState: { id: 'userConfigSetup', title: `User Configuration applied successfully`, status: 'successfullyDownloaded', autoClose: 5000, isOpen: false } }))
        }
        setTitle(`Ready for use.`)
        setModel(false)
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDataAndUpdateInStore = () => {
    const currentTime = new Date().getTime();
    // update store with old data if available
    const iTwinData = JSON.parse(localStorage.getItem(storeName))
    getRateLimitData().then((data) => {
      dispatch(setRateLimit({ rateLimit: data.data?.rateLimit }));
      {
        // fetch all data that is stored in localStorage if available
        const iTwinData = JSON.parse(localStorage.getItem(storeName));
        const allRepoIsInLocalStorage = iTwinData?.repositories.length !== iTwinDetails?.repositories.length
        if (!iTwinData || allRepoIsInLocalStorage || (Config.AUTO_REFRESH && ((iTwinData.lastUpdate + Config.TIME_TO_REFRESH_DATA * 60 * 1000)) < currentTime)) {
          if (repositories.length > 0) {
            console.log('Downloading latest data for repository : ', repositories[0])
            setTitle(`Downloading latest data... `)
            updateDataInLocalStorage();
            dispatch(setLoading({ isLoading: false }));
          }
        } else {
          //updating old data form local Storage 
          setTitle(`Loading data.... `)
          setDefaultDataInStore(true);
          dispatch(setLoading({ isLoading: false }));
          console.log("New data loading paused. Old data updating in store...")
          // dispatch(setToastState({ newState: { title: `Updating List ...`, status: 'success', autoClose: 5000, isOpen: true, id: 'updating List' } }))

        }
      }
    }).catch((err) => {
      console.error("Rate Limit Exceeded")
      if (iTwinData) {
        setDefaultDataInStore(false);
        dispatch(setLoading({ isLoading: false }));
        console.log("iTwinData found in local storage. Old data updating in store...")
      } else {
        console.error("You don't have old iTwin data in localStorage")
      }
    });
  }

  useEffect(() => {
    fetchDataAndUpdateInStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositories])

  return (
    <div className="App">
      <Main />
      <ToastNotify />
      <BasicModal
        isOpen={isModalOpen}
        title={title}
        messages={repoStatus}
      />
    </div>
  );
}

export default SuperMainContainer;
