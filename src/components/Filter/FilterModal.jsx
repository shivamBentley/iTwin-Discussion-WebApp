import React, { useState } from 'react';
import { Button, Dialog } from '@itwin/itwinui-react';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRangeFilter, setDevelopers, setDiscussionData, setFilter, setFilteredDiscussionData, setLoading, setRepositoryName } from '../../store/reducers/discussions';
import MultiInputFilter from './MultiInputFilter'
import './MultiInputFilter.scss'
import { useCallback } from 'react';
import { iTwinDetails } from '../../db/local-database';

export const FilterModal = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const developers = useSelector((state) => state.discussions.developers)
    const [isDateRangeEnable, setDateRangeEnable] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date()
    });
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

    const dispatch = useDispatch();

    const closeDialog = () => {
        setIsOpen(false);
    };

    const onClose = (event) => {
        closeDialog();
    };

    const resetButtonHandle = useCallback(() => {

        // reset discussion data to primary repo discussion data.
        if (iTwinDetails.primaryRepo !== '')
            dispatch(setRepositoryName({ repositoryName: iTwinDetails.primaryRepo }));

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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Button styleType='high-visibility' size='small' onClick={() => setIsOpen(true)}>
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
                            setDateRange={setDateRange}
                            activeTeam = {activeTeam}
                            setTeam = {setTeam}
                        />
                    </Dialog.Content>
                    <Dialog.ButtonBar>
                        <Button styleType='high-visibility' onClick={resetButtonHandle}>Reset</Button>
                    </Dialog.ButtonBar>
                </Dialog.Main>
            </Dialog>
        </>
    );
};