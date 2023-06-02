import Main from "./Main";
import React, { useCallback, useEffect, useState } from 'react'
import { getAllDiscussionData, getRateLimitData } from '../helper/GitHubAPIs';
import { iTwinDetails } from '../db/local-database';
import { useDispatch } from 'react-redux';
import { setDevelopers, setDiscussionData, setLoading, setOwner, setRateLimit, setRepositoryName } from '../store/reducers/discussions';
import { getAllDevelopers } from '../helper/util';
import { BasicModal } from './BasicModal';
import { Config } from "../db/Config";

const storeName = 'iTwinData';
function SuperMainContainer({ repoStatus, setRepoStatus, repositories, removeRepoFromReposListAndUpdateITwindData }) {

  const owner = iTwinDetails.owner;
  const dispatch = useDispatch();
  const [title, setTitle] = useState('')

  const updateDataInLocalStorage = () => {

    if (repositories.length > 0) {
      const currentTime = new Date().getTime();

      //save iTwin dat in localStorage
      getAllDiscussionData(owner, repositories[0]).then((data) => {
        const repoData = {
          repositoryName: repositories[0],
          discussionData: data,
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

  //update data in store 
  const setDefaultDataInStore = useCallback((isOldDataUpdate, remainingPoint) => {
    const iTwinData = JSON.parse(localStorage.getItem(storeName))
    const discussionData = iTwinData.repositories[0].discussionData;
    const allDeveLopersWithCheckBox = Array.from(getAllDevelopers(discussionData)).map((developer) => ({ isChecked: false, name: developer }));
    const devFilter = { isAny: false, dataWithCheckBox: allDeveLopersWithCheckBox }


    //updating repoStatus for modal
    if (isOldDataUpdate) {
      const newReposStatus = iTwinData.repositories.map((rep) => {
        return ({ status: 'positive', name: rep.repositoryName });
      })
      setTimeout(() => {
        setRepoStatus(newReposStatus);
        setTitle(`Ready for use.`)
      }, 3000);
    }
    //dispatch default data to store ...
    dispatch(setDiscussionData({ discussionData: discussionData }));
    dispatch(setRepositoryName({ repositoryName: iTwinData.repositories[0].repositoryName }));
    dispatch(setOwner({ owner: iTwinData.owner }));
    dispatch(setDevelopers({ developers: devFilter }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  useEffect(() => {
    const currentTime = new Date().getTime();
    // update store with old data if available
    const iTwinData = JSON.parse(localStorage.getItem(storeName))

    getRateLimitData().then((data) => {
      dispatch(setRateLimit({ rateLimit: data.data?.rateLimit }));
      if (data.data?.rateLimit.remaining === 0) {
        console.error("Rate Limit Exceeded", data.data?.rateLimit)

        if (iTwinData) {
          setDefaultDataInStore();
          dispatch(setLoading({ isLoading: false }));
          console.log("iTwinData found in local storage. Old data updating in store...")
        } else {
          console.error("You don't have old iTwin data in localStorage")
        }

      } else {
        // fetch all data that is stored in localStorage if available
        const iTwinData = JSON.parse(localStorage.getItem(storeName))

        if (!iTwinData || (iTwinData.lastUpdate + Config.TIME_TO_REFRESH_DATA * 60 * 1000) < currentTime) {
          if (repositories.length > 0) {
            console.log('Downloading latest data for repository : ', repositories[0])
            setTitle(`Downloading latest data... `)
            updateDataInLocalStorage();
            dispatch(setLoading({ isLoading: false }));
          }
        } else {
          //updating old data form local Storage 
          setTitle(`Loading data.... `)

          setDefaultDataInStore(true, data.data?.rateLimit.remaining);
          dispatch(setLoading({ isLoading: false }));
          console.log("New data loading paused. Old data updating in store...")
        }
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositories])

  return (
    <div className="App">
      <Main />
      <BasicModal
        isOpen={true}
        title={title}
        messages={repoStatus}
      />
    </div>
  );
}

export default SuperMainContainer;
