import HeaderComponent from './HeaderComponent'
import { BasicTable } from './BasicTable';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDiscussionData, setLastUpdated, setSmartSearch } from '../store/reducers/discussions';
import { smartFilter, validateSmartKey } from '../helper/util';
import { Config } from '../db/Config';
import { useEffect } from 'react';
import { iTwinDetails } from '../db/local-database';
import { removeToast, setToastState } from '../store/reducers/toast';
import { getAllDiscussionData } from '../helper/GitHubAPIs';
import { createDictionaryOfTagsWithDeveloperListAndAddTags } from '../helper/TrieClass';
import TagGenerator from './queryResolver/TagGenerator';

function Main() {

  const [filterKey, setFilterKey] = useState('');
  const dispatch = useDispatch();
  const toastState = useSelector((state) => state.toast.toastState);
  const activeRepositories = useSelector((state) => state.discussions.activeRepositories);
  const rateLimit = useSelector((state) => state.discussions.rateLimit);

  const data = useSelector((state) => {
    let res;;
    if (state.discussions.filter.isAny) {
      res = state.discussions.filteredDiscussionData
    }
    else res = state.discussions.discussionData

    return res;
  })

  const handleSearch = (e) => {
    const key = e.target.value;
    setFilterKey(key)
    if (key !== '') {
      const filteredData = smartFilter(data, key);
      const target = validateSmartKey(key);
      let targetCol = 0;
      if (target) {
        targetCol = parseInt(target?.targetCol.substr(3))
      }
      //dispatch action to store
      dispatch(setSmartSearch({ searchDetails: { col: targetCol, status: true, data: filteredData } }));
    } else {
      dispatch(setSmartSearch({ searchDetails: { col: '', status: false, data: [] } }));
    }
  }

  const downloadLatestData = (dateRange) => {
    if (rateLimit.remaining) {
      // get all repository and owner name 
      const owner = iTwinDetails.owner
      const repositories = iTwinDetails.repositories;
      const currentTime = new Date().getTime();
      const latestRepositoryData = [];

      // show Toast data is updated in store
      dispatch(setToastState({ newState: { id: 'downloadingLatestData', title: `Latest data downloading...`, status: 'downloading', autoClose: false, isOpen: true } }))

      repositories.forEach(reposName => {

        //save iTwin dat in localStorage
        getAllDiscussionData(owner, reposName, dateRange).then((data) => {

          //extracting tags for repo data and build dictionary of tags with developer list
          const repoDataWithTags = createDictionaryOfTagsWithDeveloperListAndAddTags(data);

          // Adding repoName in each discussions.
          const discussionDataWithRepoName = repoDataWithTags.map((data) => ({ ...data, repoName: reposName }));

          const latestData = {
            repositoryName: reposName,
            discussionData: discussionDataWithRepoName,
            totalCount: data.length,
            lastUpdate: currentTime
          }
          //updating latestRepositoryData
          latestRepositoryData.push(latestData);
          console.log('Latest data downloaded for repository: ', reposName);

          //updating localStorage when all repos data is downloaded
          if (repositories.length === latestRepositoryData.length) {
            const newITwinData = {
              owner: iTwinDetails.owner,
              repositories: latestRepositoryData,
              lastUpdate: currentTime
            }
            localStorage.setItem('iTwinData', JSON.stringify(newITwinData));

            // show Toast data is updated in store
            dispatch(removeToast({ id: 'downloadingLatestData' }));
            dispatch(setToastState({ newState: { id: 'downloadingLatestData', title: `Latest data downloaded successfully`, status: 'successfullyDownloaded', autoClose: 5000, isOpen: false } }))

            // find data for active repositories & merge all repo data.
            let selectedRepo = [];
            // const iTwinData = JSON.parse(localStorage.getItem('iTwinData'))
            newITwinData.repositories.forEach(repoDetails => {
              if (activeRepositories.find((ele) => ele === repoDetails.repositoryName)) {
                selectedRepo = [...selectedRepo, ...repoDetails.discussionData];
              }
            });

            dispatch(setDiscussionData({ discussionData: selectedRepo }));
            dispatch(setLastUpdated({ lastUpdated: newITwinData.lastUpdate }));

          }


        })
      });
    }
  }

  useEffect(() => {
    let t;
    if (Config.AUTO_REFRESH) {
      t = setInterval(() => {
        //fetch data and update in store ....
        downloadLatestData();
        // fetchDataAndUpdateInStore();
      }, Config.TIME_TO_REFRESH_DATA * 60 * 1000);
    }

    return () => {
      clearInterval(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastState, activeRepositories])

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ height: '18%', width: '100vw', }}>
        <HeaderComponent
          filterKey={filterKey}
          handleSearch={handleSearch}
          handleButtonClick={({ START_DATE, END_DATE }) => {
            if (rateLimit.remaining === 0)
              dispatch(setToastState({ newState: { id: 'noRemainingPoint', title: `You have ${rateLimit.remaining} point`, status: 'danger', autoClose: 5000, isOpen: false } }))
            // console.log({START_DATE, END_DATE})
            downloadLatestData({ START_DATE, END_DATE });
          }} />
      </div>
      <div style={{ height: '82%', width: '100vw' }}>
        <BasicTable />
      </div>
      <TagGenerator />
    </div>
  )
}

export default Main