import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput,ScrollView } from 'react-native';
import { TextArea, Center, Text, Stack, NativeBaseProvider, Input, Image, Button, Heading } from "native-base"
import {Colors} from '../../styles'
import {useTheme} from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';

import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import ImagePicker from 'react-native-image-crop-picker';

const AddPostScreen = ({navigation}) => {

  const bs = React.createRef();
  const fall = new Animated.Value(1);
  const {colors} = useTheme();
  const [photo, setPhoto] = React.useState('https://cdn.pixabay.com/photo/2017/11/10/05/24/add-2935429_1280.png');

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

  const select_from_gallery = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true
    }).then(image => {
      console.log(image.path);
      setPhoto(image.path)
      bs.current.snapTo(1)
    });

  }

  const select_from_camera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
    }).then(image => {
      console.log(image.path);
      setPhoto(image.path)
      bs.current.snapTo(1)
    });
  }


    return (
      <NativeBaseProvider  style={styles.container}>
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
            <ScrollView>
              <Animatable.View 
                  animation="fadeInUpBig"
                  
              >
              
                <View>
                    <View style={{backgroundColor: "#fff", justifyContent: 'center', alignItems: 'center', marginVertical:20}}>
                      <Text style={{fontWeight: "bold", fontSize: 16,}}>Publier un post</Text>
                    </View>
                    <View  style={styles.action}>
                      <FontAwesome style={{marginTop:20}} name="user-o" color={Colors.btnSplash} size={20} />
                      <TextInput
                          placeholder="description..."
                          placeholderTextColor="#666666"
                          autoCorrect={false}
                          numberOfLines={4}
                          multiline={true}
                          style={[
                          styles.textInput,
                          {
                              color: "#000000",
                          },
                          ]}
                      />
                    </View>
                    <TouchableOpacity style={{backgroundColor: "#fff", justifyContent: 'center', alignItems: 'center'}} onPress={() => bs.current.snapTo(0)}>
                      <Image
                        source={{
                          uri: photo,
                        }}
                        alt="Alternate Text"
                        size={"xl"}
                        style={{marginTop: 30}}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commandButton} onPress={() => {}}>
                        <Text style={styles.panelButtonTitle}>Mise à joure</Text>
                    </TouchableOpacity>
                </View>
              </Animatable.View>
            </ScrollView>
          </Animated.View>
      </NativeBaseProvider>
    );
};

export default AddPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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