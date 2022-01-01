import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

export const GET_USER = 'GET_USER';
export const GET_POSTS = 'GET_POSTS';
export const GET_LIKES = 'GET_LIKES';
export const GET_MYPOSTS = 'GET_MYPOSTS';
export const GET_COMMENTS = 'GET_COMMENTS';
export const GET_COACH = 'GET_COACH';
export const GET_ADMINS = 'GET_ADMINS';
export const INC_NOTIF_COUNT = 'INC_NOTIF_COUNT';
export const DELETE_NOTIF_COUNT = 'DELETE_NOTIF_COUNT';
export const GET_NOTIF_COUNT = 'GET_NOTIF_COUNT';
export const GET_NOTIFS = 'GET_NOTIFS';
export const GET_COACH_MSG = 'GET_COACH_MSG';
export const GET_ADMIN_MSG = 'GET_ADMIN_MSG';
export const GET_POST = 'GET_POST';
export const GET_ERRORS = 'GET_ERRORS';


export const getErrors = () => {
  try {
    return async dispatch => {

      const signalisation = await firestore().collection('signalisation').orderBy('time', 'desc').get()
      //  eslint-disable-next-line no-unreachable
      //  console.log("collect_user", admins._docs );
      if (signalisation._docs) {
        dispatch({
          type: GET_ERRORS,
          payload: signalisation._docs,
        });
      } else {
        console.log('Unable to getErrors()');
      }

      };
    } catch (error) {
      // Add custom logic to handle errors
      console.log('error',error);
    }
};

export const getAdmins = (uid) => {
  try {
    return async dispatch => {

      const admins = await firestore().collection('users').where('role', '==' , "admin").where('uid', '!=' , uid).get();
      // eslint-disable-next-line no-unreachable
      //console.log("collect_user", admins._docs );
      if (admins._docs) {
        dispatch({
          type: GET_ADMINS,
          payload: admins._docs,
        });
      } else {
        console.log('Unable to getAdmins()');
      }

      };
    } catch (error) {
      // Add custom logic to handle errors
      console.log('error',error);
    }
};

export const getCoachs = () => {
  try {
    return async dispatch => {

      const coachs = await firestore().collection('users').where('role', '==' , "coach").get();
      // eslint-disable-next-line no-unreachable
      console.log("collect_user", coachs._docs );
      if (coachs._docs) {
        dispatch({
          type: GET_COACH,
          payload: coachs._docs,
        });
      } else {
        console.log('Unable to getCoachs()');
      }

      };
    } catch (error) {
      // Add custom logic to handle errors
      console.log('error',error);
    }
};

export const getUser = () => {
  try {
    return async dispatch => {

      const useruid = await auth().currentUser; 
      const user = await firestore().collection('users').doc(useruid.uid).get();
      // eslint-disable-next-line no-unreachable
      //console.log("collect_user", user._data );
      if (user) {
        dispatch({
          type: GET_USER,
          payload: user._data,
        });
      } else {
        console.log('Unable to getUser()');
      }

      };
    } catch (error) {
      // Add custom logic to handle errors
      console.log('error',error);
    }
};

export const getPosts = () => {
  try {
    return async dispatch => {

      const posts = await firestore().collection('posts').orderBy('time', 'desc').get()
      //console.log("posts", posts._docs);

      if (posts._docs) {
        dispatch({
          type: GET_POSTS,
          payload: posts._docs,
        });
      } else {
        console.log('Unable to GET_POSTS');
      }

    };
  } catch (error) {
    // Add custom logic to handle errors
    console.log('error',error);
  }
}

export const getPost = (post_id) => {
  try {
    return async dispatch => {

      const post = await firestore().collection('posts').doc(post_id).get()
      console.log("post_post", post._data);

      if (post._data) {
        dispatch({
          type: GET_POST,
          payload: post._data,
        });
      } else {
        console.log('Unable to GET_POST');
      }

    };
  } catch (error) {
    // Add custom logic to handle errors
    console.log('error',error);
  }
}


export const getLikes = () => {
  try {
    return async dispatch => {
      const likes = await firestore().collection('likes').get()
      //console.log("likes", likes._docs);

      if (likes._docs) {
        dispatch({
          type: GET_LIKES,
          payload: likes._docs,
        });
      } else {
        console.log('Unable to GET_LIKES');
      }

    };
  } catch (error) {
    // Add custom logic to handle errors
    console.log('error',error);
  }

}

export const getMyPosts = () => {
  try {
    return async dispatch => {
      const useruid = await auth().currentUser; 

      const myPosts = await firestore().collection('posts').where('uid', '==' , useruid.uid).orderBy('time', 'desc').get()
      //console.log("myPosts", myPosts._docs);

      if (myPosts._docs) {
        dispatch({
          type: GET_MYPOSTS,
          payload: myPosts._docs,
        });
      } else {
        console.log('Unable to GET_MYPOSTS');
      }

    };
  } catch (error) {
    // Add custom logic to handle errors
    console.log('error',error);
  }

}

export const getComments = (postId) => {
  try {
    return async dispatch => {

      //const comments = await firestore().collection('comments').where('pid', '==' , postId).orderBy('time', 'asc').get()
      const comments = await firestore().collection('comments').where('pid', '==' , postId).orderBy('time', 'desc').get()
      //console.log("comments", comments._docs);
      if (comments._docs) {
        dispatch({
          type: GET_COMMENTS,
          payload: comments._docs,
        });
      } else {
        console.log('Unable to GET_COMMENTS');
      }

    };
  } catch (error) {
    // Add custom logic to handle errors
    console.log('error',error);
  }

}

export const getNotificationCount = () => {
  try {
    return async dispatch => {
      let count = 0;
      const useruid = await auth().currentUser; 
      const notifications = await firestore()
      .collection('users')
      .doc(useruid.uid)
      .get()
      .then((notifs) => {
        count = notifs._data.notificationsCount ? notifs._data.notificationsCount.length : 0
      });

      console.log('getNotificationCount',count);

      dispatch({
        type: GET_NOTIF_COUNT,
        payload: count,
      });
    };
  } catch (error) {
    // Add custom logic to handle errors
    console.log('error',error);
  }

}

export const getNotifications = () => {
  try {
    return async dispatch => {
      let count = 0;
      const useruid = await auth().currentUser; 
      const notifications = await firestore()
      .collection('users')
      .doc(useruid.uid)
      .collection('notification')
      .orderBy('sentTime', 'desc')
      .limit(50)
      .get()


      //console.log('getNotifications',notifications);

      if (notifications)
        dispatch({
          type: GET_NOTIFS,
          payload: notifications._docs,
        });
    };
  } catch (error) {
    // Add custom logic to handle errors
    console.log('error',error);
  }

}

export const getCoachMsg = () => {
  try {
    return async dispatch => {
      let chatMsg = []
      const useruid = await auth().currentUser; 
      const notifications = await firestore()
      .collection('chat_coachs')
      .doc(useruid.uid )
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get()
      .then(querySnapshot => {
        querySnapshot._docs.map(doc =>(
          chatMsg.push({
          _id: doc._data._id,
          text: doc._data.text,
          createdAt: doc._data.createdAt.toDate(),
          user: {
            _id: doc._data.user._id,
            name: doc._data.user.name,
            avatar: doc._data.user.avatar,
          },
          image: doc._data.image,
        })))
      })

      console.log('getCoachMsg',chatMsg);

      if (chatMsg)
        dispatch({
          type: GET_COACH_MSG,
          payload: chatMsg,
        });
    };
  } catch (error) {
    // Add custom logic to handle errors
    console.log('error',error);
  }
}

export const getAdminMsg = () => {
  try {
    return async dispatch => {
      let chatMsg = []
      const useruid = await auth().currentUser; 
      const chatAdmin = await firestore()
      .collection('chat_admins')
      .doc(useruid.uid )
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get()
      .then(querySnapshot => {
        querySnapshot._docs.map(doc =>(
          chatMsg.push({
          _id: doc._data._id,
          text: doc._data.text,
          createdAt: doc._data.createdAt.toDate(),
          user: {
            _id: doc._data.user._id,
            name: doc._data.user.name,
            avatar: doc._data.user.avatar,
          },
          image: doc._data.image,
        })))
      })

      console.log('getAdminMsg',chatMsg);

      if (chatMsg)
        dispatch({
          type: GET_ADMIN_MSG,
          payload: chatMsg,
        });
    };
  } catch (error) {
    // Add custom logic to handle errors
    console.log('error',error);
  }
}