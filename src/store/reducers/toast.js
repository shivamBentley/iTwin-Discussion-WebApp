// types
import { createSlice } from '@reduxjs/toolkit';

// initial state
const initialState = {
    toastState: {
        id:'',
        title: 'loading',
        status: 'success',
        autoClose: true,
        isOpen: false,
    },
    idToClose:''
};

// ==============================|| SLICE - discussionData ||============================== //

const toast = createSlice({
    name: 'discussions',
    initialState,
    reducers: {
        setToastState(state, action) {
            const { newState } = action.payload;
            state.toastState = newState;
        },
        removeToast(state, action) {
            const { id } = action.payload;
            state.idToClose = id;
        }
    }
});

export default toast.reducer;

export const {
    setToastState,
    removeToast
} = toast.actions;