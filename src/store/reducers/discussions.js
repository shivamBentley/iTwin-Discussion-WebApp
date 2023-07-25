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
    activeRepositories: [],
    owner: 'iTwin',
    filteredDiscussionData: [],
    isLoading: true,
    filter: {
        isAny: false,
        typeFilterKey: [],
        developerFilterKey: [],
        isTeamFilter: false,
        isSelectAllFilter: false,
    },
    isDateRangeFilter: false,
    isSmartSearch: {
        col: 0,
        status: false,
        data: []
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

        setActiveRepos(state, action) {
            const { activeRepositories } = action.payload;
            state.activeRepositories = activeRepositories;
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
        setDateRangeFilter(state, action) {
            const { isDateRangeFilter } = action.payload;
            state.isDateRangeFilter = isDateRangeFilter;
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
        },
        setSmartSearch(state, action) {
            const { searchDetails } = action.payload;
            state.isSmartSearch = searchDetails;
        }
    }
});

export default discussions.reducer;

export const {
    setDiscussionData,
    setDevelopers,
    setActiveRepos,
    setOwner,
    setExportToExcelData,
    setFilteredDiscussionData,
    setFilter,
    setDateRangeFilter,
    setLoading,
    setRateLimit,
    setLastUpdated,
    setSmartSearch
} = discussions.actions;