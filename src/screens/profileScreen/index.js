import React, {useEffect, useState} from 'react';
import {View, SafeAreaView,ScrollView, StyleSheet, TouchableOpacity, TextInput,Alert} from 'react-native';
import {
  Avatar,
  Title,
  Caption,
  Text,
  TouchableRipple,
} from 'react-native-paper';

import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../styles'

import {useSelector, useDispatch} from 'react-redux';
import {getUser} from '../../redux/actions';
import { AuthContext } from '../../components/context';
import { useIsFocused } from '@react-navigation/native';
import Modal from "react-native-modal";
import { justifyContent } from 'styled-system';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
import Feather from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import {getErrors} from '../../redux/actions';

import { TextInput as TextInputPaper } from 'react-native-paper';

const tmpuri = "https://cdn.pixabay.com/photo/2017/11/10/05/24/add-2935429_1280.png"

const ProfileScreen = ({navigation}) => {

  const { signOut } = React.useContext(AuthContext);
  const {errorsFB} = useSelector(state => state.getErrorsReducer);

  const {userFB} = useSelector(state => state.userFBReducer);
  const dispatch = useDispatch();
  const fetchUserFB = () => dispatch(getUser());
  const fetchMyErrorsFB = () => dispatch(getErrors());

  const isFocused = useIsFocused();
  const [isModalCoachVisible, setModalCoachVisible] = useState(false);
  const [isModalAdminVisible, setModalAdminVisible] = useState(false);
  const [isModalErrorMsg, setModalErrorMsgVisible] = useState(false);




  
  let myTextInput1 = React.useRef(null);
  let myTextInput2 = React.useRef(null);

  const [data, setData] = React.useState({
    emailCoach: '',
    emailAdmin: '',
    errorMsg: '',
    check_textInputEmailCoach: false,
    check_textInputEmailAdmin: false,
    check_textInputErrorMsg: false,
  });

  const validateEmail = (email) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  useEffect(() => {
    if(isFocused){
      console.log(userFB)
      fetchUserFB();
    }
    }, [isFocused]);

  useEffect(() => {
    fetchMyErrorsFB()
    //console.log("Navigator  MainTabScreen notifCount:", notifCount)
  },[errorsFB]);

  const getUri = () => {
    if (userFB)
      return userFB.photo
    return tmpuri
  }

  const textInputErrorMsg = (val) => {
    if( val.length !== 0) {
        setData({
            ...data,
            errorMsg: val,
            check_textInputErrorMsg: true
        });
    } else {
        setData({
            ...data,
            errorMsg: val,
            check_textInputErrorMsg: false
        });
    }
  }

  const textInputEmailCoach = (val) => {
    if( val.length !== 0 && validateEmail(val)) {
        setData({
            ...data,
            emailCoach: val,
            check_textInputEmailCoach: true
        });
    } else {
        setData({
            ...data,
            emailCoach: val,
            check_textInputEmailCoach: false
        });
    }
  }

  const textInputEmailAdmin = (val) => {
    console.log("textInputEmail")
    if( val.length !== 0 && validateEmail(val)) {
        setData({
            ...data,
            emailAdmin: val,
            check_textInputEmailAdmin: true
        });
    } else {
        setData({
            ...data,
            emailAdmin: val,
            check_textInputEmailAdmin: false
        });
    }
  }

  const toggleModalCoach = () => {
    setModalCoachVisible(!isModalCoachVisible);
  };

  const toggleModalAdmin = () => {
    setModalAdminVisible(!isModalAdminVisible);
  };

  const toggleModalErrorMsg = () => {
    setModalErrorMsgVisible(!isModalErrorMsg);
  };

  const fbAddAdmin = async(val) => {
    if (data.check_textInputEmailAdmin && data.emailAdmin.length > 0){
      await firestore()
      .collection("users")
      .where('email', '==' , data.emailAdmin)
      .get()
      .then((res) => {
        if(val == "add")
          firestore()
            .collection("users")
            .doc(res._docs[0]._data.uid)
            .update({
              role: "admin",
            })
            .then(() => {
              Alert.alert(
                'Ajouter un admin',
                "Le compte admin a été créé avec succés ", [
                  {text: 'ok'}
              ]);
              setData({
                ...data,
                emailAdmin: "",
                check_textInputEmailAdmin: false
            });
          });
        if(val == "del")
          firestore()
            .collection("users")
            .doc(res._docs[0]._data.uid)
            .update({
              role: "simple",
            })
            .then(() => {
              Alert.alert(
                'Supprimer un admin',
                "L'admin a été supprimé avec succés", [
                  {text: 'ok'}
              ]);
              setData({
                ...data,
                emailAdmin: "",
                check_textInputEmailAdmin: false
            });
          });

        });
      }
      setModalAdminVisible(!isModalAdminVisible);
      return
  }

  const fbAddCoach = async (val) => {
    if (data.check_textInputEmailCoach && data.emailCoach.length > 0){
      await firestore()
      .collection("users")
      .where('email', '==' , data.emailCoach)
      .get()
      .then((res) => {
        if(val == "add")
          firestore()
            .collection("users")
            .doc(res._docs[0]._data.uid)
            .update({
              role: "coach",
            })
            .then(() => {
              Alert.alert(
                'Ajouter un coach',
                "Un nouveau coach a été ajouté", [
                  {text: 'ok'}
              ]);
              setData({
                ...data,
                emailCoach: "",
                check_textInputEmailCoach: false
            });
          });
        if(val == "del")
          firestore()
            .collection("users")
            .doc(res._docs[0]._data.uid)
            .update({
              role: "simple",
            })
            .then(() => {
              Alert.alert(
                'Supprimer un coach',
                "Le coach a été supprimé avec succés", [
                  {text: 'ok'}
              ]);
              setData({
                ...data,
                emailCoach: "",
                check_textInputEmailCoach: false
            });
          });
        });
      }
      setModalCoachVisible(!isModalCoachVisible);
      return
  }

  const setMsg = async () => {
    let time2 = Date.parse(new Date()) 
    if(data.errorMsg)
      firestore()
      .collection("signalisation")
      .doc(userFB.uid + time2)
      .set({
        display_name: userFB.firstname+' '+userFB.lastname,
        content: data.errorMsg.trim(),
        avatar: userFB.photo,
        uid: userFB.uid,
        time: time2,
        id_sing: userFB.uid + time2
      })
      .then(() => {
        Alert.alert(
          'Votre remarque a été prise en compte',
          "Merci pour votre contribution", [
            {text: 'ok'}
        ]);
        setData({
          ...data,
          errorMsg: "",
          check_textInputErrorMsg: false
        });
        setModalErrorMsgVisible(!isModalErrorMsg)
      });
  }

  const  addErrorMsg=() => 
  (
   <View>
     <Modal isVisible={isModalErrorMsg}
            onSwipeComplete={() => setModalErrorMsgVisible(false)}
            swipeDirection="right"
     >
       <View style={{  backgroundColor: "#fff", height: '50%',  borderRadius: 20 }}>
         <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
           <View style={styles.action}>
               <TextInputPaper 
                   label="Signalement ou suggestion"
                   mode='outlined'
                   numberOfLines={3}
                   multiline={true}
                   style={[styles.textInput, {height: '60%', width: '70%'}]}
                   autoCapitalize="none"
                   onChangeText={(val) => textInputErrorMsg(val)}
               />
           </View>
             <TouchableOpacity style={styles.commandButton} onPress={() => setMsg()}>
               <Text style={styles.panelButtonTitle}>Ajouter</Text>
             </TouchableOpacity>
         </View>
       </View>
     </Modal>
   </View>
 );

  const  addCoach=() => 
     (
      <View>
        <Modal isVisible={isModalCoachVisible}
               onSwipeComplete={() => setModalCoachVisible(false)}
               swipeDirection="right"
               >
          <View style={{  backgroundColor: "#fff", height: '50%',  borderRadius: 20 }}>
            <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.text_footer}>Ajouter/Supprimer un coach</Text>
              <View style={styles.action}>
                  <FontAwesome 
                      name="at"
                      color="#05375a"
                      size={20}
                  />
                  <TextInput 
                      placeholder="Votre E-mail"
                      style={styles.textInput}
                      autoCapitalize="none"
                      ref={myTextInput1}
                      onChangeText={(val) => textInputEmailCoach(val)}
                  />
                  {data.check_textInputEmailCoach ? 
                  <Animatable.View
                      animation="bounceIn"
                  >
                      <Feather 
                          name="check-circle"
                          color="green"
                          size={20}
                      />
                  </Animatable.View>
                  : null}
              </View>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={styles.commandButton} onPress={() => fbAddCoach("add")}>
                  <Text style={styles.panelButtonTitle}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commandButton} onPress={() => fbAddCoach("del")}>
                    <Text style={styles.panelButtonTitle}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  
    const  addAdmin=() => 
    (
     <View>
       <Modal isVisible={isModalAdminVisible}
              onSwipeComplete={() => setModalAdminVisible(false)}
              swipeDirection="right"
              >
         <View style={{  backgroundColor: "#fff", height: '50%',  borderRadius: 20 }}>
           <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
             <Text style={styles.text_footer}>Ajouter/Supprimer un admin</Text>
             <View style={styles.action}>
                 <FontAwesome 
                     name="at"
                     color="#05375a"
                     size={20}
                 />
                 <TextInput 
                     placeholder="Votre E-mail"
                     style={styles.textInput}
                     ref={myTextInput2}
                     autoCapitalize="none"
                     onChangeText={(val) => textInputEmailAdmin(val)}
                 />
                 {data.check_textInputEmailAdmin ? 
                 <Animatable.View
                     animation="bounceIn"
                 >
                     <Feather 
                         name="check-circle"
                         color="green"
                         size={20}
                     />
                 </Animatable.View>
                 : null}
             </View>
             <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={styles.commandButton} onPress={() => fbAddAdmin("add")}>
                  <Text style={styles.panelButtonTitle}>Ajouter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commandButton} onPress={() => fbAddAdmin("del")}>
                  <Text style={styles.panelButtonTitle}>Supprimer</Text>
              </TouchableOpacity>
            </View>
           </View>
         </View>
       </Modal>
     </View>
   );
  return (
      <SafeAreaView style={styles.container}>
        {isModalCoachVisible ? addCoach(): null}
        {isModalAdminVisible ? addAdmin(): null}
        {isModalErrorMsg ? addErrorMsg(): null}
        <View style={styles.userInfoSection}>
          <View style={{flexDirection: 'row', marginTop: 15}}>
            <Avatar.Image 
              source={{
                uri: getUri(),
              }}
              size={80}
            />
            <View style={{marginLeft: 20}}>
              <Title style={[styles.title, {
                marginTop:15,
                marginBottom: 5,
              }]}>{userFB.firstname} {userFB.lastname}</Title>
              <Caption style={styles.caption}>@{userFB.firstname}_{userFB.lastname}</Caption>
            </View>
          </View>
        </View>
        <ScrollView style={{marginBottom: '20%'}}>
        <View style={styles.userInfoSection}>
          <View style={styles.row}>
            <Icon name="mail-outline" color={Colors.btnSplash} size={20}/>
            <Text style={{color:"#777777", marginLeft: 20}}>{userFB.email}</Text>
          </View>
        </View>
      
        {
          userFB.bio
          ?
        <View style={styles.infoBoxWrapper}>
            <View style={[styles.infoBox, {
              borderRightColor: '#dddddd',
              borderRightWidth: 1
            }]}>
              <Text style={{fontWeight: "bold", fontSize: 16, color: Colors.btnSplash, marginLeft: 30}}>Bio :</Text>
              <Text style={{fontSize: 16, color: "#000", marginLeft: 30}}>{userFB.bio}</Text>
            </View>
        </View>
        :
        null
        }
        
        <View style={styles.menuWrapper}>
          <TouchableRipple onPress={() => navigation.navigate('EditProfileScreen', {cdata: userFB})}>
            <View style={styles.menuItem}>
              <Icon name="create-outline" color={Colors.btnSplash} size={25}/>
              <Text style={styles.menuItemText}>Editer votre profil</Text>
            </View>
          </TouchableRipple>
          <TouchableRipple onPress={() => toggleModalErrorMsg()}>
            <View style={styles.menuItem}>
              <Icon name="alert-circle-outline" color={Colors.btnSplash} size={25}/>
              <Text style={styles.menuItemText}>Signaler une anomalie</Text>
            </View>
          </TouchableRipple>
          {/* <TouchableRipple onPress={() => {}}>
            <View style={styles.menuItem}>
              <Icon name="megaphone-outline" color={Colors.btnSplash} size={25}/>
              <Text style={styles.menuItemText}>Partager avec vos amis</Text>
            </View>
          </TouchableRipple> */}
          {/* {userFB.role == "admin" ? 
            <TouchableRipple onPress={() => toggleModalAdmin()}>
                  <View style={styles.menuItem}>
                        <Icon name="ribbon-outline" color={Colors.btnSplash} size={25}/>
                        <Text style={styles.menuItemText}>Ajouter/Supprimer un admin</Text>
                      </View>
              </TouchableRipple>
          :
          
          null
          } */}
          {userFB.role == "admin" ? 
            <TouchableRipple onPress={() => toggleModalCoach()}>
                  <View style={styles.menuItem}>
                        <Icon name="logo-steam" color={Colors.btnSplash} size={25}/>
                        <Text style={styles.menuItemText}>Ajouter/Supprimer un coach</Text>
                      </View>
              </TouchableRipple>
          :
          
          null
          }
          {userFB.role == "admin" ? 
            <TouchableRipple onPress={() => navigation.navigate('ErrorsScreen')}>
                  <View style={[styles.menuItem, {backgroundColor: errorsFB.length == 0 ? null : "#F2A154"}]}>
                        <Icon name="warning-outline" color={Colors.btnSplash} size={25}/>
                        <Text style={styles.menuItemText}>Voir la liste des anomalies</Text>
                  </View>
              </TouchableRipple>
          :
          
          null
          }
          {userFB.role == "admin" ? 
          <TouchableRipple onPress={() => navigation.navigate('MyPostsScreen')}>
            <View style={styles.menuItem}>
              <Icon name="cube-outline" color={Colors.btnSplash} size={25}/>
              <Text style={styles.menuItemText}>Mes posts</Text>
            </View>
          </TouchableRipple>
          :
          null
          }
          <TouchableRipple onPress={() => signOut()}>
            <View style={styles.menuItem}>
              <Icon name="exit-outline" color={Colors.btnSplash} size={25}/>
              <Text style={styles.menuItemText}>Se déconnecter</Text>
            </View>
          </TouchableRipple>
        </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  export default ProfileScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
    },
    commandButton: {
      padding: 15,
      borderRadius: 10,
      backgroundColor: Colors.btnSplash,
      alignItems: 'center',
      marginTop: 0,
      marginHorizontal: 15
    },
    userInfoSection: {
      paddingHorizontal: 30,
      marginBottom: 25,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    caption: {
      fontSize: 14,
      lineHeight: 14,
      fontWeight: '500',
    },
    row: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    infoBoxWrapper: {
      borderBottomColor: '#dddddd',
      borderBottomWidth: 1,
      borderTopColor: '#dddddd',
      borderTopWidth: 1,
      flexDirection: 'row',
      // height: 100,
      paddingVertical: 10,
      backgroundColor: Colors.cardBg,
    },
    infoBox: {
      width: '100%',
      // alignItems: 'center',
      // justifyContent: 'center',
    },
    menuWrapper: {
      marginTop: 10,
    },
    menuItem: {
      flexDirection: 'row',
      paddingVertical: 15,
      paddingHorizontal: 30,
    },
    menuItemText: {
      color: '#777777',
      marginLeft: 20,
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 26,
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    textInput: {
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
        width: '60%'
    },
    panelButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white',
    },
  });