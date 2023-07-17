// types
import { createSlice } from '@reduxjs/toolkit';

// initial state
const initialState = {
    dialogState: {
        id: '',
        title: '',
        currDiscussionUrl: '',
        tagsAndUrl: {
            bodyTags:[],
            titleTags:[]
        },
        isOpen: false,
    }
};

// ==============================|| SLICE - discussionData ||============================== //

const dialog = createSlice({
    name: 'dialogState',
    initialState,
    reducers: {
        DIALOGSTATEACTION(state, action) {
            const { newState } = action.payload;
            if (newState.isOpen === false)
                state.dialogState = {...initialState.dialogState};
            else {
                state.dialogState = newState;
            }
        },
    }
});

export default dialog.reducer;

export const {
    DIALOGSTATEACTION
} = dialog.actions;