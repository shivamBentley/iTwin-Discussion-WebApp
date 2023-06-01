import { configureStore } from '@reduxjs/toolkit';
import reducers from './reducers';
import {logger} from 'redux-logger'

// ==============================|| REDUX TOOLKIT - MAIN STORE ||============================== //

const store = configureStore({
    reducer: reducers,
    middleware: [logger]
});

const { dispatch } = store;

export { store, dispatch };