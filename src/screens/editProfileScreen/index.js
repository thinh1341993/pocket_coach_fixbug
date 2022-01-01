import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';

import {useTheme} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { ProgressDialog } from 'react-native-simple-dialogs';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import ImagePicker from 'react-native-image-crop-picker';
import {Colors} from '../../styles'
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import {getUser} from '../../redux/actions';
import {useSelector, useDispatch} from 'react-redux';

const EditeProfileScreen = ({route, navigation}) => {
  const { cdata } = route.params;
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = React.useState(cdata.photo);
  const {userFB} = useSelector(state => state.userFBReducer);
  const dispatch = useDispatch();
  const fetchUserFB = () => dispatch(getUser());

  const isFocused = useIsFocused();

  const [data, setData] = React.useState({
    firstname: cdata ? cdata.firstname : "",
    lastname: cdata ? cdata.lastname : "",
    bio: cdata ? cdata.bio : "",
    check_textInputFirstname: false,
    check_textInputLastname: false,
    check_textInputBio: false,

});

  useEffect(() => {
    if(isFocused){
      fetchUserFB()
    }
  },[isFocused]);



  const uploadImage = async (uri) => {
    try {
      const filename_extension = uri.substring(uri.lastIndexOf('.') + 1);
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      
      setUploading(true);
      
      const task = storage()
        .ref('/profiles/'+userFB.uid+'.'+filename_extension)
        .putFile(uploadUri);

      try {
        await task;
      } catch (e) {
        console.error(e);
      }

      const url = await storage().ref('/profiles/'+userFB.uid+'.'+filename_extension).getDownloadURL();

      await firestore()
      .collection('users')
      .doc(userFB.uid)
      .update({
          photo: url,
      })
      .then(() => {
        console.log('User added!');
      });

      console.log('url:',url)
      setUploading(false);
      Alert.alert(
        'Photo de profile enregistrer!',
        'Votre photo a été  bien enregistrer!', [
          {text: 'ok'}
      ]);

    } catch (e) {
      console.error(e);
    }

  }

  renderInner = () => (
    <View style={styles.panel}>
      <View style={{alignItems: 'center'}}>
        <Text style={styles.panelTitle}>Envoyer la photo</Text>
        <Text style={styles.panelSubtitle}>Choisissez votre photo</Text>
      </View>
      <TouchableOpacity style={styles.panelButton} onPress={select_from_camera} >
        <Text style={styles.panelButtonTitle}>Prendre une photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.panelButton} onPress={select_from_gallery} >
        <Text style={styles.panelButtonTitle}>Choisir dans la galerie</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={() => bs.current.snapTo(1)}>
        <Text style={styles.panelButtonTitle}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );

  const bs = React.useRef(null);
  const fall = new Animated.Value(1);
  
  const select_from_gallery = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true
    }).then(image => {
      bs.current.snapTo(1)
      setPhoto(image.path)
      console.log(image.path);
      uploadImage(image.path)
      
    });

  }
  
  const select_from_camera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
    }).then(image => {
      bs.current.snapTo(1)
      setPhoto(image.path)
      console.log(image.path);
      uploadImage(image.path)
      
    });
  }

  const textInputFirstname = (val) => {
    if( val.length !== 0 ) {
        setData({
            ...data,
            firstname: val,
            check_textInputFirstname: true
        });
    } else {
        setData({
            ...data,
            firstname: val,
            check_textInputFirstname: false
        });
    }
  }
  const textInputLastname = (val) => {
      if( val.length !== 0 ) {
          setData({
              ...data,
              lastname: val,
              check_textInputLastname: true
          });
      } else {
          setData({
              ...data,
              lastname: val,
              check_textInputLastname: false
          });
      }
  }

  const textInputBio = (val) => {
    if( val.length !== 0 ) {
        setData({
            ...data,
            bio: val,
            check_textInputBio: true
        });
    } else {
        setData({
            ...data,
            bio: val,
            check_textInputBio: false
        });
    }
  }

  const updateProfile = async (navigation) => {
    setUploading(true);
    if(!data.firstname  || !data.lastname || !data.bio){
        Alert.alert('Mauvaise entrée !!', 'Un ou plusieurs champs sont vides.', [
                {text: 'ok'}
        ]);
        setUploading(false)
        return
    }

    try {

      await firestore()
      .collection('users')
      .doc(userFB.uid)
      .update({
          bio: data.bio.trim(),
          firstname: data.firstname,
          lastname: data.lastname,
          photo: photo,
      })
      .then(() => {
        console.log('User added!');
        setUploading(false)
        Alert.alert('Votre profil a été mise a jouré avec succès!!', 
        "Merci pour votre patience", [
            {text: 'ok'}
        ]);
        navigation.goBack(null)
      });

      //signUp(user)
    } catch (error) {
        if (error.message){
          Alert.alert('Mauvais e-mail!!', "L'adresse e-mail est déjà utilisée par un autre compte", [
              {text: 'ok'}
          ]);
        }
      console.log('error',error.message);
      setUploading(false);
    }
    setUploading(false)

  }


  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bs}
        snapPoints={[400, 0]}
        renderContent={() =>renderInner()}
        renderHeader={() => renderHeader()}
        initialSnap={1}
        callbackNode={fall}
        enabledGestureInteraction={true}
      />
      <Animated.View style={{margin: 20,
        opacity: Animated.add(0.1, Animated.multiply(fall, 1.0)),
       }}>
        <ProgressDialog
                visible={uploading}
                title="En cours de traitement"
                message="Veuillez patienter"
        />
        <View style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={() => bs.current.snapTo(0)}>
            <View
              style={{
                height: 100,
                width: 100,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ImageBackground
                source={{
                  uri: photo,
                }}
                style={{height: 100, width: 100}}
                imageStyle={{borderRadius: 15}}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Icon
                    name="camera"
                    size={35}
                    color="#fff"
                    style={{
                      opacity: 0.7,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#fff',
                      borderRadius: 10,
                    }}
                  />
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
          <Text style={{marginTop: 10, fontSize: 18, fontWeight: 'bold'}}>
            {cdata.firstname+" "+cdata.lastname}
          </Text>
        </View>
        
        <ScrollView style={{marginBottom: '20%'}}>
        <Animatable.View 
            animation="fadeInUpBig"
            
        >
        
        <View>
            {/* <Text style={styles.text_footer}>Nom</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="user-o"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Votre Nom"
                    defaultValue= {cdata ? cdata.firstname : ""}
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputFirstname(val)}
                />
                {data.check_textInputFirstname ? 
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
            <Text style={styles.text_footer}>Prénom</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="user-o"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Votre Prénom"
                    defaultValue= {cdata ? cdata.lastname : ""}
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputLastname(val)}
                />
                {data.check_textInputLastname ? 
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
            </View> */}

            <Text style={styles.text_footer}>Bio</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="id-badge"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Votre bio"
                    defaultValue= {cdata ? cdata.bio : ""}
                    style={styles.textInput}
                    numberOfLines={3}
                    multiline={true}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputBio(val)}
                />
                {data.check_textInputLastname ? 
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

            <TouchableOpacity style={styles.commandButton} onPress={() => updateProfile(navigation)}>
                <Text style={styles.panelButtonTitle}>Mise à joure</Text>
            </TouchableOpacity>
        </View>
        </Animatable.View>
        </ScrollView>

      </Animated.View>
    </View>
  );
};
export default EditeProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.btnSplash,
    alignItems: 'center',
    marginTop: 0,
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
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#333333',
    shadowOffset: {width: -1, height: -3},
    shadowRadius: 2,
    shadowOpacity: 0.4,
    // elevation: 5,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: Colors.btnSplash,
    alignItems: 'center',
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  action: {
    flexDirection: 'row',
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },

  footer: {
      flex: Platform.OS === 'ios' ? 3 : 5,
      backgroundColor: '#fff',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 20,
      paddingVertical: 30
  },
  text_header: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 30
  },
  text_footer: {
      color: '#05375a',
      fontSize: 18
  },

  button: {
      alignItems: 'center',
      marginTop: 50
  },
  signIn: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10
  },
  textSign: {
      fontSize: 18,
      fontWeight: 'bold'
  },
  textPrivate: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 20
  },
  color_textPrivate: {
      color: 'grey'
  }
});