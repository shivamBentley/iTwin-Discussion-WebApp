import React, { useEffect, useState } from 'react'
import {
  VerticalTabs,
  HorizontalTabs,
  HorizontalTabsProps,
  VerticalTabsProps,
  Tab,
} from '@itwin/itwinui-react';
import List from './List';
import HeaderComponent from './HeaderComponent';
import { filterDiscussionDataByTeam } from '../helper/util'
import { Teams } from '../helper/team';

function ITwinGitHubDiscussion({ discussionData, isLoading }) {
  const [index, setIndex] = React.useState(0);

  const getTeamWiseDiscussionData = () => {
    if (isLoading) return [];
    return filterDiscussionDataByTeam(discussionData, Teams[0].BDN)
  }

  const BorderlessTabs = (args) => {
    const getContent = () => {
      switch (index) {
        case 0:
          return <List discussionData={discussionData} isLoading={isLoading} />
        case 1:
          return <List discussionData={getTeamWiseDiscussionData()} isLoading={isLoading} />
        default:
          return <List discussionData={[]} isLoading={isLoading} />
      }
    };

    return (
      <HorizontalTabs
        labels={[
          <Tab key={1} label='All Discussion' />,
          <Tab key={2} label='BDN Team ' />,
          <Tab key={3} label='Other' />,
        ]}
        type='borderless'
        {...args}
        onTabSelected={setIndex}
      >
        {getContent()}
      </HorizontalTabs>
    );
  };


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
    <div style={{ height: '90vh' }}>
      {BorderlessTabs()}
    </div>
  </>
  )
}

export default ITwinGitHubDiscussion