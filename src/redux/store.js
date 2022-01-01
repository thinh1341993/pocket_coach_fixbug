import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {userFBReducer, postsFBReducer, postFBReducer, getErrorsReducer, likesFBReducer, myPostsFBReducer, commentsReducer, coachsReducer, adminsReducer, getNotificationCountReducer, getNotificationsReducer, getChatCoachReducer, getChatAdminReducer} from './reducers';

const rootReducer = combineReducers({userFBReducer,postsFBReducer, getErrorsReducer, postFBReducer, likesFBReducer, myPostsFBReducer, commentsReducer, coachsReducer, adminsReducer, getNotificationCountReducer, getNotificationsReducer, getChatCoachReducer, getChatAdminReducer});

export const store = createStore(rootReducer, applyMiddleware(thunk));