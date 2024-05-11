import React, {useCallback, useEffect, useState } from "react";
import {StyleSheet , FlatList , ActivityIndicator, View ,Text} from "react-native";
import Chat from '../components/Chat';
import { FIREBASE_AUTH } from "./FirebaseConfig";
import MyInput from "../components/MyInput";
import { getChats , subscribe } from "../Firebase/chat";

export default function Chats(){
    const [data , setData] = useState([]);
    const [text, setText] = useState('');
    const [isLoading, setLoading] = useState(true);
    const [onSearchMode , setSearchMode] = useState(false);

    useEffect(()=>{
        Chats();
    },[]);

    // useEffect(() => {
    //     // u = JSON.parse(AsyncStorage.getItem("user"));
    //     const unsubscribe = subscribe(FIREBASE_AUTH.currentUser.email , ({ change, snapshot }) => {
    //       //   console.log("changes", change, snapshot, change.type);
    //       // if (snapshot.metadata.hasPendingWrites) {
    //           if (change.type === "added") {
    //                 Chats();
    //             }
    //             if (change.type === "removed") {
    //                 Chats();
    //             }
    //         });
            
    //         return () => {
    //             unsubscribe();
    //         };
            
    //     }, [FIREBASE_AUTH.currentUser.email,text]);

    
    const Chats = async()=>{
        // if(!onSearchMode){
            const chats = await getChats();
            setData(chats);
            setLoading(false);
        // }
    }

    const handelSearch = async() => {
        // const Data = await getChats();
        // if(text === ''){
        //     setData(Data);
        // }else{
        //     const filtered = Data.filter(c=>((c.name).toUpperCase()).indexOf((text).toUpperCase()) !== -1);
        //     setData(filtered);
        // }
        // setSearchMode(text !== '');
    }

    return isLoading? (
        <ActivityIndicator  size={50}/>
    ):(        
        <View style={styles.container}>
                <View style={styles.search}>
                    <MyInput placeholder="Search" value={text} setValue={setText} onPress={handelSearch} width='80%' icon={true}/>
                </View>
                {data.length === 0 ?(
                    <Text style={styles.text}>No Chats</Text>
                ):(
                <>
                    <FlatList
                    data={data}
                    renderItem={({item})=><Chat chat={item}/>}
                    />
                </>
                )}
        </View>
    )}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      width:'100%'
    },
    search:{
      paddingTop:10,
      width:'100%',
      alignItems:'center',
      justifyContent:'center',
      borderBottomWidth:1,
      borderBottomColor:'#d8d8d8',
    },
    text:{
       flex:2,
       textAlignVertical:'center',
       fontSize:20 
    },  
  });
