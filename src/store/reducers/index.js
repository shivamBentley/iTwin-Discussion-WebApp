// third-party
import { combineReducers } from 'redux';

// project import
import discussions from './discussions';
import toast from './toast'
import dialog from './dialog';
import column from './column';
// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({ discussions, toast, dialog, column });

export default reducers;