import {GET_USER, GET_POSTS, GET_POST, GET_ERRORS, GET_LIKES, GET_MYPOSTS, GET_COMMENTS, GET_COACH, GET_ADMINS, GET_NOTIF_COUNT, GET_NOTIFS, GET_COACH_MSG, GET_ADMIN_MSG} from './actions';

const initialState = {
  userFB: {},
  postsFB: [],
  postFB: {},
  likesFB: [],
  errorsFB: [],
  myPostsFB: [],
  comments: [],
  coachs: [],
  admins: [],
  notifCount: 0,
  notifs: [],
  chatCoachMsg: [],
  chatAdminMsg: [],
};


export function userFBReducer(state = initialState, action) {
    switch (action.type) {
      case GET_USER:
        return {userFB: action.payload};
      default:
        return state;
    }
}

export function postsFBReducer(state = initialState, action) {
  switch (action.type) {
    case GET_POSTS:
      return {postsFB: action.payload};
    default:
      return state;
  }
}

export function postFBReducer(state = initialState, action) {
  switch (action.type) {
    case GET_POST:
      return {postFB: action.payload};
    default:
      return state;
  }
}

export function likesFBReducer(state = initialState, action) {
  switch (action.type) {
    case GET_LIKES:
      return {likesFB: action.payload};
    default:
      return state;
  }
}

export function myPostsFBReducer(state = initialState, action) {
  switch (action.type) {
    case GET_MYPOSTS:
      return {myPostsFB: action.payload};
    default:
      return state;
  }
}

export function commentsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_COMMENTS:
      return {comments: action.payload};
    default:
      return state;
  }
}

export function coachsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_COACH:
      return {coachs: action.payload};
    default:
      return state;
  }
}

export function adminsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ADMINS:
      return {admins: action.payload};
    default:
      return state;
  }
}

export function getNotificationCountReducer(state = initialState, action) {
  switch (action.type) {
    case GET_NOTIF_COUNT:
      return {notifCount: action.payload};;
    default:
      return state;
  }
}

export function getNotificationsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_NOTIFS:
      return {notifs: action.payload};;
    default:
      return state;
  }
}

export function getChatAdminReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ADMIN_MSG:
      return {chatAdminMsg: action.payload};;
    default:
      return state;
  }
}

export function getChatCoachReducer(state = initialState, action) {
  switch (action.type) {
    case GET_COACH_MSG:
      return {chatCoachMsg: action.payload};;
    default:
      return state;
  }
}

export function getErrorsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return {errorsFB: action.payload};;
    default:
      return state;
  }
}
