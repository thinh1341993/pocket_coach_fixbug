import React from 'react';
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
    Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {Colors} from '../../styles'
import auth from '@react-native-firebase/auth';
import { ProgressDialog } from 'react-native-simple-dialogs';


const ForgotPasswordScreen = ({navigation}) => {
    const [active, setActive] = React.useState(false)

    const [data, setData] = React.useState({
        email: '',
        check_textInputChange: false,
    });

    const validateEmail = (email) => {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const textInputChange = (val) => {
        if( val.length !== 0 && validateEmail(val.trim()) ) {
            setData({
                ...data,
                email: val,
                check_textInputChange: true
            });
        } else {
            setData({
                ...data,
                email: val,
                check_textInputChange: false
            });
        }
    }

    const sendPasswordResetEmail = async (navigation) => {
        setActive(true)
        if (!data.email){
            Alert.alert('E-mail invalide !', 'E-mail est vide.', [
                {text: 'ok'}
            ]);
            setActive(false)
            return;
        }

        try {
          await auth().sendPasswordResetEmail(data.email)
          setActive(false)
          Alert.alert('Mot de passe est réinitialisé !', 'Votre mot de passe est réinitialisé, merci de consulter votre boite mail', [
            {text: 'ok'}
          ]);
          navigation.goBack(null)
          return {}
        } catch (error) {
            if(error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' ){
                Alert.alert('E-mail invalide !', 'Votre e-mail est introuvable.', [
                    {text: 'ok'}
                ]);
            }
            console.log(error)
        }
        setActive(false)
      }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.text_header}>Réinitialiser votre mot de passe !</Text>
        </View>
        <ProgressDialog
                visible={active}
                title="En cours de traitement"
                message="Veuillez patienter"
            />
        <Animatable.View 
            animation="fadeInUpBig"
            style={styles.footer}
        >
            <ScrollView>
            <Text style={styles.text_footer}>E-mail</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="user-o"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Votre E-mail"
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputChange(val)}
                />
                {data.check_textInputChange ? 
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


            <View style={styles.button}>
                <TouchableOpacity
                    style={styles.signIn}
                    onPress={() => sendPasswordResetEmail(navigation)}
                >
                <LinearGradient
                    colors={[Colors.btnSplash, Colors.btnSplash]}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>Réinitialiser</Text>
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

export default ForgotPasswordScreen;

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
    }
  });