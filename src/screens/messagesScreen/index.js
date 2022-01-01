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
import {useSelector, useDispatch} from 'react-redux';
import {getUser, getAdmins} from '../../redux/actions';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import 'moment/locale/fr'
import {Colors} from '../../styles'
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';


const MessagesScreen = ({navigation}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  let rndm = Date.parse(new Date().getHours);
  let [historyMsg, setHistoryMsg]= React.useState([]);
  const {admins} = useSelector(state => state.adminsReducer);
  const {userFB} = useSelector(state => state.userFBReducer);
  const dispatch = useDispatch();
  moment.locale('fr')
  const fetchAdminsFB = (uid) => dispatch(getAdmins(uid));
  const fetchUserFB = () => dispatch(getUser());
  const mountedRef = useRef(true)
  const isFocused = useIsFocused();

  useEffect(() => {
    if(isFocused){
      fetchUserFB()
    }
  },[isFocused]);

  useEffect(() => {
    if(isFocused){
      fetchAdminsFB(userFB.uid)
    }
  },[isFocused]);

  // useEffect(() => {
  //   if(isFocused){
  //     getMsg()
  //   }
  // },[isFocused]);

  useEffect(async() => { 
    const unsubscribe = await firestore()
                        .collection('chat_history')
                        .doc(userFB.uid )
                        .collection('messages')
                        .orderBy('createdAt', 'desc')
                        .limit(500)
                        .onSnapshot(snap => {
                          historyMsg = []
                          if(snap){
                          console.log(snap._docs)
                          setHistoryMsg(
                          snap._docs.map(doc => ({
                            _id: doc.data()._id,
                            id_recever: doc.data().id_recever,
                            id_sender: doc.data().id_sender,
                            text: doc.data().text,
                            createdAt: doc.data().createdAt.toDate(),
                            for: doc.data().for,
                            time: doc.data().time,
                            user: {
                              _id: doc.data().user._id,
                              name: doc.data().user.name,
                              avatar: doc.data().user.avatar,
                            },
                            image: doc.data().image,
                            seen: doc.data().seen,
                          }))
                        )
                          }
                        })
    //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
    return () => unsubscribe()
  }, []);


  const fetchData = () => {
    setRefreshing(false);
    fetchAdminsFB(userFB.uid)
  };

  const onRefresh = () => {
    rndm = Date.parse(new Date().getHours);
    setRefreshing(true);
    fetchData();
  };


  const goToCoach = async (item) => {
    //console.log('goToCoach.for:', item)

    if (item.item.for == "coach"){
      await firestore()
              .collection('chat_history')
              .doc(userFB.uid )
              .collection('messages')
              .doc(item.item.user._id )
              .update({
                seen: true,
              }).then(() =>{
                navigation.navigate('ChatCoachScreen', {cuser: {id: item.item.user._id, avatar: item.item.user.avatar, name: item.item.user.name}})

              })
    }else{
      await firestore()
              .collection('chat_history')
              .doc(userFB.uid )
              .collection('messages')
              .doc(item.item.user._id )
              .update({
                seen: true,
              }).then(() =>{
                navigation.navigate('ChateScreen', {cuser: {id: item.item.user._id, avatar: item.item.user.avatar, name: item.item.user.name}})
              })
      }
  }

  const showCard =  ({item})=>   
  (
    <Card onPress={() => navigation.navigate('ChateScreen', {cuser: {id: item._data.uid, avatar: item._data.photo, name: item._data.firstname +" "+item._data.lastname}})}>
      <UserInfo>
        <UserImgWrapper>
          <UserImg source={{uri: item._data.photo + '?token=' + rndm,}} />
        </UserImgWrapper>
        <TextSection>
          <UserInfoText>
            <UserName>{item._data.firstname +" "+item._data.lastname}</UserName>
            <PostTime>{moment(item._data.messageTime).fromNow()}</PostTime>
          </UserInfoText>
          <MessageText>{(item._data.messageText) ? item._data.messageText : "contactez moi pour tout renseignements"}</MessageText>
        </TextSection>
      </UserInfo>
    </Card>

  )

  const showCardHistory =  ({item})=>   
  (
    <Card onPress={() => goToCoach ({item})} >
      <UserInfo>
        <UserImgWrapper>
          <UserImg source={{uri: item.user.avatar + '?token=' + rndm,}} />
        </UserImgWrapper>
        <TextSection>
          <UserInfoText>
            <UserName>{item.user.name}</UserName>
            <PostTime>{moment(item.time).fromNow()}</PostTime>
          </UserInfoText>
          <UserInfoText>
            <MessageText>{item.text}</MessageText>
            { (item.seen == false && item.id_sender !=  userFB.uid)
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

  const headerAdmins =  ({item})=>   
  (
    <View >
      <Text style={{fontSize: 18,fontWeight: 'bold', color: Colors.backgroundSplash, textAlign: 'center'}}> Parlez avec les admins</Text>
    </View>

  )
  const headerHistoty =  ({item})=>   
  (
    <View >
      <Text style={{fontSize: 18,fontWeight: 'bold', color: Colors.backgroundSplash, textAlign: 'center'}}> L'historique des conversa</Text>
    </View>

  )

  return (
    <Container>

      
      { historyMsg.length != 0
      ?     
      (<FlatList
        style={{}} 
        data={historyMsg}
        keyExtractor={item=>item._id}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={showCardHistory}
        ListHeaderComponent={headerHistoty}

      />)
      :
        (null)
      }
      
      <FlatList
        style={{marginBottom: '20%'}} 
        data={admins}
        keyExtractor={item=>item._data.uid}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={showCard}
        ListHeaderComponent={headerAdmins}
      />
      

    </Container>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});
