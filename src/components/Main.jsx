import HeaderComponent from './HeaderComponent'
import { BasicTable } from './BasicTable';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDiscussionData, setSmartSearch } from '../store/reducers/discussions';
import { smartFilter, validateSmartKey } from '../helper/util';
import { Config } from '../db/Config';
import { useEffect } from 'react';
import { iTwinDetails } from '../db/local-database';
import { removeToast, setToastState } from '../store/reducers/toast';
import { getAllDiscussionData } from '../helper/GitHubAPIs';

function Main() {

  const [filterKey, setFilterKey] = useState('');
  const dispatch = useDispatch();
  const toastState = useSelector((state) => state.toast.toastState);
  const activeRepo = useSelector((state) => state.discussions.repositoryName);

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

  const downloadLatestData = () => {

    // get all repository and owner name 
    const owner = iTwinDetails.owner
    const repositories = iTwinDetails.repositories;
    const currentTime = new Date().getTime();
    const latestRepositoryData = [];

    // show Toast data is updated in store
    dispatch(setToastState({ newState: { id: 'downloadingLatestData', title: `Latest data downloading...`, status: 'downloading', autoClose: false, isOpen: true } }))

    repositories.forEach(reposName => {

      //save iTwin dat in localStorage
      getAllDiscussionData(owner, reposName).then((data) => {
        const latestData = {
          repositoryName: reposName,
          discussionData: data,
          totalCount: data.length,
          lastUpdate: currentTime
        }
        //updating latestRepositoryData
        latestRepositoryData.push(latestData);

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


          // find data for active repository 
          console.log(activeRepo);
          const selectedRepo = newITwinData.repositories.filter(repoDetails => repoDetails.repositoryName === activeRepo);
          dispatch(setDiscussionData({ discussionData: selectedRepo[0].discussionData }))

        }

        console.log('Latest data downloaded for repository: ', reposName);
      })
    });

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
  }, [toastState, activeRepo])

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ height: '15%', width: '100vw', }}>
        <HeaderComponent filterKey={filterKey} handleSearch={handleSearch} />
      </div>
      <div style={{ height: '85%', width: '100vw' }}>
        <BasicTable />
      </div>
    </div>
  )
}

export default Main