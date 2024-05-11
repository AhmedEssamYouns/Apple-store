import React, { useEffect, useState } from "react";
import { View,StyleSheet , Text,Pressable, TextInput } from "react-native";
import { FIREBASE_AUTH } from "../app/FirebaseConfig";

export default function Message({id,text , time , userId,getSelected , handelSelect}){
    const [title , setTitel]=useState(text);
    const [backgroundColor, setBackgroundColor] = useState('');
    useEffect(()=>{
        const selected = getSelected();
        if(selected.includes(id)){
            setBackgroundColor('gray');
        }else{
            setBackgroundColor('');
        } 
    })

    return(
        <Pressable
            onPress={()=>{
                // if(userId==FIREBASE_AUTH.currentUser.email){
                //     if(backgroundColor=='#fff'){
                //         setBackgroundColor('gray');
                //     }else{
                //         setBackgroundColor('#fff');
                //     }
                //     handelSelect(id);
                // }
            }}
            style={({ pressed }) => [
                {
                    flex: 1,
                    alignItems: FIREBASE_AUTH.currentUser.email?userId==FIREBASE_AUTH.currentUser.email? "flex-end":"flex-start":userId=='admin'? "flex-end":"flex-start",
                    backgroundColor: backgroundColor,
                    justifyContent: "center",
                    paddingHorizontal:8,
                    marginVertical:2
                },
                
            ]}
        >

            <View style={{
                flexDirection:'row',
                backgroundColor:FIREBASE_AUTH.currentUser.email?userId==FIREBASE_AUTH.currentUser.email?'#F7F7F7':'#aaa':userId=='admin'?'#F7F7F7':'#aaa',
                padding:5,
                paddingBottom:0,
                marginVertical:5,
                borderRadius:10,
                borderTopRightRadius:FIREBASE_AUTH.currentUser.email?userId!=FIREBASE_AUTH.currentUser.email?10:0:userId!='admin'?10:0,
                borderTopLeftRadius:FIREBASE_AUTH.currentUser.email?userId!=FIREBASE_AUTH.currentUser.email?10:0:userId!='admin'?10:0,
                maxWidth:'70%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.82,
                elevation: 5,
                
            }}>
                {(FIREBASE_AUTH.currentUser.email?userId!=FIREBASE_AUTH.currentUser.email:userId!='admin')?(
                    <>
                        <View style={styles.state}>
                            <Text style={styles.time}>{time}</Text>
                        </View>
                            <Text style={styles.text}>{text}</Text>
                        
                    </>
                ):(
                    <>
                        {false?(
                            <TextInput
                             style={styles.text}
                             value={title}
                             onChangeText={setTitel}
                             autoFocus
                             multiline
                            />
                        ):(
                            <Text style={styles.text}>{text}</Text>
                        )}
                        <View style={[styles.state,{justifyContent:FIREBASE_AUTH.currentUser.uid?userId!=FIREBASE_AUTH.currentUser.uid?'flex-start':'flex-end':userId!='admin'?'flex-start':'flex-end',}]}>
                            <Text style={styles.time}>{time}</Text>
                        </View>
                    </>
                )}
                
            </View>
        
    </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 3,
        alignItems: "flex-end",
        justifyContent: "center",
    },
    text:{
        color:'black',
        fontSize:17,
        fontFamily: 'SunshineRegular',
        
        marginHorizontal:5,
        maxWidth:'70%'  
    },
    state:{
        width:'auto',
        padding:8,
        alignItems:'flex-end',
        flexDirection:'row',
        // backgroundColor:'red'
    },
    time:{
        color:'#333',
        marginTop:3,
        fontSize:10
    },
    
  });
