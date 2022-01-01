import React, {useEffect, useState, useRef} from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import {
  Container,
  Card,
  UserInfo,
  UserImgWrapper,
  UserImg,
  UserInfoText,
  UserName,
  PostTime,
  MessageText,
  TextSection,
} from '../../styles/MessageStyles';
import {Colors} from '../../styles'
import {getNotificationCount, getNotifications} from '../../redux/actions';
import {useSelector, useDispatch} from 'react-redux';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import 'moment/locale/fr'
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';


const NotificationScreen = ({navigation}) => {
  const {notifCount} = useSelector(state => state.getNotificationCountReducer);
  const {notifs} = useSelector(state => state.getNotificationsReducer);
  const [useruid, setUseruid]= React.useState([]);
  const [data, setData] = useState([]);
  const dispatch1 = useDispatch();
  const getNotifCount = () => dispatch1(getNotificationCount());
  const isFocused = useIsFocused();
  moment.locale('fr')
  const goTo = async (item, navigation) => {

      // if (item.notifType == 'message')
      //     navigation.navigate('ChateScreen', {userName: item.userName})
      // else if (item.notifType == 'comment')
      //   return

      console.log('goTo', item)
      if (item.data.type == "comment")
        await firestore()
                .collection('users')
                .doc(useruid)
                .collection('notification')
                .doc(item.messageId)
                .update({
                  data: {
                          avatar: item.data.avatar,
                          type: item.data.type,
                          time: item.data.time,
                          displayName: item.data.displayName ,
                          sender_id: item.data.sender_id,
                          seen: true,
                          pid: item.data.pid,
                          content: item.data.content,
                          commentid: item.data.commentid
                        }
                }).then(()=>{
                  navigation.navigate('DetailPostScreen', {pid: item.data.pid})
                })
      if (item.data.type == "like")
        await firestore()
                .collection('users')
                .doc(useruid)
                .collection('notification')
                .doc(item.messageId)
                .update({
                  data: {
                          avatar: item.data.avatar,
                          type: item.data.type,
                          time: item.data.time,
                          displayName: item.data.displayName ,
                          sender_id: item.data.sender_id,
                          seen: true,
                          pid: item.data.pid,
                        }
                }).then(()=>{
                    navigation.navigate('DetailPostScreen', {pid: item.data.pid})
                })
      if (item.data.type == "message")
        await firestore()
                .collection('users')
                .doc(useruid)
                .collection('notification')
                .doc(item.messageId)
                .update({
                  data: {
                          avatar: item.data.avatar,
                          type: item.data.type,
                          time: item.data.time,
                          displayName: item.data.displayName ,
                          seen: true,
                        }
                }).then(()=>{
                  navigation.navigate('MessagesScreen')
                })
  }

  useEffect(async() => {
    const useruid = await auth().currentUser;
    setUseruid(useruid.uid)
  },[]);

  useEffect(async() => {
    const useruid = await auth().currentUser;
    if(isFocused){
      getNotifCount()
      await firestore()
            .collection('users')
            .doc(useruid.uid)
            .update({
              notificationsCount: firestore.FieldValue.delete(),
            }).then(()=>{
              getNotifCount()
            })
    }
  },[isFocused]);


  useEffect(async() => { 
    const useruid = await auth().currentUser;
    const unsubscribe = await firestore()
                        .collection('users')
                        .doc(useruid.uid)
                        .collection('notification')
                        .orderBy('sentTime', 'desc')
                        .limit(50)
                        .onSnapshot(snap => {
                          if(snap){
                          const data = snap.docs.map(doc => doc.data())
                          console.log("unsubscribe", data[0].data)
                          setData(data)
                          }
                        })
    //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
    return () => unsubscribe()
  }, []);

  const showCard =  ({item})=>   
  (
    <Card onPress={() => goTo(item, navigation)}>
      <UserInfo >
        <UserImgWrapper >
          <UserImg source={{uri: item.data.avatar }} style={{paddingLeft: 10}} />
        </UserImgWrapper>
        <TextSection>
          <UserInfoText>
            <UserName>{item.data.displayName}</UserName>
            <PostTime>{ moment(item.sentTime).fromNow()}</PostTime>
          </UserInfoText>
          <UserInfoText>

          <MessageText>{item.notification.body}</MessageText>
          {item.data.seen == "false" 
              ? 
              <Icon name="concierge-bell" style={{ color: Colors.btnSplash }} size={20} />
              :
              null
            }
            </UserInfoText>
        </TextSection>
      </UserInfo>
    </Card>
  )

  return (
      <Container styles={{backgroundColor: Colors.cardBg,}}>
      <FlatList 
        data={data}
        style={{marginBottom: '20%'}}
        keyExtractor={item=>item.messageId}
        renderItem={showCard}
      />
    </Container>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: Colors.cardBg,
  },
});
