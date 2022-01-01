import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../styles'
import moment from 'moment';
import 'moment/locale/fr'
import {useSelector, useDispatch} from 'react-redux';
import {getErrors} from '../../redux/actions';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';

import {
    Title,
    Caption,
} from 'react-native-paper';

import { Avatar, Text, NativeBaseProvider, Image, Center, Box, Stack, TextArea, Input } from "native-base";

const ErrorsScreen = ({navigation}) => {
    const [isFetching, setIsFetching] = useState(false);
    const {errorsFB} = useSelector(state => state.getErrorsReducer);
    const dispatch = useDispatch();
    const fetchMyErrorsFB = () => dispatch(getErrors());
    const isFocused = useIsFocused();
    let hour = Date.parse(new Date().getHours());
    moment.locale('fr')
    
    const fetchData = () => {
      fetchMyErrorsFB()
      setIsFetching(false);
    };

    const onRefresh = () => {
      hour = Date.parse(new Date().getHours());
      setIsFetching(true);
      fetchData();
    };

    useEffect(() => {
      if(isFocused){
        fetchMyErrorsFB()
      }
    },[isFocused]);


    const showAlert = (item) =>{
        Alert.alert(
            "Supprimer cette anomalie",
            "Vous voulez supprimer cette anomalie?",
            [
                { 
                  text: "Cancel", 
                  onPress: () => console.log("Cancel Pressed") 
                },

                {
                  text: "Supprimer",
                  onPress: () => deleteError(item.id_sing)
                }
  
            ]
        );
    }

    const deleteError = async (id) => {
        await firestore()
            .collection("signalisation")
            .doc(id)
            .delete()
            .then(() => {
                console.log('error removed!');
                fetchMyErrorsFB()
            });
    }

        
    const showCard =  ({item})=>   
      (
        <Center>
        <Box
        bg="white"
        shadow={1}
        rounded="lg"
        style={{backgroundColor: Colors.cardBg, marginBottom: 10, width: '95%'}}
        >
          <Stack space={4} style={{ padding: 15}} >
            <TouchableOpacity onPress={() => showAlert(item._data)}>
                <View style={{flexDirection:'row',marginTop: 5}}>
                    <Avatar
                        source={{
                        uri: item._data.avatar + '?random_number=' +hour,
                        }}
                    />
                    <View style={{marginLeft:15, flexDirection:'column'}}>
                        <Title style={{fontSize: 15, color: "#000"}}>{item._data.display_name}</Title>
                        <Caption style={[styles.caption,{color: "#000"}]}>{moment(item._data.time).fromNow()}</Caption>
                    </View>
                </View>
                
                <Text lineHeight={[5, 5, 7]} noOfLines={[4, 4, 2]} color="#000">
                {item._data.content}
                </Text>
            </TouchableOpacity>
          </Stack>
        </Box>
        </Center>
      )

    return (

      <SafeAreaView style={styles.container}>
        <NativeBaseProvider style={{marginTop: 0,marginBottom: '10', flex: 1, backgroundColor: '#fff'}}>
            <FlatList
              data={errorsFB}
              style={{marginTop:30, marginBottom: '20%', marginHorizontal: 15}}
              renderItem={showCard}
              keyExtractor={(item) => item._data.id_sing}
              onRefresh={() => onRefresh()}
              refreshing={isFetching}
              ListHeaderComponent={null}
              ListFooterComponent={null}
              showsVerticalScrollIndicator={false}
            />
        </NativeBaseProvider>
      </SafeAreaView>
    );
};

export default ErrorsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    //alignItems: 'center', 
    //justifyContent: 'center',
    backgroundColor: "#fff"
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },

});
