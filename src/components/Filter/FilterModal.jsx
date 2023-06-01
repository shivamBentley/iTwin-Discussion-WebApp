import React, { useState } from 'react';
import { Button, Dialog } from '@itwin/itwinui-react';
import { useDispatch, useSelector } from 'react-redux';
import { setDevelopers, setFilter, setFilteredDiscussionData } from '../../store/reducers/discussions';
import MultiInputFilter from './MultiInputFilter'
import './MultiInputFilter.scss'

export const FilterModal = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const developers = useSelector((state) => state.discussions.developers)

    //Type filter 
    const [types, setTypes] = useState([
        { isChecked: false, name: 'answer', label: 'Answered' },
        { isChecked: false, name: 'replies', label: 'Replied' },
        { isChecked: false, name: 'comments', label: 'Comments' },
        { isChecked: false, name: 'asked', label: 'Asked' },
    ])

    //selectInALl filter 
    const [selectInAll, setSelectInAll] = useState([
        { isChecked: false, name: 'unanswered', label: 'Unanswered' },
        { isChecked: false, name: 'noReply', label: 'No Reply' },
    ])

    const dispatch = useDispatch();

    const closeDialog = () => {
        setIsOpen(false);
    };

    const onClose = (event) => {
        closeDialog();
    };

    const resetButtonHandle = () => {
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
        dispatch(setFilteredDiscussionData({ filteredDiscussionData: [] }))
    };

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

                style={{}}
            >
                <Dialog.Main style={{ Width: '250px', height: '480px' }}>
                    <Dialog.TitleBar titleText='Filter discussion data' />
                    <Dialog.Content>
                        <MultiInputFilter selectInAll={selectInAll} setSelectInAll={setSelectInAll} types={types} setTypes={setTypes} />
                    </Dialog.Content>
                    <Dialog.ButtonBar>
                        {/* <Button styleType='high-visibility' onClick={filterButtonHandle}>Filter</Button> */}
                        <Button onClick={resetButtonHandle}>Reset</Button>
                    </Dialog.ButtonBar>
                </Dialog.Main>
            </Dialog>
        </>
    );
};