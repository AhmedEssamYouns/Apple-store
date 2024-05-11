import React, { useState,useEffect} from "react";
import { Pressable , Text ,StyleSheet , View , Image } from "react-native";
import { router } from "expo-router";
import { FIREBASE_AUTH } from "../app/FirebaseConfig";
import { getUser , editUser } from "../Firebase/users";
import img from '../assets/images/profile.jpg';
import { downloadImage } from "../Firebase/storage";
import { getMessage } from "../Firebase/messages";


export default function Chat({chat}){
    const [message , setMessage]=useState('');
    const [image , setImage] = useState(null);
    const [found , setFound] = useState(true);
    useEffect(()=>{
        wheneOutChat();
        getImage();
        getLastMessage();
    },[]);

    const wheneOutChat = async()=>{
        await editUser(chat.members[0],{onChatNow:false});
    }

    const getLastMessage = async()=>{
        setMessage(chat.lastMessage?await getMessage(chat.members[0],chat.lastMessage):{titel:"get start chat"});
    }
    const getImage = async()=>{
        const freind = await getUser(chat.members[0]);
        setImage(freind.image ? await downloadImage(chat.cover) : null);
        setFound(freind.image != '');
    }

    return(
        <Pressable
            onPress={async()=>{
                await editUser(chat.members[0],{onChatNow:true});
                router.navigate('/Chat');
            }}
            style={({ pressed }) => [
                {
                    flexDirection:'row',
                    backgroundColor: pressed? '#dcdcdc':'#fff',
                    justifyContent:'space-between',
                    alignItems:'center',
                    width:'100%',
                    marginVertical:10,
                    padding:8
                },
                
            ]}
        >
            <View style={styles.cover}>
            {image && found?<Image source={{uri:image}} style={styles.image} />:
                            <Image source={img} style={styles.image} />}
            </View>
            <View style={styles.masseag}>
                <Text style={styles.title}>{chat.name}</Text>
                <View style={styles.lastMessage}>
                    <Text style={styles.text}>{message.titel}</Text>
                </View>
            </View>
            <View style={styles.time}>
                <Text style={styles.text}>{message.time}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    masseag:{
        flex:4,
        // backgroundColor:'red',
        height:'80%',
        padding:8,
        
        
    },
    title:{
        fontSize:20
    },
    cover:{
        flex:2.5
    },
    time:{
        flex:1.4,
        // backgroundColor:'blue'
    },
    image:{
        // backgroundColor:'blue',
        width:100,
        height:100,
        borderRadius:50
    },
    text:{
        color:'gray',
        fontSize:13,
        textAlign:'left',
    },
    lastMessage:{
        flexDirection:'row',
    },
    wrapperCustom: {
      borderRadius: 2,
      padding: 8,
    },
  });
