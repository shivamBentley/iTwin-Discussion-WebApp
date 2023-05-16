import { Route, Switch } from 'react-router-dom';
import './App.css';
import Test from "./components/Test";
import ITwinGitHubDiscussion from './components/ITwinGitHubDiscussion';
import React, { useEffect, useState } from 'react'
import { getAllDiscussionData } from './helper/GitHubAPIs';


function App() {

  const [discussionData, setDiscussionData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getAllDiscussionData()
      .then(data => {
        setDiscussionData(data);
        setLoading(false);
      })
      .catch(err => console.log("Error on calling function - getAllDiscussionData() : \n", err))
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
