// types
import { createSlice } from '@reduxjs/toolkit';

// const iTwinData = JSON.parse(localStorage.getItem('iTwinData'));

// initial state
const initialState = {
    discussionData: [],
    developers: {
        isAny: false,
        dataWithCheckBox: []
    },
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
    },
    rateLimit: {},
    lastUpdated: ''
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
        setLoading(state, action) {
            const { isLoading } = action.payload;
            state.isLoading = isLoading;
        },
        setRateLimit(state, action) {
            const { rateLimit } = action.payload;
            state.rateLimit = rateLimit;
        },
        setLastUpdated(state, action) {
            const { lastUpdated } = action.payload;
            state.lastUpdated = lastUpdated;
        }
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
    setFilter,
    setLoading,
    setRateLimit,
    setLastUpdated
} = discussions.actions;