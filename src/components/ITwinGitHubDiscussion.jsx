import React, { useCallback, useEffect, useState } from 'react'
import {
  HorizontalTabs,
  Tab,
  DropdownButton,
  MenuItem
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
  }, [discussionData, index])

  useEffect(() => {
    setDataForList();
  }, [currentIndexData , activeTitle])

  return (<>
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