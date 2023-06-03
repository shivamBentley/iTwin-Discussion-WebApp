// third-party
import { combineReducers } from 'redux';

// project import
import discussions from './discussions';
import toast from './toast'
// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({ discussions, toast});

export default reducers;