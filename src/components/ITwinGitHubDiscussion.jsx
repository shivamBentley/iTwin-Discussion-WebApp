import React, { useCallback, useEffect, useState } from 'react'
import {
  HorizontalTabs,
  Tab,
  DropdownButton,
  MenuItem,
  Alert
} from '@itwin/itwinui-react';
import List from './List';
import HeaderComponent from './HeaderComponent';
import { GetAnsweredData, GetCommentedData, GetNoRepliedData, GetUnAnsweredData, filterDiscussionDataByTeam, } from '../helper/util'
import { Teams } from '../helper/team';

function ITwinGitHubDiscussion({ discussionData, isLoading }) {
  const [index, setIndex] = React.useState(0);
  const [activeTitle, setActiveTitle] = useState('All')
  const [listData, setListData] = useState([]);
  const [currentIndexData, setCurrentIndexData] = useState([])
  const [status, setStatus] = useState(false);
  const [visibility , setVisibility] = useState(false)

  const getTeamWiseDiscussionData = useCallback(() => {
    if (isLoading) return [];
    return filterDiscussionDataByTeam(discussionData, Teams[0].BDN)
  }, [discussionData, isLoading])

  const BorderlessTabs = (args) => {
    const getContent = () => {
      switch (index) {
        case 0:
          return <List discussionData={listData} isLoading={isLoading} />
        case 1:
          return <List discussionData={listData} isLoading={isLoading} />
        default:
          console.log("Running default case");
          break;
      }
    };

    return (
      <HorizontalTabs
        labels={[
          <Tab key={1} label='All Discussion' />,
          <Tab key={2} label='BDN Team ' />,
        ]}
        type='borderless'
        {...args}
        onTabSelected={setIndex}
      >
        {getContent()}
      </HorizontalTabs>
    );
  };

  const menuItems = (close) => [
    <MenuItem key={1} onClick={() => { setActiveTitle("All"); close() }}>All</MenuItem>,
    <MenuItem key={2} onClick={() => { setActiveTitle("Answered"); close() }}> Answered</MenuItem >,
    <MenuItem key={3} onClick={() => { setActiveTitle("Unanswered"); close() }}>Unanswered</MenuItem>,
    <MenuItem key={4} onClick={() => { setActiveTitle("Commented"); close() }}>Commented</MenuItem>,
    <MenuItem key={5} onClick={() => { setActiveTitle("No Reply"); close() }}>No Reply</MenuItem>,
  ]

  const setDataForList = () => {
    switch (activeTitle) {
      case 'All':
        setListData(currentIndexData)
        break;
      case 'Answered':
        setListData(GetAnsweredData(currentIndexData))
        break;
      case 'Unanswered':
        setListData(GetUnAnsweredData(currentIndexData))
        break;
      case 'Commented':
        setListData(GetCommentedData(currentIndexData))
        break;
      case 'No Reply':
        setListData(GetNoRepliedData(currentIndexData));
        break;
      default:
        console.log("Running default case");
        break;
    }
  }


  const notify = () =>{
    const iTwinDiscussionData = JSON.parse(localStorage.getItem('iTwinDiscussionData'))
    const status = {
      error: false,
      updated: false,
      msg: ''
    }
    
    setVisibility(true)
    setTimeout(() => {
      setVisibility(false)
    }, 3000);
    if (iTwinDiscussionData.error) {
      status.error = true;
      setStatus(status)
    }
    else if (iTwinDiscussionData.updated) {
      status.updated = true;
      setStatus(status)
    }

  }

  useEffect(() => {
    
    switch (index) {
      case 0:
        setCurrentIndexData(discussionData);
        break;
      case 1:
        setCurrentIndexData(getTeamWiseDiscussionData())
        break;
      default:
        console.log("Running default case from useEffect switch");
        break;
    }

    notify();
  }, [discussionData, index])

  useEffect(() => {
    setDataForList();
  }, [currentIndexData, activeTitle])



  return (<>
    { status.updated && visibility && <Alert type='positive' > New data update </Alert>}
    { !status.updated && visibility && <Alert type='informational' > Old data Loaded</Alert>}
    { status.error && visibility && <Alert type='negative' > Access Token Error </Alert>}

    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '8vh',
      backgroundColor: 'lightgray',
      padding: '10px 0 0 0'
    }}>
      <HeaderComponent />
    </div>
    <div style={{ height: '90vh', position: 'relative', }}>
      <div style={{
        position: 'absolute',
        right: '50px',
        top: '5px',
        zIndex: '1'
      }}>
        <DropdownButton size='small' menuItems={menuItems}>
          {activeTitle}
        </DropdownButton>
      </div>
      {BorderlessTabs()}
    </div>
  </>
  )
}

export default ITwinGitHubDiscussion