import React, {useEffect} from 'react';
import { 
    View, 
    Text, 
    Button, 
    TouchableOpacity, 
    Dimensions,
    TextInput,
    Platform,
    StyleSheet,
    ScrollView,
    StatusBar,
    Alert,
    ImageBackground
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {Colors} from '../../styles'
import auth from '@react-native-firebase/auth';
import { AuthContext } from '../../components/context';
import { ProgressDialog } from 'react-native-simple-dialogs';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

const re = /\S+@\S+\.\S+/;

const SignInScreen = ({navigation}) => {
    const { signUp } = React.useContext(AuthContext);
    const [active, setActive] = React.useState(false)
    const [photo, setPhoto] = React.useState('https://cdn.pixabay.com/photo/2017/11/10/05/24/add-2935429_1280.png');

    const [data, setData] = React.useState({
        email: '',
        firstname: '',
        lastname: '',
        password: '',
        confirm_password: '',
        check_textInputEmail: false,
        check_textInputFirstname: false,
        check_textInputLastname: false,
        secureTextEntry: true,
        confirm_secureTextEntry: true,
    });

    const validateEmail = (email) => {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const textInputEmail = (val) => {
        if( val.length !== 0 && validateEmail(val)) {
            setData({
                ...data,
                email: val,
                check_textInputEmail: true
            });
        } else {
            setData({
                ...data,
                email: val,
                check_textInputEmail: false
            });
        }
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

    const handlePasswordChange = (val) => {
        setData({
            ...data,
            password: val
        });
    }

    const handleConfirmPasswordChange = (val) => {
        setData({
            ...data,
            confirm_password: val
        });
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const updateConfirmSecureTextEntry = () => {
        setData({
            ...data,
            confirm_secureTextEntry: !data.confirm_secureTextEntry
        });
    }

    const requestUserPermission = async () => {
        /**
         * On iOS, messaging permission must be requested by
         * the current application before messages can be
         * received or sent
         */
        const authStatus = await messaging().requestPermission();
        console.log('Authorization status(authStatus):', authStatus);
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      };

    
    const sign_Up = async (navigation) => {
        
        setActive(true)
        if(!requestUserPermission()){
            Alert.alert('Probleme de permission!!', "Merci de nous permet d'utiliser les notifications .", [
                {text: 'ok'}
            ]);
            setActive(false)
            return
        }
        if(!data.email || !data.firstname 
            || !data.lastname || !data.password
            || !data.confirm_password || photo.includes("https://cdn.pixabay.com")){
            Alert.alert('Mauvaise entrée !!', 'Un ou plusieurs champs sont vides.', [
                    {text: 'ok'}
            ]);
            setActive(false)
            return
        }
        if (data.password != data.confirm_password){
            Alert.alert('Mauvaise entrée !!', 'Les mots de passe saisis ne sont pas identiques.', [
                {text: 'ok'}
            ]);
            setActive(false)
            return;
        }

        try {
            let user; 
            await auth().createUserWithEmailAndPassword(data.email, data.password).
            then(userData => {
                userData.user.sendEmailVerification();
                user = userData;
            })
            .catch(err => {
                console.log(err);
            });

            console.log("useruser:", user)
            await auth().currentUser.updateProfile({
              displayName: data.firstname +" "+ data.lastname,
            })
            /******************************************************** */
            const filename_extension = photo.substring(photo.lastIndexOf('.') + 1);
            const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : photo;
                        
            const task = storage()
                .ref('/profiles/'+user.user.uid+'.'+filename_extension)
                .putFile(uploadUri);

            try {
                await task;
            } catch (e) {
                console.error(e);
            }

            const url = await storage().ref('/profiles/'+user.user.uid+'.'+filename_extension).getDownloadURL();

            /*********************************************************/
                /**
                 * Returns an FCM token for this device
                 */
            await  messaging().deleteToken()    
            messaging()
                .getToken()
                .then((fcmToken) => {
                    console.log('FCM Token -> ', fcmToken);
                    firestore()
                    .collection('users')
                    .doc(user.user.uid)
                    .set({
                        bio: "",
                        email: data.email,
                        firstname: data.firstname,
                        lastname: data.lastname,
                        role: "simple",
                        uid: user.user.uid,
                        rating: 0,
                        photo: url,
                        notification_token: fcmToken,
                    })
                    .then(() => {console.log('User added!');});
                });
              

            console.log('signUp:',user.user)
            setActive(false)
            Alert.alert('Votre compte a été créé avec succès.', 
            "Merci de consulter votre boite mail pour valider votre compte", [
                {text: 'ok'}
            ]);
            navigation.goBack(null)
            //signUp(user)
          } catch (error) {
              if (error.message){
                Alert.alert('Mauvaise e-mail !', "L'adresse e-mail est déjà utilisée par un autre compte", [
                    {text: 'ok'}
                ]);
              }
            console.log('error',error.message);
          }
          setActive(false)
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
            onPress={() => bss.current.snapTo(1)}>
            <Text style={styles.panelButtonTitle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    
      renderHeader = () => (
        <View style={styles.headerr}>
          <View style={styles.panelHeader}>
            <View style={styles.panelHandle} />
          </View>
        </View>
      );
    
      const bss = React.useRef(null);
      const falll = new Animated.Value(1);
      
      const select_from_gallery = () => {
        ImagePicker.openPicker({
          width: 300,
          height: 300,
          cropping: true
        }).then(image => {
          bss.current.snapTo(1)
          console.log(image.path);
          setPhoto(image.path)
          //uploadImage(image.path)
          
        });
    
      }
      
      const select_from_camera = () => {
        ImagePicker.openCamera({
          width: 300,
          height: 300,
          cropping: true,
        }).then(image => {
          bss.current.snapTo(1)
          console.log(image.path);
          setPhoto(image.path)
          //uploadImage(image.path)
          
        });
      }
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.text_header}>Inscription</Text>
        </View>
        <ProgressDialog
                visible={active}
                title="En cours de traitement"
                message="Veuillez patienter"
            />
        <BottomSheet
            ref={bss}
            snapPoints={[350, 0]}
            renderContent={() =>renderInner()}
            renderHeader={() => renderHeader()}
            initialSnap={1}
            callbackNode={falll}
            enabledGestureInteraction={true}
        />
        <Animatable.View 
            animation="fadeInUpBig"
            style={styles.footer}
        >
            <View style={{alignItems: 'center'}}>
                <TouchableOpacity onPress={() => bss.current.snapTo(0)}>
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
                    {data.firstname +" "+ data.lastname}
                </Text>
            </View>

            <ScrollView>
            <Text style={styles.text_footer}>E-mail</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="at"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Votre Email"
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputEmail(val)}
                />
                {data.check_textInputEmail ? 
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
            <Text style={styles.text_footer}>Nom</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="user-o"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Votre Nom"
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
            </View>

            <Text style={[styles.text_footer, {
                marginTop: 35
            }]}>Mot de passe</Text>
            <View style={styles.action}>
                <Feather 
                    name="lock"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Votre mot de passe"
                    secureTextEntry={data.secureTextEntry ? true : false}
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => handlePasswordChange(val)}
                />
                <TouchableOpacity
                    onPress={updateSecureTextEntry}
                >
                    {data.secureTextEntry ? 
                    <Feather 
                        name="eye-off"
                        color="grey"
                        size={20}
                    />
                    :
                    <Feather 
                        name="eye"
                        color="grey"
                        size={20}
                    />
                    }
                </TouchableOpacity>
            </View>

            <Text style={[styles.text_footer, {
                marginTop: 35
            }]}>Confirmation mot de passe</Text>
            <View style={styles.action}>
                <Feather 
                    name="lock"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Confirmez votre mot de passe"
                    secureTextEntry={data.confirm_secureTextEntry ? true : false}
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => handleConfirmPasswordChange(val)}
                />
                <TouchableOpacity
                    onPress={updateConfirmSecureTextEntry}
                >
                    {data.secureTextEntry ? 
                    <Feather 
                        name="eye-off"
                        color="grey"
                        size={20}
                    />
                    :
                    <Feather 
                        name="eye"
                        color="grey"
                        size={20}
                    />
                    }
                </TouchableOpacity>
            </View>
            <View style={styles.textPrivate}>
                <Text style={styles.color_textPrivate}>
                    En vous inscrivant, vous acceptez notre
                </Text>
                <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>{" "}Conditions d'utilisation</Text>
                <Text style={styles.color_textPrivate}>{" "}et</Text>
                <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>{" "}Politique de confidentialité</Text>
            </View>
            <View style={styles.button}>
                <TouchableOpacity
                    style={styles.signIn}
                    onPress={() => sign_Up(navigation)}
                >
                <LinearGradient
                    colors={[Colors.btnSplash, Colors.btnSplash]}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>S'inscrire</Text>
                </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.signIn, {
                        borderColor: Colors.btnSplash,
                        borderWidth: 1,
                        marginTop: 15
                    }]}
                >
                    <Text style={[styles.textSign, {
                        color: Colors.btnSplash
                    }]}>Retour</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </Animatable.View>
      </View>
    );
};

export default SignInScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: Colors.backgroundSplash
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
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
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
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
    headerr: {
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
  });
