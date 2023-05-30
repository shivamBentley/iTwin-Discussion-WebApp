import React, { useEffect, useState } from 'react'
import './MultiInputFilter'
import {
    Checkbox, Headline, DropdownButton,
    MenuItem,
    Input
} from '@itwin/itwinui-react'
import { useDispatch, useSelector } from 'react-redux'
import { Teams, iTwinDetails } from '../../db/local-database'
import { setDevelopers, setDiscussionData, setFilteredDiscussionData, setRepositoryName } from '../../store/reducers/discussions'
import { GetNoRepliedData, GetUnAnsweredData, getAllDevelopers, getFilteredDataOnFilter } from '../../helper/util'
import { setFilter } from '../../store/reducers/discussions'

function MultiInputFilter({ types, setTypes, selectInAll, setSelectInAll }) {

    const activeRepository = useSelector((state) => state.discussions.repositoryName);
    const filter = useSelector(state => state.discussions.filter)
    const [filterKey, setFilterKey] = useState('');
    const [filteredData, setFilterData] = useState([]);
    const developers = useSelector((state) => state.discussions.developers)
    const [activeTeam, setTeam] = useState('Select Team')
    const dispatch = useDispatch();
    const discussionData = useSelector((state) => (state.discussions.discussionData))

    //menuItem list 
    const getMenuItemsForRepo = (close) => {
        const menuItems = iTwinDetails.repositories.map((repo, index) => {
            return <MenuItem key={index} onClick={() => {
                dispatch(setRepositoryName({ repositoryName: repo }));
                updateDeveloperDataInStore();
                setTeam("Select Team");
                dispatch(setFilter({ filter: { ...filter, developerFilterKey: [] } }));
                close();
            }}

            >{repo}</MenuItem>
        })
        return menuItems;
    }

    const getMenuItemsForTeam = (close) => {
        const menuItems = Teams.map((obj, index) => {
            return <MenuItem key={index} name={obj.teamName} onClick={(e) => {
                setTeam(obj.teamName);
                const newDevelopers = [];
                const devFilterKeys = [];
                developers.dataWithCheckBox.forEach((devWithCheckBox) => {
                    obj.teamMembers.forEach((teamDev) => {
                        if (teamDev.GitHubLogin === devWithCheckBox.name) {
                            newDevelopers.push({ ...devWithCheckBox, isChecked: true });
                            devFilterKeys.push(teamDev.GitHubLogin);
                        }
                        else newDevelopers.push({ ...devWithCheckBox, isChecked: false });
                    })
                })

                dispatch(setDevelopers({ developers: { isAny: true, dataWithCheckBox: newDevelopers } }));
                dispatch(setFilter({ filter: { ...filter, developerFilterKey: devFilterKeys, isAny: devFilterKeys.length !== 0 || isAnyOtherFilter('isTeamFilter'), isTeamFilter: devFilterKeys !== 0 } }))

                //clear select in all filter
                clearSelectInAllFilter();
                close();
            }}

            >{obj.teamName}</MenuItem>
        })
        return menuItems;
    }

    const isAnyOtherFilter = (FilterType) => {
        switch (FilterType) {
            case 'typeFilterKey':
                return filter.developerFilterKey?.length !== 0 || filter.isTeamFilter || filter.isSelectAllFilter
            case 'developerFilterKey':
                return filter.typeFilterKey?.length !== 0 || filter.isTeamFilter || filter.isSelectAllFilter
            case 'isTeamFilter':
                return filter.developerFilterKey?.length !== 0 || filter.typeFilterKey?.length !== 0 || filter.isSelectAllFilter
            case 'isSelectAllFilter':
                return filter.developerFilterKey?.length !== 0 || filter.isTeamFilter || filter.typeFilterKey?.length !== 0
            default:
                break;
        }
    }

    const handelTypeClick = (e) => {
        const newTypes = types.map((obj) => {
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
        dispatch(setFilter({ filter: { ...filter, isAny: isAnyStatus || isAnyOtherFilter('typeFilterKey'), typeFilterKey: typeKeys, isSelectAllFilter: false } }));

        setTypes(newTypes);

        //clear select in all filter 
        clearSelectInAllFilter();

    }

    // clearing filter of type and developer 
    const clearTypeAndDevFilter = () => {

        //reset type filter 
        const resetTypeFilter = types.map((obj) => ({ ...obj, isChecked: false }));
        setTypes(resetTypeFilter);

        //reset dev filter and team
        const resetDevFilter = developers.dataWithCheckBox.map((obj) => ({ ...obj, isChecked: false }));
        setFilterData(resetDevFilter);
        dispatch(setDevelopers({ developers: { isTeamFilter: false, isAny: false, dataWithCheckBox: resetDevFilter } }));
    }

    const clearSelectInAllFilter = () => {
        const newSelectInAll = selectInAll.map((obj) => ({ ...obj, isChecked: false }));
        setSelectInAll(newSelectInAll);
    }

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
            dispatch(setFilter({ filter: { ...filter, isAny: isAnyOtherFilter('isSelectAllFilter'), isSelectAllFilter: false } }));
        }
    }



    const handelDevClick = (e) => {
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
        dispatch(setFilter({ filter: { ...filter, isAny: isAnyStatus || isAnyOtherFilter('developerFilterKey'), developerFilterKey: developerKeys, isSelectAllFilter: false, isTeamFilter: false } }));
        dispatch(setDevelopers({ developers: { isAny: isAnyStatus, dataWithCheckBox: newDevFilter } }));

        //clear select in all filter
        clearSelectInAllFilter();
        setTeam('Select Team')

    }

    const handleSearch = (e) => {
        const key = e.target.value;
        const filteredData = developers.dataWithCheckBox.filter((obj) => {
            return obj.name.toLowerCase().includes(key.toLowerCase())
        })
        setFilterKey(e.target.value);
        setFilterData(filteredData);
    }

    const filterDiscussionData = (discussionData) => {
        console.log('filtering data from store')
        if (filter.isAny) {
            // if isSelectAll filter 
            const isSelectAllFilterTrue = filter.isSelectAllFilter;

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

    const updateDeveloperDataInStore = () => {
        const iTwinData = JSON.parse(localStorage.getItem('iTwinData'))
        const selectedRepo = iTwinData.repositories.filter(repoDetails => repoDetails.repositoryName === activeRepository);
        // update developers
        const allDeveLopersWithCheckBox = Array.from(getAllDevelopers(selectedRepo[0].discussionData)).map((obj) => ({ isChecked: false, name: obj }))
        // console.log(allDeveLopersWithCheckBox);

        dispatch(setDevelopers({ developers: { isAny: false, dataWithCheckBox: allDeveLopersWithCheckBox } }));
    }

    // update store
    useEffect(() => {
        // update discussion data 
        const iTwinData = JSON.parse(localStorage.getItem('iTwinData'))
        const selectedRepo = iTwinData.repositories.filter(repoDetails => repoDetails.repositoryName === activeRepository);

        dispatch(setDiscussionData({ discussionData: selectedRepo[0].discussionData }));

        // update developers
        if (!developers.isAny) {
            const allDeveLopersWithCheckBox = Array.from(getAllDevelopers(selectedRepo[0].discussionData)).map((obj) => ({ isChecked: false, name: obj }))
            // console.log(allDeveLopersWithCheckBox);

            dispatch(setDevelopers({ developers: { isAny: false, dataWithCheckBox: allDeveLopersWithCheckBox } }));
        }

        // update filteredDiscussionData if any
        if (filter.isAny) {
            filterDiscussionData(selectedRepo[0].discussionData);
        }
    }, [activeRepository, filter])

    useEffect(() => {
        filterDiscussionData(discussionData);
    }, [filter])


    useEffect(() => {
        const filteredData = developers.dataWithCheckBox.filter((obj) => {
            return obj.name.toLowerCase().includes(filterKey.toLowerCase())
        })
        setFilterData(filteredData);
    }, [developers])


    return (
        <div >
            <div className="filter-main-container">
                <div className="first-div">
                    <div className='select-repo'>
                        <Headline className="filter-subtitle  ">Select Repository</Headline>
                        <div>
                            <DropdownButton size='small' menuItems={getMenuItemsForRepo}>
                                {activeRepository}
                            </DropdownButton>
                        </div>
                    </div>
                    <div className='selectType-div'>
                        <Headline className="filter-subtitle" style={{ marginTop: '-25px' }}>Select Type</Headline>
                        <div className="filter-checkBox">
                            {types.map((obj) => <Checkbox label={obj.label} name={obj.name} checked={obj.isChecked} onChange={handelTypeClick} style={{ marginRight: '10px' }} />)}
                        </div>
                    </div>
                    <div>
                        <Headline className="filter-subtitle">Select In All</Headline>
                        <div className="filter-checkBox">
                            {selectInAll.map((obj) => <Checkbox label={obj.label} name={obj.name} checked={obj.isChecked} onChange={handelSelectInAllClick} style={{ marginRight: '10px' }} />)}
                        </div>
                    </div>
                    <div >
                        <Headline className="filter-subtitle" >Selected Developers</Headline>
                        {
                            developers.isAny ?
                                <div style={{ maxWidth: '200px', maxHeight: '100px', overflow: 'scroll', marginTop: '-30px', border: '1px solid lightgray', paddingLeft: '5px' }}>
                                    {
                                        developers.dataWithCheckBox.map((obj, index) => {
                                            if (obj.isChecked)
                                                return <Checkbox key={index} label={obj.name} name={obj.name} checked={obj.isChecked} onChange={handelDevClick} />
                                        })
                                    }
                                </div> :
                                <div style={{ fontSize: '0.7rem', color: 'red', paddingLeft: '10%' }}> <>No Selection</></div>
                        }
                    </div>
                </div>
                <div className="second-div">
                    <div className='select-repo'>
                        <Headline className="filter-subtitle  ">Select Team</Headline>
                        <div className="">
                            <DropdownButton size='small' menuItems={getMenuItemsForTeam}>
                                {activeTeam}
                            </DropdownButton>
                        </div>
                    </div>
                    <div >
                        <Headline className="filter-subtitle" style={{ marginTop: '-25px' }}>Select developer</Headline>
                        <div style={{ marginTop: '-25px' }} >
                            <Input placeholder='Search developer' size="medium" name={'inputFilter'} value={filterKey} onChange={handleSearch} />
                            <div style={{ maxHeight: '200px', overflow: 'scroll', border: '1px solid skyblue', paddingLeft: '5px' }}>
                                {
                                    filteredData.map((obj, index) => (
                                        <Checkbox key={index} label={obj.name} name={obj.name} checked={obj.isChecked} onChange={handelDevClick} />
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MultiInputFilter