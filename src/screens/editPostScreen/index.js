import React, {useState} from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput,ScrollView, SafeAreaView, Alert } from 'react-native';
import { TextArea, Center, Text, Stack, NativeBaseProvider, Input, Image, Button, Heading } from "native-base"
import {Colors} from '../../styles'
import {useTheme} from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import ImagePicker from 'react-native-image-crop-picker';
import { ProgressDialog } from 'react-native-simple-dialogs';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const EditPostScreen = ({route,navigation}) => {

  const { cdata } = route.params;
  const [data, setData] = React.useState({
    des: cdata.content,
    uri: cdata.photo_uri
  });
  const [uploading, setUploading] = useState(false);

  let bs2 = React.useRef(null);
  let fall2 = new Animated.Value(1);

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
        onPress={() => bs2.current.snapTo(1)}>
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

  const select_from_gallery = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true
    }).then(image => {
      bs2.current.snapTo(1)
      console.log(image.path);
      setData({...data, uri: image.path})
    });

  }

  const select_from_camera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
    }).then(image => {
      bs2.current.snapTo(1)
      console.log(image.path);
      setData({...data, uri: image.path})
      
    });
  }

  const textInputContent = (val) => {
    setData({...data, des: val})
  }

  const checkPostToCreat = () =>{
    setUploading(true);
    if(data.des != cdata.content && data.uri == cdata.photo_uri){
      updateContentOnly(data.des)
      return
    }
    if(data.des == cdata.content && data.uri != cdata.photo_uri){
      updateImageOnly(data.uri)
      return
    }
    if(data.des == cdata.content && data.uri == cdata.photo_uri){
      setUploading(false)
      return
    }else{
      createPost(data.uri, data.des)
    }
    //setUploading(false)
  }

  const updateContentOnly =async (content) => {
    setUploading(true);
    try {
      //console.log('user home:',userFB)
      let time2 = Date.parse(new Date())
      await firestore()
      .collection('posts')
      .doc(cdata.id_post)
      .update({
        content: content,
      })
      .then(() => {
        console.log('Post updated!');
        setUploading(false);
        Alert.alert(
          'Post enregistrer!',
          'Votre post a ??t??  bien mise a jour??!', [
            {text: 'ok'}
        ]);
        navigation.goBack(null)
      });

    } catch (e) {
      console.error(e);
      setUploading(false);
      Alert.alert(
        'OOPS votre post non enregistrer!',
        "Votre post n'est pas bien pass??!", [
          {text: 'ok'}
      ]);
    }
  }


  const updateImageOnly =async (uri) => {
    setUploading(true);
    try {
      //console.log('user home:',userFB)

      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      let time = Date.parse(new Date())

      console.log('filename:',filename)

      const task = storage()
        .ref('/posts/'+time+filename)
        .putFile(uploadUri);

      try {
        await task;
      } catch (e) {
        console.error(e);
      }

      const url = await storage().ref('/posts/'+time+filename).getDownloadURL();
      let time2 = Date.parse(new Date())
      await firestore()
      .collection('posts')
      .doc(cdata.id_post)
      .update({
        photo_uri: url,
      })
      .then(() => {
        console.log('Post updated!');
        setUploading(false);
        Alert.alert(
          'Post enregistrer!',
          'Votre post a ??t??  bien mise a jour??!', [
            {text: 'ok'}
        ]);
        navigation.goBack(null)
      });

    } catch (e) {
      console.error(e);
      setUploading(false);
      Alert.alert(
        'OOPS votre post non enregistrer!',
        "Votre post n'est pas bien pass??!", [
          {text: 'ok'}
      ]);
    }
  }

  const createPost = async (uri, content) => {
    setUploading(true);
    try {
      //console.log('user home:',userFB)

      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      let time = Date.parse(new Date())

      console.log('filename:',filename)

      const task = storage()
        .ref('/posts/'+time+filename)
        .putFile(uploadUri);

      try {
        await task;
      } catch (e) {
        console.error(e);
      }

      const url = await storage().ref('/posts/'+time+filename).getDownloadURL();
      let time2 = Date.parse(new Date())
      await firestore()
      .collection('posts')
      .doc(cdata.id_post)
      .update({
        photo_uri: url,
        content: content.trim(),
      })
      .then(() => {
        console.log('Post updated!');
        setUploading(false);
        Alert.alert(
          'Post enregistrer!',
          'Votre post a ??t??  bien mise a jour??!', [
            {text: 'ok'}
        ]);
        navigation.goBack(null)
      });

    } catch (e) {
      console.error(e);
      setUploading(false);
      Alert.alert(
        'OOPS votre post non enregistrer!',
        "Votre post n'est pas bien pass??!", [
          {text: 'ok'}
      ]);
    }
  }
    return (
      <View style={styles.container}>
        <NativeBaseProvider style={styles.container}>
            <BottomSheet
            ref={bs2}
            snapPoints={[400, 0]}
            renderContent={() =>renderInner()}
            renderHeader={() => renderHeader()}
            initialSnap={1}
            callbackNode={fall2}
            enabledGestureInteraction={true}
            />
            <Animated.View style={{margin: 20,backgroundColor: "#fff",
              opacity: Animated.add(0.1, Animated.multiply(fall2, 1.0)),
            }}>
              <ScrollView style={{backgroundColor: "#fff"}}>
                <Animatable.View 
                    animation="fadeInUpBig"
                >
                <ProgressDialog
                        visible={uploading}
                        title="En cours de traitement"
                        message="Veuillez patienter"
                />
              
                  <View styles={{backgroundColor: "#fff"}}>
                      <View style={{backgroundColor: "#fff", justifyContent: 'center', alignItems: 'center', marginVertical:20}}>
                        <Text style={{fontWeight: "bold", fontSize: 16,}}>Editer un post</Text>
                      </View>
                      <View  style={styles.action}>
                        <FontAwesome style={{marginTop:20}} name="user-o" color={Colors.btnSplash} size={20} />
                        <TextInput
                            placeholder="description..."
                            placeholderTextColor="#666666"
                            autoCorrect={false}
                            numberOfLines={4}
                            defaultValue={data.des}
                            onChangeText={(val) => textInputContent(val)}
                            multiline={true}
                            style={[
                            styles.textInput,
                            {
                                color: "#000000",
                            },
                            ]}
                        />
                      </View>
                      <TouchableOpacity style={{backgroundColor: "#fff", justifyContent: 'center', alignItems: 'center'}} onPress={() => bs2.current.snapTo(0)}>
                        <Image
                          source={{
                            uri: data.uri,
                          }}
                          alt="Alternate Text"
                          size={"xl"}
                          style={{marginTop: 30}}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.commandButton} onPress={() => checkPostToCreat()}>
                          <Text style={styles.panelButtonTitle}>Mise ?? jour</Text>
                      </TouchableOpacity>
                  </View>
                </Animatable.View>
              </ScrollView>
            </Animated.View>
        </NativeBaseProvider>
      </View>
    );
};

export default EditPostScreen;

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

});