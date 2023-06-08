import React, { useEffect, useState } from 'react'
import './MultiInputFilter'
import {
    Checkbox, Headline, DropdownButton,
    MenuItem,
    Input
} from '@itwin/itwinui-react'
import { useDispatch, useSelector } from 'react-redux'
import { Teams, iTwinDetails } from '../../db/local-database'
import { setDevelopers, setDiscussionData, setFilteredDiscussionData, setLoading, setRepositoryName } from '../../store/reducers/discussions'
import { GetNoRepliedData, GetUnAnsweredData, getAllDevelopers, getFilteredDataOnFilter } from '../../helper/discussion'
import { setFilter } from '../../store/reducers/discussions'
import { useCallback } from 'react'

function MultiInputFilter({ types, setTypes, selectInAll, setSelectInAll, resetButtonHandle }) {

    const activeRepository = useSelector((state) => state.discussions.repositoryName);
    const filter = useSelector(state => state.discussions.filter)
    const [filterKey, setFilterKey] = useState('');
    const [filteredDevList, setFilterDevList] = useState([]);
    const developers = useSelector((state) => state.discussions.developers)
    const [activeTeam, setTeam] = useState('Select Team')
    const dispatch = useDispatch();
    const discussionData = useSelector((state) => (state.discussions.discussionData))

    //menuItem list 
    const getMenuItemsForRepo = useCallback((close, currFilter) => {
        const menuItems = iTwinDetails.repositories.map((repo, index) => {
            return <MenuItem key={index} onClick={() => {
                dispatch(setRepositoryName({ repositoryName: repo }));
                updateDeveloperDataInStore(repo);
                resetButtonHandle();
                setTeam('Select Team');
                close();
            }}

            >{repo}</MenuItem>
        })
        return menuItems;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, developers])

    const getMenuItemsForTeam = useCallback((close, currFilter) => {
        const menuItems = Teams.map((obj) => {
            return <MenuItem key={obj.id} name={obj.teamName} onClick={(e) => {
                setTeam(obj.teamName);

                const devFilterKeys = [];
                const newDevelopers = developers.dataWithCheckBox.map((devWithCheckBox) => {
                    let found = false;
                    obj.teamMembers.forEach((teamDev) => {
                        if (teamDev.GitHubLogin === devWithCheckBox.name) {
                            devFilterKeys.push(teamDev.GitHubLogin);
                            found = true;
                        }
                    })
                    if (found) return ({ ...devWithCheckBox, isChecked: true });
                    else return ({ ...devWithCheckBox, isChecked: false });
                })

                dispatch(setDevelopers({ developers: { isAny: true, dataWithCheckBox: newDevelopers } }));
                dispatch(setFilter({
                    filter: {
                        ...currFilter,
                        developerFilterKey: devFilterKeys,
                        isAny: devFilterKeys.length !== 0 || isAnyOtherFilter('isTeamFilter', currFilter),
                        isTeamFilter: devFilterKeys !== 0,
                        isSelectAllFilter: false
                    }
                }))

                //clear select in all filter
                clearSelectInAllFilter();
                close();
            }}

            >{obj.teamName}</MenuItem>
        })

        if (filter.isTeamFilter) {
            menuItems.unshift(<MenuItem key={'none-key'} onClick={() => {
                setTeam("Select Team");
                const newDevelopers = developers.dataWithCheckBox.map((devWithCheckBox) => ({ ...devWithCheckBox, isChecked: false }));
                dispatch(setDevelopers({ developers: { isAny: false, dataWithCheckBox: newDevelopers } }));
                dispatch(setFilter({ filter: { ...currFilter, developerFilterKey: [], isAny: isAnyOtherFilter('isTeamFilter', currFilter), isTeamFilter: false } }))
                close();
            }}>None</MenuItem>)
        }
        return menuItems;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, developers])

    const isAnyOtherFilter = useCallback((FilterType, currentFilter) => {
        switch (FilterType) {
            case 'typeFilterKey':
                return currentFilter.developerFilterKey?.length !== 0 || currentFilter.isTeamFilter || currentFilter.isSelectAllFilter
            case 'developerFilterKey':
                return currentFilter.typeFilterKey?.length !== 0 || currentFilter.isTeamFilter || currentFilter.isSelectAllFilter
            case 'isTeamFilter':
                return currentFilter.typeFilterKey?.length !== 0 || currentFilter.isSelectAllFilter
            case 'isSelectAllFilter':
                return currentFilter.developerFilterKey?.length !== 0 || currentFilter.isTeamFilter || currentFilter.typeFilterKey?.length !== 0
            default:
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handelTypeClick = (e, typeCheckBox) => {
        const newTypes = typeCheckBox.map((obj) => {
            if (obj.name === e.target.name) {
                return ({ ...obj, isChecked: e.target.checked });
            } else return obj;
        })

        //check if any developer is selected 
        const typeKeys = [];
        let isAnyStatus = false;
        newTypes.forEach((dev) => {
            if (dev.isChecked) {
                isAnyStatus = true
                typeKeys.push(dev.name);
            };
        })

        //updating store 
        dispatch(setFilter({ filter: { ...filter, isAny: isAnyStatus || isAnyOtherFilter('typeFilterKey', filter), typeFilterKey: typeKeys, isSelectAllFilter: false } }));

        setTypes(newTypes);

        //clear select in all filter 
        clearSelectInAllFilter();

    }

    // clearing filter of type and developer 
    const clearTypeAndDevFilter = useCallback(() => {

        //reset type filter 
        const resetTypeFilter = types.map((obj) => ({ ...obj, isChecked: false }));
        setTypes(resetTypeFilter);

        //reset dev filter and team
        const resetDevFilter = developers.dataWithCheckBox.map((obj) => ({ ...obj, isChecked: false }));
        setFilterDevList(resetDevFilter);
        dispatch(setDevelopers({ developers: { isTeamFilter: false, isAny: false, dataWithCheckBox: resetDevFilter } }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [developers])

    const clearSelectInAllFilter = useCallback(() => {
        const newSelectInAll = selectInAll.map((obj) => ({ ...obj, isChecked: false }));
        setSelectInAll(newSelectInAll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectInAll])

    const handelSelectInAllClick = (e) => {
        const newSelectInAll = selectInAll.map((obj) => {
            if (obj.name === e.target.name) {
                return ({ ...obj, isChecked: e.target.checked });
            } else return obj;
        })

        setSelectInAll(newSelectInAll);
        const statusSelectInAll = newSelectInAll[0].isChecked || newSelectInAll[1].isChecked;

        //clear type filter and dev Filter 
        if (statusSelectInAll) {
            clearTypeAndDevFilter();
            setTeam('Select Team')
            // update filter in store 
            dispatch(setFilter({ filter: { ...filter, isAny: statusSelectInAll, isSelectAllFilter: statusSelectInAll, typeFilterKey: [], developerFilterKey: [], isTeamFilter: false } }));
        } else {
            dispatch(setFilter({ filter: { ...filter, isAny: isAnyOtherFilter('isSelectAllFilter', filter), isSelectAllFilter: false } }));
        }
    }



    const handelDevClick = (e, currFilter) => {
        const newDevFilter = developers.dataWithCheckBox.map((obj) => {
            if (obj.name === e.target.name) {
                return { ...obj, isChecked: e.target.checked }
            }
            else return obj
        })

        //check if any developer is selected 
        const developerKeys = [];
        let isAnyStatus = false;
        newDevFilter.forEach((dev) => {
            if (dev.isChecked) {
                isAnyStatus = true
                developerKeys.push(dev.name);
            };
        })

        //updating store 
        dispatch(setFilter({ filter: { ...currFilter, isAny: isAnyStatus || isAnyOtherFilter('developerFilterKey', currFilter), developerFilterKey: developerKeys, isSelectAllFilter: false, isTeamFilter: false } }));
        dispatch(setDevelopers({ developers: { isAny: isAnyStatus, dataWithCheckBox: newDevFilter } }));

        //clear select in all filter
        clearSelectInAllFilter();
        setTeam('Select Team')

    }

    const handleSearch = (e) => {
        const key = e.target.value;
        const filteredDevList = developers.dataWithCheckBox.filter((obj) => {
            return obj.name.toLowerCase().includes(key.toLowerCase())
        })
        setFilterKey(e.target.value);
        setFilterDevList(filteredDevList);
    }

    const filterDiscussionData = (discussionData) => {
        if (filter.isAny) {
            // if isSelectAll filter 
            const isSelectAllFilterTrue = filter.isSelectAllFilter;
            dispatch(setLoading({ isLoading: true }));

            if (isSelectAllFilterTrue) {
                let data = [];
                if (selectInAll[0].isChecked) {
                    data = GetUnAnsweredData(discussionData);
                } else {
                    data = GetNoRepliedData(discussionData);
                }
                dispatch(setFilteredDiscussionData({ filteredDiscussionData: data }))
                return;
            } else {
                dispatch(setFilteredDiscussionData({ filteredDiscussionData: getFilteredDataOnFilter(discussionData, filter.developerFilterKey, filter.typeFilterKey) }))
            }
        } else {
            dispatch(setFilteredDiscussionData({ filteredDiscussionData: [] }))
        }
    }

    const updateDeveloperDataInStore = useCallback((repoName) => {
        const iTwinData = JSON.parse(localStorage.getItem('iTwinData'))
        const selectedRepo = iTwinData.repositories.filter(repoDetails => repoDetails.repositoryName === repoName);
        // update developers
        const allDeveLopersWithCheckBox = Array.from(getAllDevelopers(selectedRepo[0].discussionData)).map((obj) => ({ isChecked: false, name: obj }))
        dispatch(setDevelopers({ developers: { isAny: false, dataWithCheckBox: allDeveLopersWithCheckBox } }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // update store
    useEffect(() => {
        // update discussion data 
        const iTwinData = JSON.parse(localStorage.getItem('iTwinData'))
        const selectedRepo = iTwinData.repositories.filter(repoDetails => repoDetails.repositoryName === activeRepository);

        dispatch(setDiscussionData({ discussionData: selectedRepo[0].discussionData }));

        // update developers
        if (!developers.isAny) {
            const allDeveLopersWithCheckBox = Array.from(getAllDevelopers(selectedRepo[0].discussionData)).map((obj) => ({ isChecked: false, name: obj }))
            dispatch(setDevelopers({ developers: { isAny: false, dataWithCheckBox: allDeveLopersWithCheckBox } }));
        }

        // update filteredDiscussionData if any
        if (filter.isAny) {
            filterDiscussionData(selectedRepo[0].discussionData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRepository, filter])

    useEffect(() => {
        filterDiscussionData(discussionData);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])


    useEffect(() => {
        const filteredDevList = developers.dataWithCheckBox.filter((obj) => {
            return obj.name.toLowerCase().includes(filterKey.toLowerCase())
        })
        setFilterDevList(filteredDevList);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [developers])

    let count = 0;
    return (
        <div >
            <div className="filter-main-container">
                <div className="first-div">
                    <div className='select-repo'>
                        <Headline className="filter-subtitle  ">Select Repository</Headline>
                        <div>
                            <DropdownButton size='small' menuItems={(close) => getMenuItemsForRepo(close, filter)}>
                                {activeRepository}
                            </DropdownButton>
                        </div>
                    </div>
                    <div className='selectType-div'>
                        <Headline className="filter-subtitle" style={{ marginTop: '-25px' }}>Select Type</Headline>
                        <div className="filter-checkBox">
                            {types.map((obj, index) => <Checkbox key={obj.id} label={obj.label} name={obj.name} checked={obj.isChecked} onChange={(e) => handelTypeClick(e, types)} style={{ marginRight: '10px' }} />)}
                        </div>
                    </div>
                    <div>
                        <Headline className="filter-subtitle">Select In All</Headline>
                        <div className="filter-checkBox">
                            {selectInAll.map((obj, index) => <Checkbox key={obj.id} label={obj.label} name={obj.name} checked={obj.isChecked} onChange={handelSelectInAllClick} style={{ marginRight: '10px' }} />)}
                        </div>
                    </div>
                    <div >
                        <Headline className="filter-subtitle" >Selected Developers</Headline>
                        {
                            developers.isAny && developers.dataWithCheckBox.length !== 0 ?
                                <>
                                    <div style={{ maxWidth: '200px', maxHeight: '100px', overflow: 'scroll', marginTop: '-30px', border: '1px solid lightgray', paddingLeft: '5px' }}>
                                        {
                                            developers.dataWithCheckBox.map((obj, index) => {
                                                if (obj.isChecked) {
                                                    count++;
                                                    return <Checkbox key={index} label={obj.name} name={obj.name} checked={obj.isChecked} onChange={(e) => handelDevClick(e, filter)} />
                                                } else return null
                                            })
                                        }
                                    </div>
                                    <p style={{ marginTop: '-1px' }}> Selected Developers:  {count}</p>
                                </>
                                : <div style={{ height: '50px', width: '180px', border: '0.5px solid red', textAlign: 'center', color: 'red', fontSize: '0.7rem', marginTop: '-30px', paddingTop: '10px' }}>No Developer</div>
                        }
                    </div>
                </div>
                <div className="second-div">
                    <div className='select-repo'>
                        <Headline className="filter-subtitle  ">Select Team</Headline>
                        <div className="">
                            <DropdownButton size='small' menuItems={(close) => getMenuItemsForTeam(close, filter)}>
                                {activeTeam}
                            </DropdownButton>
                        </div>
                    </div>
                    <div >
                        <Headline className="filter-subtitle" style={{ marginTop: '-25px' }}>Select developer</Headline>
                        <div style={{ marginTop: '-25px' }} >
                            <Input placeholder='Search developer' size="medium" name={'inputFilter'} value={filterKey} onChange={handleSearch} />
                            {filteredDevList.length === 0 ? <div style={{ height: '100px', border: '1px solid red', textAlign: 'center', paddingTop: '35px', color: 'red', fontSize: '0.7rem' }}>No Developer</div>
                                : <>
                                    <div style={{ maxHeight: '190px', overflow: 'scroll', border: '1px solid skyblue', paddingLeft: '5px' }}>
                                        {
                                            filteredDevList.map((obj, index) => (
                                                <Checkbox key={index} label={obj.name} name={obj.name} checked={obj.isChecked} onChange={(e) => handelDevClick(e, filter)} />
                                            ))
                                        }
                                    </div>
                                    <p style={{ marginTop: '-1px' }}>Total Developers: {developers?.dataWithCheckBox?.length}</p>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default MultiInputFilter