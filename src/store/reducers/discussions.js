// types
import { createSlice } from '@reduxjs/toolkit';

// const iTwinData = JSON.parse(localStorage.getItem('iTwinData'));

// initial state
const initialState = {
    discussionData: [],
    developers: [],
    repositoryName: '',
    owner: 'iTwin',
    filteredDiscussionData: [],
    isLoading: true,
    filter: {
        isAny: false,
        typeFilterKey: [],
        developerFilterKey: [],
        isTeamFilter: false,
        isSelectAllFilter: false
    }
};

// ==============================|| SLICE - discussionData ||============================== //

const discussions = createSlice({
    name: 'discussions',
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

        setRepositoryName(state, action) {
            const { repositoryName } = action.payload;
            state.repositoryName = repositoryName;
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

export default discussions.reducer;

export const {
    setDiscussionData,
    setDevelopers,
    setRepositoryName,
    setOwner,
    setExportToExcelData,
    setFilteredDiscussionData,
    setFilter
} = discussions.actions;