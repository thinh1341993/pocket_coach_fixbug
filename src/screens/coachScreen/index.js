import React, {useEffect, useState}  from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Text, RefreshControl } from 'react-native';

import {NativeBaseProvider, Image} from 'native-base';
import StarRating from 'react-native-star-rating';
import {Colors} from '../../styles'
import {useSelector, useDispatch} from 'react-redux';
import {getCoachs} from '../../redux/actions';
import { useIsFocused } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const cardGap = 16;

const cardWidth = (Dimensions.get('window').width - cardGap * 3) / 2;

const CoachScreen = ({navigation}) => {
  const {coachs} = useSelector(state => state.coachsReducer);
  const [refreshing, setRefreshing] = React.useState(false);
  const isFocused = useIsFocused();
  const [dataCoach, setDataCoach] = useState([]);

  const dispatch = useDispatch();
  const fetchCoachFB = () => dispatch(getCoachs());

  useEffect(() => {
    if(isFocused){
      console.log("useEffect coach", true)
      fetchCoachFB()
    }
      
  },[isFocused]);


  useEffect(async() => { 
    const unsubscribe = await firestore()
                              .collection('users')
                              .where('role', '==' , "coach")
                              .limit(100)
                              .onSnapshot(snap => {
                                if(snap){
                                const data = snap.docs.map(doc => doc.data())
                                //console.log("unsubscribe Posts:", data)
                                setDataCoach(data)
                                }
                        })
    //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
    return () => unsubscribe()
  }, []);

  const fetchData = () => {
    setRefreshing(false);
    fetchCoachFB()
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  

  const rateme = (stars) => {
    console.log("stars:", stars)
    let count = 0
    let sum = 0
    let rate = (sum / count)
    if (stars){
      stars.forEach(function(value, index){
        count++;
        sum += value.rate ;
      });
      rate = (sum / count)
      return rate
    }
    return rate
  }


  return (
    <NativeBaseProvider>
    <View style={styles.container} >
      <ScrollView style={{backgroundColor: "#fff",marginBottom: '20%'}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            backgroundColor: "#fff"
            
          }}
        >
          {dataCoach.map((item, i) => {
            return (
              <View
                key={item.uid}
                style={{
                  marginTop: cardGap,
                  marginLeft: i % 2 !== 0 ? cardGap : 0,
                  width: cardWidth,
                  height: 180,
                  backgroundColor: Colors.cardBg,
                  borderRadius: 16,
                  shadowOpacity: 0.2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity onPress={() => navigation.navigate('CoachProfileScreen', {cdata: item})} >
                    <Image alt="Alternate Text" source={{uri: item.photo}} style={{justifyContent: 'center', alignContent: 'center', borderColor: "black", borderRadius:75,height: 90, width: 90}}/>
                    <Text style={{textAlign: "center"}}>{item.firstname } {item.lastname}</Text>
                    <Text style={{textAlign: "center"}}>Contactez moi !</Text>
                    <StarRating
                            disabled={true}
                            emptyStar={'star'}
                            fullStar={'star'}
                            halfStar={'star-half'}
                            iconSet={'FontAwesome'}
                            maxStars={5}
                            rating={rateme(item.peopleratedyou)}
                            fullStarColor={Colors.btnSplash}
                            starSize= {20}
                      />
                      <Text style={{textAlign: "center"}}>({item.peopleratedyou ? item.peopleratedyou.length : 0} personnes)</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
      </View>
    </NativeBaseProvider>
  );
};

export default CoachScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: "#ffffff"
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
