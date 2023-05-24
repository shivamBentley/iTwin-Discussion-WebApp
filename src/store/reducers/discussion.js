// types
import { createSlice } from '@reduxjs/toolkit';

/* Project Imports */
import {
    //getter function
    getLocalStorageDiscussionData,

} from '../../helper/GitHubAPIs';
import { getAllDevelopers } from '../../helper/util';

const localStorageDiscussionData = JSON.parse(localStorage.getItem('iTwinDiscussionData'));

// initial state
const initialState = {
    discussionData: (localStorageDiscussionData),
    developers: getAllDevelopers(localStorageDiscussionData.discussionData),
    repoName: '',
    owner: '',
    exportToExcelData: [],
    listData: [], // to show the table
    filter: {
        status: false,
        typeFilter: {
            status: false,
            filter: []
        },
        developerFilter: {
            status: false,
            filter: []
        }
    }
};

// ==============================|| SLICE - discussionData ||============================== //

const discussion = createSlice({
    name: 'discussion',
    initialState,
    reducers: {
        setDiscussionData(state, action) {
            const { discussionData } = action.payload;
            console.log(discussionData)
            // state.discussionData = discussionData;
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

        setListData(state, action) {
            const { listData } = action.payload;
            state.listData = listData;
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
    setListData,
    setFilter
} = discussion.actions;