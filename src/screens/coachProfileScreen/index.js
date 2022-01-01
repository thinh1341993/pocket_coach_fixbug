import React from 'react';
import {View, SafeAreaView,ScrollView, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {Colors} from '../../styles'
import Icon from 'react-native-vector-icons/Ionicons';
import {
  Title,
  Caption,
  Avatar,
  Text
} from 'react-native-paper';
import { AirbnbRating, Rating } from 'react-native-ratings';
import Modal from "react-native-modal";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {getCoachs, getUser} from '../../redux/actions';
import {useSelector, useDispatch} from 'react-redux';


const CoachProfileScreen = ({route, navigation}) => {
  const { cdata } = route.params;
  const [isModalVisible, setModalVisible] = React.useState(true);
  const [rate, setRate] = React.useState(0);
  const {coachs} = useSelector(state => state.coachsReducer);
  const {userFB} = useSelector(state => state.userFBReducer);

  const dispatch = useDispatch();
  const fetchCoachFB = () => dispatch(getCoachs());
  const fetchUserFB = () => dispatch(getUser());


  React.useEffect(async () => {
    console.log("cdata:", cdata)
    fetchUserFB()
    console.log("cdata:", cdata.uid )
    console.log("userFB:", userFB.uid +" "+ userFB.firstname +" "+userFB.lastname)
  }, []);


  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const rateCoach = async () => {
    console.log("rate", rate)
    setModalVisible(!isModalVisible);
    const user = await auth().currentUser; 

    await firestore().collection('users')
    .doc(cdata.uid)
    .update({
      peopleratedyou: firestore.FieldValue.arrayUnion({uid: user.uid, rate:rate}),
     })
     .then(() => {
      console.log('User rate added!');
      fetchCoachFB()
    });    

  }

  const goTo = () => {
    if(userFB.uid != cdata.uid){
      navigation.navigate('ChatCoachScreen', {cuser: {id: cdata.uid, avatar: cdata.photo, name: cdata.firstname +" "+cdata.lastname}})
    }else{
      Alert.alert(
        'Messagerie',
        "Vous pouvez pas parler avec vous-mêmes!", [
          {text: 'ok'}
      ]);
    }
  }

  return (
    
    <SafeAreaView style={styles.container}>
        <View style={styles.userInfoSection}>
          <View style={{flexDirection: 'row', marginTop: 15}}>
            <Avatar.Image 
              source={{
                uri: cdata.photo,
              }}
              size={80}
            />
            <View style={{marginLeft: 20}}>
              <Title style={[styles.title, {
                marginTop:15,
                marginBottom: 5,
              }]}>{cdata.firstname +" "+cdata.lastname}</Title>
              <Caption style={styles.caption}>@{cdata.firstname +"_"+cdata.lastname}</Caption>
            </View>
          </View>
        </View>
        <ScrollView style={{marginBottom: '20%'}}>  
        <View style={styles.userInfoSection}>
          <View style={styles.row}>
            <Icon name="mail-outline" color={Colors.btnSplash} size={20}/>
            <Text style={{color:"#777777", marginLeft: 20}}>{cdata.email}</Text>
          </View>
        </View>
        {isModalVisible ? (
          
            cdata.bio
            ?
            <View style={styles.infoBoxWrapper}>
                <View style={[styles.infoBox, {
                  borderRightColor: '#dddddd',
                  borderRightWidth: 1
                }]}>
                  
                  <Text style={{fontWeight: "bold", fontSize: 16, color: Colors.btnSplash, marginLeft: 30}}>Bio :</Text>
                  <Text style={{fontSize: 16, color: "#000", marginLeft: 30}}>{cdata.bio}</Text>
                </View>

            </View>
            :
            null
          
        ):(
          <Modal isVisible={!isModalVisible}>
            <View >
            <Rating
              type='star'
              ratingCount={5}
              imageSize={60}
              showRating
              onFinishRating={(val) => setRate(val)}
            />
              <TouchableOpacity style={styles.commandButton} onPress={() => rateCoach()}>
                <Text style={styles.panelButtonTitle}>Envoyer l'évaluation</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
        <View style={styles.menuWrapper}>
          {/* <TouchableOpacity onPress={() => goTo()}>
            <View style={styles.menuItem}>
              <Icon name="create-outline" color={Colors.btnSplash} size={25}/>
              <Text style={styles.menuItemText}>Contactez moi</Text>
            </View>
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => toggleModal()}>
            <View style={styles.menuItem}>
              <Icon name="megaphone-outline" color={Colors.btnSplash} size={25}/>
              <Text style={styles.menuItemText}>Évaluez-moi</Text>
            </View>
          </TouchableOpacity>
        </View>
        </ScrollView>
    </SafeAreaView>
    );
  };
  
  export default CoachProfileScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
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
    commandButton: {
      padding: 15,
      borderRadius: 10,
      backgroundColor: Colors.btnSplash,
      alignItems: 'center',
      marginTop: 40,

    },
    panel: {
      padding: 20,
      backgroundColor: '#FFFFFF',
      paddingTop: 20,
      // borderTopLeftRadius: 20,
      // borderTopRightRadius: 20,
      // shadowColor: '#000000',
      // shadowOffset: {width: 0, height: 0},
      // shadowRadius: 5,
      // shadowOpacity: 0.4,
    },
    panelButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white',
    },
  });