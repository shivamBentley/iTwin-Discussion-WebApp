import React, { useEffect, useCallback } from 'react'
import ListComponent from '../unused/ListComponent'
import HeaderComponent from './HeaderComponent'
import { FilterModal } from './Filter/FilterModal'
import { getAllDiscussionData } from '../helper/GitHubAPIs';
import { useDispatch, useSelector } from 'react-redux';
import { setDiscussionData, setOwner, setRepositoryName } from '../store/reducers/discussions';
import { BasicTable } from './BasicTable';

function Main() {
  return (
    <div>
      <HeaderComponent title={'iTwinjs-core'} />
      <BasicTable />
      <FilterModal />
    </div>
  )
}

export default Main