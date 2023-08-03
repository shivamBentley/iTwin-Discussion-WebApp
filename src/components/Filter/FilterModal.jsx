import React, { useEffect, useState } from 'react';
import { Button, Dialog } from '@itwin/itwinui-react';
import { useDispatch, useSelector } from 'react-redux';
// import { setActiveRepos, setDateRangeFilter, setDevelopers, setFilter, setFilteredDiscussionData, setLoading } from '../../store/reducers/discussions';
import MultiInputFilter from './MultiInputFilter'
import './MultiInputFilter.scss'
import { useCallback } from 'react';
import { iTwinDetails } from '../../db/local-database';
import userConfiguration from '../../db/userConfig.json'
import { setActiveRepos, setDateRangeFilter, setDevelopers, setDiscussionData, setFilter, setFilteredDiscussionData, setLoading } from '../../store/reducers/discussions';
import { GetNoRepliedData, GetUnAnsweredData, filteredDiscussionDataByDateRange, getAllDevelopers, getFilteredDataOnFilter } from '../../helper/discussion';
import { arrayUnion, comparatorFunc } from '../../helper/util';

export const FilterModal = ({ setDateRangeForUserConfig }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const developers = useSelector((state) => state.discussions.developers);
    const activeRepositories = useSelector((state) => state.discussions.activeRepositories);
    const [isDateRangeEnable, setDateRangeEnable] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date()
    });
    const filter = useSelector((state) => state.discussions.filter);
    const [reset, forceReset] = useState(false);
    const [activeTeam, setTeam] = useState('Select Team')


    //Type filter 
    const [types, setTypes] = useState([
        { id: 1, isChecked: false, name: 'answer', label: 'Answered' },
        { id: 2, isChecked: false, name: 'comments', label: 'Commented' },
        { id: 3, isChecked: false, name: 'asked', label: 'Asked' },
        { id: 4, isChecked: false, name: 'replies', label: "Comment's Reply" },
    ])

    //selectInALl filter 
    const [selectInAll, setSelectInAll] = useState([
        { id: 1, isChecked: false, name: 'unanswered', label: 'Unanswered' },
        { id: 2, isChecked: false, name: 'noReply', label: 'No Reply' },
    ])

    // Active Repositories
    const [selectedRepos, selectRepos] = useState(() => iTwinDetails.repositories.map((repoName) => (
        { id: repoName, isChecked: false, name: repoName, label: repoName }
    )), [])

    const dispatch = useDispatch();

    const closeDialog = () => {
        setIsOpen(false);
    };

    const onClose = (event) => {
        closeDialog();
    };

    const handleDateRange = (selectedDateRange) => {
        setDateRangeForUserConfig(selectedDateRange);
        setDateRange(selectedDateRange);
    }

    const resetButtonHandle = useCallback(() => {
        if (userConfiguration.isUserConfigEnable) {
            // check selected repositories
            const selectedRepositories = userConfiguration.userConfig.filter.repositories;
            //updating repositories in active repositories
            dispatch(setActiveRepos({ activeRepositories: selectedRepositories }))

            const iTwinData = JSON.parse(localStorage.getItem('iTwinData'))

            // merge all selected repo data.
            let selectedRepo = [];
            iTwinData.repositories.forEach(repoDetails => {
                if (selectedRepositories.find((ele) => ele === repoDetails.repositoryName)) {
                    selectedRepo = [...selectedRepo, ...repoDetails.discussionData];
                }
            });

            // update discussion data in store 
            dispatch(setDiscussionData({ discussionData: selectedRepo }));

            let filteredData = [];

            // check either selectType filter or selectInAll filter applied or not
            const isAnyTypeOrSelectInAllFilter = userConfiguration.userConfig.filter.selectInAll.length > 0 || userConfiguration.userConfig.filter.selectType.length > 0;
            if (!isAnyTypeOrSelectInAllFilter) {
                filteredData = selectedRepo;
            }

            // if selectInAll Enabled 
            if (userConfiguration.userConfig.filter.selectInAll.length > 0) {
                const keys = userConfiguration.userConfig.filter.selectInAll;
                keys.forEach((key) => {
                    if (key === "unanswered") {
                        const unansweredData = GetUnAnsweredData(selectedRepo);
                        filteredData = arrayUnion(filteredData, unansweredData, comparatorFunc);
                    } else {
                        const noRepliedData = GetNoRepliedData(selectedRepo);
                        filteredData = arrayUnion(filteredData, noRepliedData, comparatorFunc);
                    }
                })
            }
            // if selectType or developer filter Enabled
            else if (userConfiguration.userConfig.filter.selectType.length > 0 || userConfiguration.userConfig.filter.selectedDevelopers.length > 0) {
                const typeFilterKeys = userConfiguration.userConfig.filter.selectType;
                const selectedDevelopers = userConfiguration.userConfig.filter.selectedDevelopers;
                filteredData = getFilteredDataOnFilter(selectedRepo, selectedDevelopers, typeFilterKeys)

            }

            // set Developers in store with checkBox 
            if (filteredData.length > 0) {
                let isAnyDevSelected = false;
                const allDeveLopersWithCheckBox = Array.from(getAllDevelopers(selectedRepo)).map((obj) => ({ isChecked: false, name: obj }));
                const updatedAllDeveLopersWithCheckBox = allDeveLopersWithCheckBox.map((obj) => {
                    if (userConfiguration.userConfig.filter.selectedDevelopers.find((element) => element === obj.name)) {
                        isAnyDevSelected = true;
                        return ({ ...obj, isChecked: true });
                    }
                    else return obj
                })
                dispatch(setDevelopers({ developers: { isAny: isAnyDevSelected, dataWithCheckBox: updatedAllDeveLopersWithCheckBox } }));
            }

            // set filter in store 
            const filterObj = userConfiguration.userConfig.filter;
            const isAnyFilter = filterObj.selectType.length > 0 || filterObj.selectedDevelopers.length > 0 || filterObj.selectInAll.length > 0;

            if (isAnyFilter) {
                const currFilterStatus = {
                    isAny: isAnyFilter,
                    typeFilterKey: filterObj.selectType,
                    developerFilterKey: filterObj.selectedDevelopers,
                    isTeamFilter: false,
                    isSelectAllFilter: filterObj.selectInAll.length > 0,
                }

                dispatch(setFilter({ filter: currFilterStatus }));
            }

            // Apply date filter if enabled
            if (userConfiguration.userConfig.filter.dateRange.isEnable) {
                const { startDate, endDate } = userConfiguration.userConfig.filter.dateRange;

                // set store filed for date range - isDateRange
                filteredData = filteredDiscussionDataByDateRange(filteredData, startDate, endDate);
                dispatch(setDateRangeFilter({ isDateRangeFilter: true }));
            }

            // update filteredDiscussionData in store data in store 
            if (isAnyFilter || userConfiguration.userConfig.filter.dateRange.isEnable)
                dispatch(setFilteredDiscussionData({ filteredDiscussionData: filteredData }));
            forceReset(!reset);

        } else {
            // reset discussion data to primary repo discussion data.
            if (iTwinDetails.primaryRepo !== '') {
                const newSelectedRepos = selectedRepos.map((obj) => {
                    if (obj.name !== iTwinDetails.primaryRepo) {
                        return { id: obj.name, isChecked: false, name: obj.name, label: obj.name }
                    } else return { id: obj.name, isChecked: true, name: obj.name, label: obj.name }
                });
                selectRepos(newSelectedRepos);
                dispatch(setActiveRepos({ activeRepositories: [iTwinDetails.primaryRepo] }));
            }

            // reset active team to none
            setTeam('Select Team')

            // reset type filter
            const newTypeFilter = types.map((obj) => ({ ...obj, isChecked: false }));
            setTypes(newTypeFilter);

            // reset devFilter 
            const resetDataWithCheckBox = developers.dataWithCheckBox.map((obj) => ({ ...obj, isChecked: false }));
            dispatch(setDevelopers({ developers: { isAny: false, dataWithCheckBox: resetDataWithCheckBox } }));

            // reset selectInAllFilter 
            const newSelectInAllFilter = selectInAll.map((obj) => ({ ...obj, isChecked: false }));
            setSelectInAll(newSelectInAllFilter);

            //Resetting filter in store
            dispatch(setFilter({
                filter: {
                    isAny: false,
                    typeFilterKey: [],
                    developerFilterKey: [],
                    isTeamFilter: false,
                    isSelectAllFilter: false
                }
            }))

            // Resetting Date Range Filter 
            dispatch(setDateRangeFilter({ isDateRangeFilter: false }));
            setDateRangeEnable(false)

            // Flushing Filtered Data from filteredDiscussionData
            dispatch(setFilteredDiscussionData({ filteredDiscussionData: [] }));
            dispatch(setLoading({ isLoading: true }));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        //get primary repo
        const newSelectedRepos = selectedRepos.map((obj) => {
            if (activeRepositories.find(element => element === obj.name)) {
                return { id: obj.name, isChecked: true, name: obj.name, label: obj.name }
            } else return obj
        });
        selectRepos(newSelectedRepos);



        // Updating UI filter Dialog corresponding to userConfiguration.userConfig.json 
        if (filter.isAny) {
            const { typeFilterKey, developerFilterKey } = filter;

            if (userConfiguration.userConfig.filter.selectInAll.length > 0) {
                const newSelectInAll = selectInAll.map((obj) => {
                    if (userConfiguration.userConfig.filter.selectInAll.find(element => element === obj.name)) {
                        return { id: obj.name, isChecked: true, name: obj.name, label: obj.name }
                    } else return obj;
                })
                setSelectInAll(newSelectInAll)
            } else if (userConfiguration.userConfig.filter.selectType.length > 0) {
                const newTypes = types.map((obj) => {
                    if (typeFilterKey.find(element => element === obj.name)) {
                        return { id: obj.name, isChecked: true, name: obj.name, label: obj.name }
                    } else return obj;
                })
                setTypes(newTypes)
            }

            if (developerFilterKey.length > 0) {
                const devloperListWithCheckBox = developers.dataWithCheckBox.map((obj) => {
                    if (developerFilterKey.find(element => element === obj.name)) {
                        return ({ ...obj, isChecked: true })
                    } else return ({ ...obj, isChecked: false })
                });
                dispatch(setDevelopers({ developers: { isAny: true, dataWithCheckBox: devloperListWithCheckBox } }));
            }

            if (userConfiguration.userConfig.filter.dateRange.isEnable) {
                const { startDate, endDate } = userConfiguration.userConfig.filter.dateRange;
                setDateRange({
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                })
                setDateRangeEnable(true);
                dispatch(setDateRangeFilter({ isDateRangeFilter: true }));
            }
        }


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRepositories, reset])

    return (
        <>
            <Button styleType='high-visibility' onClick={() => setIsOpen(true)}>
                Filter
            </Button>
            <Dialog
                isOpen={isOpen}
                onClose={onClose}
                closeOnEsc
                isDismissible
                isDraggable
            // isResizable
            >
                <Dialog.Main style={{ Width: '250px', height: '530px' }}>
                    <Dialog.TitleBar titleText='Filter discussion data' />
                    <Dialog.Content>
                        <MultiInputFilter
                            selectInAll={selectInAll}
                            setSelectInAll={setSelectInAll}
                            types={types}
                            setTypes={setTypes}
                            // resetButtonHandle={resetButtonHandle}
                            isDateRangeEnable={isDateRangeEnable}
                            setDateRangeEnable={setDateRangeEnable}
                            dateRange={dateRange}
                            setDateRange={handleDateRange}
                            activeTeam={activeTeam}
                            setTeam={setTeam}
                            selectedRepos={selectedRepos}
                            selectRepos={selectRepos}

                        />
                    </Dialog.Content>
                    <Dialog.ButtonBar
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Button styleType='high-visibility' onClick={resetButtonHandle}>Reset</Button>
                        <Button onClick={onClose} >Close</Button>
                    </Dialog.ButtonBar>
                </Dialog.Main>
            </Dialog>
        </>
    );
};