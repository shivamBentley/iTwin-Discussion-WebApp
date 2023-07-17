// third-party
import { combineReducers } from 'redux';

// project import
import discussions from './discussions';
import toast from './toast'
import dialog from './dialog';
// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({ discussions, toast, dialog });

export default reducers;