// types
import { createSlice } from '@reduxjs/toolkit';

const localStorageDiscussionData = JSON.parse(localStorage.getItem('iTwinDiscussionData'));

// initial state
const initialState = {
    discussionData: (localStorageDiscussionData),
    developers: [],
    repoName: '',
    owner: '',
    filteredDiscussionData: [], // to show the table
    filter: {
        typeFilterKey: [],
        developerFilterKey: []
    }
};

// ==============================|| SLICE - discussionData ||============================== //

const discussion = createSlice({
    name: 'discussion',
    initialState,
    reducers: {
        setDiscussionData(state, action) {
            const { discussionData } = action.payload;
            state.discussionData = discussionData;
        },
        setDevelopers(state, action) {
            const { developers } = action.payload;
            state.developers = developers;
        },

        setRepo(state, action) {
            const { repoName } = action.payload;
            state.repoName = repoName;
        },
        setOwner(state, action) {
            const { owner } = action.payload;
            state.owner = owner;
        },

        setExportToExcelData(state, action) {
            const { exportToExcelData } = action.payload;
            state.exportToExcelData = exportToExcelData;
        },

        setFilteredDiscussionData(state, action) {
            const { filteredDiscussionData } = action.payload;
            state.filteredDiscussionData = filteredDiscussionData;
        },
        setFilter(state, action) {
            const { filter } = action.payload;
            state.filter = filter;
        },
    }
});

export default discussion.reducer;

export const {
    setDiscussionData,
    setDevelopers,
    setRepo,
    setOwner,
    setExportToExcelData,
    setFilteredDiscussionData,
    setFilter
} = discussion.actions;