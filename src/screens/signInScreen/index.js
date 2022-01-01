import React, {useEffect, useState} from 'react';
import { View, Text, TouchableOpacity, TextInput,Platform,StyleSheet, Alert} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {Colors} from '../../styles'
import { useTheme } from 'react-native-paper';
import { AuthContext } from '../../components/context';
import Users from '../../model/users';
import auth from '@react-native-firebase/auth';
import { ProgressDialog } from 'react-native-simple-dialogs';

const SignInScreen = ({navigation}) => {
    const [active, setActive] = React.useState(false)

    const [data, setData] = React.useState({
        email: '',
        password: '',
        check_textInputChange: false,
        secureTextEntry: true,
        isValidUser: true,
        isValidPassword: true,
    });

    const { signIn } = React.useContext(AuthContext);

    const { colors } = useTheme();


    const textInputChange = (val) => {
        if( val.trim().length >= 4 ) {
            setData({
                ...data,
                email: val,
                check_textInputChange: true,
                isValidUser: true
            });
        } else {
            setData({
                ...data,
                email: val,
                check_textInputChange: false,
                isValidUser: false
            });
        }
    }

    const handlePasswordChange = (val) => {
        if( val.trim().length >= 8 ) {
            setData({
                ...data,
                password: val,
                isValidPassword: true
            });
        } else {
            setData({
                ...data,
                password: val,
                isValidPassword: false
            });
        }
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const handleValidUser = (val) => {
        if( val.trim().length >= 4 ) {
            setData({
                ...data,
                isValidUser: true
            });
        } else {
            setData({
                ...data,
                isValidUser: false
            });
        }
    }

    const loginHandle = async (email, password) => {
        setActive(true)
        if (! email || !password){
            Alert.alert('Utilisateur invalide!', 'E-mail ou mot de passe incorrect.', [
                {text: 'ok'}
            ]);
            setActive(false)
            return;
        }
        try {
            await auth().signInWithEmailAndPassword(email, password)
            .then(res => {
                if(!res.user.emailVerified){
                    Alert.alert("Votre compte n'est pas activé", 'Merci de consulter votre boite mail et valider votre compte.', [
                        {text: 'ok'}
                    ]);
                    setActive(false)
                    return
                }
                console.log('User account created & signed in!', res.user);
                signIn(res)
            })
            .catch(error => {
                if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password' ) {
                    console.log('That email address is invalid !');
                    Alert.alert('Utilisateur invalide !', 'E-mail ou mot de passe incorrect.', [
                        {text: 'ok'}
                    ]);
                    setActive(false)
                    return;
                }
                if(error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' ){
                    Alert.alert('E-mail invalide !', 'Votre e-mail est introuvable.', [
                        {text: 'ok'}
                    ]);
                }
                setActive(false)
                console.error(error);
            });
            
        // eslint-disable-next-line no-unreachable
        } catch (error) {
        // Add custom logic to handle errors
        console.log('error',error);
        setActive(false)
        }

    }
      

    return (


      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.text_header}>Bienvenue !</Text>
        </View>
        <ProgressDialog
                visible={active}
                title="En cours de traitement"
                message="Veuillez patienter"
            />
        <Animatable.View 
            animation="fadeInUpBig"
            style={[styles.footer, {
                backgroundColor: colors.background
            }]}
        >
            <Text style={[styles.text_footer, {
                color: colors.text
            }]}>E-mail</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="user-o"
                    color={colors.text}
                    size={20}
                />
                <TextInput 
                    placeholder="Votre E-mail"
                    placeholderTextColor="#666666"
                    style={[styles.textInput, {
                        color: colors.text
                    }]}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputChange(val)}
                    onEndEditing={(e)=>handleValidUser(e.nativeEvent.text)}
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
            { data.isValidUser ? null : 
            <Animatable.View animation="fadeInLeft" duration={500}>
            <Text style={styles.errorMsg}>E-mail incorrecte !</Text>
            </Animatable.View>
            }
            

            <Text style={[styles.text_footer, {
                color: colors.text,
                marginTop: 35
            }]}>Mot de passe</Text>
            <View style={styles.action}>
                <Feather 
                    name="lock"
                    color={colors.text}
                    size={20}
                />
                <TextInput 
                    placeholder="Votre mot de passe"
                    placeholderTextColor="#666666"
                    secureTextEntry={data.secureTextEntry ? true : false}
                    style={[styles.textInput, {
                        color: colors.text
                    }]}
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
            { data.isValidPassword ? null : 
            <Animatable.View animation="fadeInLeft" duration={500}>
            <Text style={styles.errorMsg}>Le mot de passe doit comporter 8 caractères.</Text>
            </Animatable.View>
            }
            

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                <Text style={{color: Colors.btnSplash, marginTop:15}}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
            <View style={styles.button}>
                <TouchableOpacity
                    style={styles.signIn}
                    //onPress={() => {loginHandle( data.email, data.password )}}
                    onPress={() => {loginHandle(data.email, data.password)}}
                >
                <LinearGradient
                    colors={[Colors.btnSplash, Colors.btnSplash]}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>S'identifier</Text>
                </LinearGradient>
                </TouchableOpacity>

                {/* <TouchableOpacity
                    onPress={() => navigation.navigate('SignUpScreen')}
                    style={[styles.signIn, {
                        borderColor: Colors.btnSplash,
                        borderWidth: 1,
                        marginTop: 15
                    }]}
                >
                    <Text style={[styles.textSign, {
                        color: Colors.btnSplash
                    }]}>S'inscrire</Text>
                </TouchableOpacity> */}
            </View>
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
        flex: 3,
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
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
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
    }
  });
