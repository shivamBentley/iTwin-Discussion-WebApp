import HeaderComponent from './HeaderComponent'
import { BasicTable } from './BasicTable';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSmartSearch } from '../store/reducers/discussions';
import { smartFilter, validateSmartKey } from '../helper/util';

function Main() {

  const [filterKey, setFilterKey] = useState('');
  const dispatch = useDispatch();
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