import { Route, Switch } from 'react-router-dom';
import './App.css';
import Test from "./components/Test";
import ITwinGitHubDiscussion from './components/ITwinGitHubDiscussion';
import React, { useEffect, useState } from 'react'
import { getAllDiscussionData, getRateLimitData } from './helper/GitHubAPIs';


function App() {

  const [discussionData, setDiscussionData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const updateRateLimit = async () => {
    await getRateLimitData()
      .then(data => {
        const rateLimit = data.data.rateLimit
        localStorage.setItem('rateLimit', JSON.stringify(rateLimit))
      })
      .catch(err => console.log("Error on calling function - getApiDetails() : \n", err))
  }

  const loadDiscussionData = () => {
    const storedItems = JSON.parse(localStorage.getItem('iTwinDiscussionData'))
    setDiscussionData(storedItems.discussionData);
    setLoading(false);
  }

  const updateLocalDiscussionData = () => {
    const oldITwinDiscussionData = JSON.parse(localStorage.getItem('iTwinDiscussionData'))
    const currentTime = new Date().getTime();

    const rateLimit = JSON.parse(localStorage.getItem('rateLimit'))
    if (rateLimit === 0) {
      console.log("Limit exceeded");
    }

    else if (oldITwinDiscussionData === undefined || currentTime > (oldITwinDiscussionData.lastUpdated + 30 * 60 * 1000)) {
      getAllDiscussionData()
        .then(data => {
          setDiscussionData(data);
          setLoading(false);
          
          const iTwinDiscussionData = {
            lastUpdated: currentTime,
            discussionData: data,
            error: false,
            updated: true,
            totalCount : data.length

          }
          localStorage.setItem('iTwinDiscussionData', JSON.stringify(iTwinDiscussionData))
          console.log("Updating data...")

        })
        .catch(err => {
          const iTwinDiscussionData = {
            ...oldITwinDiscussionData,
            lastUpdated: oldITwinDiscussionData.lastUpdated,
            discussionData: oldITwinDiscussionData.discussionData,
            error: true,
            updated: false,
          }
          localStorage.setItem('iTwinDiscussionData', JSON.stringify(iTwinDiscussionData))
          console.log("Error on calling function - getAllDiscussionData() : \n", err)
          console.log("Setting old data...")
        })

    }

    if (!(currentTime > (oldITwinDiscussionData.lastUpdated + 30 * 60 * 1000))) {
      const iTwinDiscussionData = {
        ...oldITwinDiscussionData,
        lastUpdated: oldITwinDiscussionData.lastUpdated,
        discussionData: oldITwinDiscussionData.discussionData,
        error: false,
        updated: false,
      }
      localStorage.setItem('iTwinDiscussionData', JSON.stringify(iTwinDiscussionData))
      console.log("No Error - Setting old data...")

    }

  }
  useEffect(() => {

    //update rateLimit 
    updateRateLimit();
    updateLocalDiscussionData();
    loadDiscussionData();

  }, [])

  return (
    <div className="App">
      <Switch>
        <Route strict exact path="/">
          <ITwinGitHubDiscussion discussionData={discussionData} isLoading={isLoading} />
        </Route>
        <Route strict exact path="/test">
          <Test />
        </Route>
      </Switch>

    </div>
  );
}

export default App;
