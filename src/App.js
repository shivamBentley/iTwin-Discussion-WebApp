import { Route, Switch } from 'react-router-dom';
import Main from "./components/Main";
import React, { useCallback, useEffect, useState } from 'react'
import { getAllDiscussionData, getRateLimitData } from './helper/GitHubAPIs';
import { iTwinDetails } from './db/local-database';
import { useDispatch, useSelector } from 'react-redux';
import { setDiscussionData, setOwner, setRepositoryName } from './store/reducers/discussions';


function App() {

  const owner = iTwinDetails.owner;
  const repositories = iTwinDetails.repositories;
  const dispatch = useDispatch();

  const updateDataInLocalStorage = useCallback(async () => {
    const repositoriesData = [];
    if (repositories.length > 0) {
      repositories.forEach((repoName) => {
        const currentTime = new Date().getTime();
        //save iTwin dat in localStorage
        getAllDiscussionData(owner, repoName).then((data) => {
          const repoData = {
            repositoryName: repoName,
            discussionData: data,
            totalCount: data.length,
            lastUpdate: currentTime
          }
          repositoriesData.push(repoData);

          const iTwinData = {
            owner: 'iTwin',
            repositories: repositoriesData
          }
          // console.log(repositoriesData)
          localStorage.setItem('iTwinData', JSON.stringify(iTwinData));
        })
          .catch((err) => {
            console.log('ERROR:', err);
          });
      })
    }
  }, []);

  //update data in store 
  const setDefaultDataInStore = useCallback(() => {
    const iTwinData = JSON.parse(localStorage.getItem('iTwinData'))
    dispatch(setDiscussionData({ discussionData: iTwinData.repositories[0].discussionData }));
    dispatch(setRepositoryName({ repositoryName: iTwinData.repositories[0].repositoryName }));
    dispatch(setOwner({ owner: iTwinData.owner }));
  }, [])


  useEffect(() => {
    console.log('running from app.js')
    // fetch all data that is stored in localStorage

    // updateDataInLocalStorage();

    // check validity with time - if its more than 1 hour or new Question came the fetch new data and update localStorage.

    /**
     * write condition when to update data in local storage and when to update in store
     */
    //updated store
    setDefaultDataInStore();


  }, [])

  return (
    <div className="App">
      <Main />
    </div>
  );
}

export default App;
