// types
import { createSlice } from '@reduxjs/toolkit';

// initial state
const initialState = {
    columnState: {
        title: true,
        repository: true,
        questionBy: true,
        category: true,
        comments: true,
        replies: true,
        status: true,
        closed: true,
        updated: true,
        created: true
    },
    lastCol: 'created'
};

// ==============================|| SLICE - discussionData ||============================== //

const column = createSlice({
    name: 'columnState',
    initialState,
    reducers: {
        setColumnState(state, action) {
            const { columnState } = action.payload;
            state.columnState = columnState;

            //set last column
            let lastCol = 'created';
            Object.keys(columnState).forEach(key => {
                if (columnState[key]) {
                    lastCol = key;
                }
            });
            if (lastCol !== 'created') {
                state.lastCol = lastCol;
            }
        },
    }
});

export default column.reducer;

export const {
    setColumnState
} = column.actions;