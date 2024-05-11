import React , {useCallback, useEffect, useState} from "react";
import { View , StyleSheet, ActivityIndicator, FlatList, Pressable ,Text,Image } from "react-native";
import { FIREBASE_AUTH } from "./FirebaseConfig";
import { MaterialCommunityIcons} from '@expo/vector-icons'; 
import MyInput from '../components/MyInput';
import Message from '../components/Message';
import { addMessage , getMessage , getMessages ,subscribe, updateMessage , deleteMessage } from "../Firebase/messages";
import { downloadImage } from "../Firebase/storage";
import { editUser, getUser, getAdmin, getUsers } from '../Firebase/users';
import { getChat, setChat, updateChat } from "../Firebase/chat";
import img from '../assets/images/profile.jpg';
import { router } from "expo-router";

export default function Messages(){
    const [data , setData] = useState([]);
    const [selected , setSelected] = useState([]);
    const [text , setText] = useState('');
    const [user , setUser] = useState(getUser(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((getUsers()).find(user=>user.onChatNow)).email));
    const [image,setImage] = useState(null);
    const [freind , setFreind] = useState('');
    const [isEditMode , setEditMode] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [sendColor , setSendColor] = useState('#fff');
    const [found , setFound] = useState(true);
    const [isAdmin , setIsAdmin] = useState(false);
    useEffect(useCallback(()=>{
        Messages()
    },[]));

    useEffect(()=>{
        Me();
        userIsAdmin();
        getImage();
    },[])

    const userIsAdmin = async()=>{
        // const user = await getUser(FIREBASE_AUTH.currentUser.uid);
        // const admin = await getAdmin();
        // const IsAdmin = user.id == admin.id;
        setIsAdmin(false); 
        if(!false){
          const adminChat = await getChat(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((await getUsers()).find(user=>user.onChatNow)).email);
          if(!adminChat){
            await setChat( FIREBASE_AUTH.currentUser.email , {admin:'',name:FIREBASE_AUTH.currentUser.displayName ,members:[FIREBASE_AUTH.currentUser.email, '']});
        }
        // await editUser(FIREBASE_AUTH.currentUser.email , {onChatNow:true});
        }
      }

    const Me = async()=> {
        const me = await getUser(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((await getUsers()).find(user=>user.onChatNow)).email);
        setUser(me);
        setFreind(me.onChat ? await getUser(me.onChat) : '');
    }

    const getImage = async()=>{
        setImage(freind.image ? await downloadImage(freind.image) : null);
        setFound(freind.image != '');
    }

    useEffect(() => {
        // u = JSON.parse(AsyncStorage.getItem("user"))
            
            const unsubscribe = subscribe(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((getUsers()).find(user=>user.onChatNow)).email , ({ change, snapshot }) => {
          //   console.log("changes", change, snapshot, change.type);
          // if (snapshot.metadata.hasPendingWrites) {
                if (change.type === "added") {
                    Messages();
                }
                if (change.type === "modified") {
                    Messages();
                }
                if (change.type === "removed") {
                    Messages();
                }
            });
            
            return () => {
                unsubscribe();
            };
            
        
        }, [FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((getUsers()).find(user=>user.onChatNow)).email]);
        
    const Messages = async()=>{
        const Data = await getMessages(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((getUsers()).find(user=>user.onChatNow)).email);
        setData(Data.slice().sort((a, b) => b.currentTime - a.currentTime));
        setLoading(false);
    }
    const handelSend = async ()=>{
        if(text != ''){
            const t = text;
            setText('');
            const date = new Date();
            const hour = date.getHours() % 12 < 10 ? `0${date.getHours() % 12}`:date.getHours() % 12;
            const min = date.getMinutes() < 10 ? `0${date.getMinutes()}`:date.getMinutes();
            const time = `${hour}:${min} ${date.getHours() < 12?'am':'pm'}`;
            const newMessage = {titel:t , time: time , userId:FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:'admin'};
            const id = await addMessage(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((await getUsers()).find(user=>user.onChatNow===true)).email , newMessage );
            await updateChat(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((await getUsers()).find(user=>user.onChatNow== true)).email ,{lastMessage:id});
        }
    }

    const handelSelect = id => setSelected(selected.includes(id) ? selected.filter((i)=>i != id) : [...selected , id]);

    const handelDelete = async()=>{
        selected.forEach(async(mid)=>{
            await deleteMessage(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((await getUsers()).find(user=>user.onChatNow)).email , mid);
        });
        await updateChat(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((await getUsers()).find(user=>user.onChatNow)).email , {lastMessage:selected.length==data.length?'':data[selected.length].id});
        setSelected([]);
    }

    const getSelected = () => selected;

    const handelEdit = async()=>{
        const message = await getMessage(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((await getUsers()).find(user=>user.onChatNow)).email , selected[0]);
        setText(message.titel);
        setEditMode(true);
    }

    const handelUpdateMessage = async()=>{
        await updateMessage(FIREBASE_AUTH.currentUser?FIREBASE_AUTH.currentUser.email:((awaitgetUsers()).find(user=>user.onChatNow)).email , selected[0] , {titel:text});
        setText('');
        setEditMode(false);
        setSelected([]);
    }

    const handelCancel = ()=>{
        setEditMode(false);
        setText('');
    }

    return isLoading?(
        <ActivityIndicator size={30}/>
    ):(
        <View style={styles.container}>
            {isAdmin?(
                    <>
                            {selected.length > 0?(
                                    <View style={styles.updateMessage}>
                                        {isEditMode?(
                                            <Pressable
                                                style={({ pressed }) => [
                                                {
                                                  backgroundColor:pressed ? 'gray' : "#fff",
                                                  margin:10,
                                                  borderRadius:10
                                                },
                                              ]}
                                            >
                                                <MaterialCommunityIcons
                                                onPress={handelCancel}
                                                name="close-box" 
                                                size={45} 
                                                color='red'
                                                style={styles.icons}
                                                />
                                            </Pressable>
                                        ):(
                                            <>
                                       {selected.length == 1?
                                       (
                                            <Pressable
                                            style={({ pressed }) => [
                                                {
                                                  backgroundColor:pressed ? 'gray' : "#fff",
                                                  margin:10,
                                                  borderRadius:10
                                                },
                                              ]}
                                            >
                                                <MaterialCommunityIcons
                                                name="comment-edit"
                                                onPress={handelEdit} 
                                                size={45} 
                                                color='green'
                                                style={styles.icons}
                                                />
                                            </Pressable>
                                        ):''}
                                        <Pressable
                                            style={({ pressed }) => [
                                                {
                                                  backgroundColor:pressed ? 'gray' : "#fff",
                                                  margin:10,
                                                  borderRadius:10
                                                },
                                              ]}
                                            >
                                        
                                                <MaterialCommunityIcons
                                                onPress={handelDelete}
                                                name="delete" 
                                                size={45} 
                                                color='red'
                                                style={styles.icons}
                                                />
                                        </Pressable>      
                                            </>
                                        )} 
                                    </View>
                                    ):(
                                    <View style={styles.freind}>
                                        <Pressable 
                                        style={({ pressed }) => [
                                        {
                                            backgroundColor: pressed? '#dcdcdc':'#F7F7F7',
                                            justifyContent:'center',
                                            alignItems:'center',
                                            padding:15,
                                            margin:10,
                                            borderRadius:20,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.25,
                                            shadowRadius: 3.82,
                                            elevation: 5,
                                        },
                                        ]}
                                        >
                                            <MaterialCommunityIcons
                                            name='arrow-left-circle-outline' 
                                            size={40} 
                                            color="#333" 
                                            />
                                        </Pressable>
                                        <Pressable
                                        style={({ pressed }) => [
                                        {
                                        flexDirection:'row',
                                        backgroundColor: pressed? '#dcdcdc':'#fff',
                                        justifyContent:'center',
                                        alignItems:'center',
                                        marginLeft:10,
                                        width:'90%'
                                        },
                                        ]}
                                        >
                                            <View style={styles.cover}>
                                                {image && found?<Image source={{uri:image}} style={styles.image} />:
                                                <Image source={img} style={styles.image} />}
                                            </View>
                                            <View style={styles.masseag}>
                                                <Text style={styles.title}>{freind.name}</Text>
                                                <Text style={styles.text}>{freind.online?'online':'offline'}</Text>
                                            </View>
                                        </Pressable>
                                    </View>
                                    )}
                    </>
                    ):''}       
            <FlatList
            data={data}
            style={styles.list}
            renderItem={({item})=><Message 
                                   id={item.id}
                                   text={item.titel}
                                   time={item.time}
                                   state={item.state}
                                   userId={item.userId}
                                   handelSelect={handelSelect}
                                   getSelected={getSelected}
                                   />
                                } 
            inverted               
            />

            <View style={styles.send}>
                <MyInput placeholder="Message" value={text} setValue={setText} multiline={true}/>
                <Pressable 
                    onPress={isEditMode?handelUpdateMessage:handelSend}
                    style={({ pressed }) => [
                        {
                            marginHorizontal:5,
                            backgroundColor:pressed?'gray':'#657786',
                            width:50,
                            height:50,
                            alignItems:'center',
                            justifyContent:'center',
                            borderRadius:50,
                        },
                        styles.wrapperCustom,
                      ]}
                    >
                <MaterialCommunityIcons
                name={isEditMode?'check':'send'}
                size={30}
                color={sendColor} 
                onPressIn={()=>setSendColor('rgb(33, 150, 243)')}
                onPressOut={()=>setSendColor('#fff')}
                />
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width:'100%',
      alignContent: "center",
      justifyContent: "center",

    },
    freind:{
        flexDirection:'row',
        borderBottomColor:'#d8d8d8',
        borderBottomWidth:1,
        marginTop:30,
    },  
    send:{
        flexDirection:'row',
        alignItems: "center",
        justifyContent: "space-evenly",
    },
    list:{
        marginHorizontal:5
    },
    icons:{
        marginHorizontal:10
    },
    cover:{
        marginRight:20
    },
    title:{
        fontSize:17
    },
    text:{
        width:'90%',
        textAlign:'left',
        fontSize:13,
        color:'gray'
    },
    image:{
        width:50,
        height:50,
        borderRadius:50
    },
    masseag:{
        flex:4,
        height:'80%',
        padding:8
        
    },
    updateMessage:{
        flexDirection:'row',
        borderBottomColor:'#d8d8d8',
        borderBottomWidth:1,
        marginTop:30,
        justifyContent:'flex-end',
        alignItems:'center',
    }
  });
