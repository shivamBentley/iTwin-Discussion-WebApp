import React, { useEffect, useState } from 'react';
import { Button, Dialog } from '@itwin/itwinui-react';
import { MultiInputFilter } from './MultiInputFilter';
import { getAllDevelopers } from '../helper/util';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, setFilteredDiscussionData } from '../store/reducers/discussion';

export const DraggableAndResizable = ({ isLoading }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [types, setTypes] = useState({
        answer: false,
        replies: false,
        comments: false
    });
    const [developers, setDeveloper] = useState([]);
    const discussionData = useSelector((state) => state.discussion.discussionData.discussionData);

    const dispatch = useDispatch();

    const closeDialog = () => {
        setIsOpen(false);
    };

    const onClose = (event) => {
        closeDialog();
    };

    const filterButtonHandle = (e) => {

        closeDialog();
    };

    const resetButtonHandle = () => {
        const newTypeFilter = {
            answer: false,
            replies: false,
            comments: false
        }

        const newDeveloperFilterData = developers.map((obj) => ({ name: obj.name, isChecked: false }))
        setTypes(newTypeFilter);
        setDeveloper(newDeveloperFilterData);

        //Resetting filter in store
        dispatch(setFilter({ filter: { status: false, developerFilterKey: [], typeFilterKey: [] } }))
        dispatch(setFilteredDiscussionData({ filteredDiscussionData: [] }))
    };

    useEffect(() => {
        const allDevelopers = Array.from(getAllDevelopers(discussionData));
        const allDeveLopersWithCheckBox = allDevelopers.map((developer) => ({ isChecked: false, name: developer }));
        setDeveloper(allDeveLopersWithCheckBox);
    }, [discussionData])

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
            // isDraggable
            // isResizable
            >
                <Dialog.Main>
                    <Dialog.TitleBar titleText='Filter discussion data' />
                    <Dialog.Content>
                        <MultiInputFilter types={types} setTypes={setTypes} setDeveloper={setDeveloper} developers={developers} />
                    </Dialog.Content>
                    <Dialog.ButtonBar>
                        <Button styleType='high-visibility' onClick={filterButtonHandle}>Filter</Button>
                        <Button onClick={resetButtonHandle}>Reset</Button>
                    </Dialog.ButtonBar>
                </Dialog.Main>
            </Dialog>
        </>
    );
};