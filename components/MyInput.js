import React , {useState}from 'react';
import {TextInput , StyleSheet, View, Pressable} from 'react-native';
import {FontAwesome } from '@expo/vector-icons'; 

export default function MyInput({placeholder , onPress , width , icon , secure , keyboardType , value , setValue , editable, multiline , color,borderRadius,clear }){
    const [showPassword, setShowPassword] = useState(secure); 
  
    // Function to toggle the password visibility state 
    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    }; 
    return(
        <View style={{
                width:'80%',
                borderRadius:borderRadius||50,
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#F7F7F7', 
                paddingHorizontal: multiline?10:6,
                paddingVertical:multiline?10:0,
                marginTop:multiline?10:0,
                marginBottom:10,
                marginHorizontal:5,
                borderRightColor:'black',
                borderRightWidth:multiline?0:1,
                borderLeftColor:'black',
                borderLeftWidth:multiline?0:1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.82,
                elevation: 5,
            }}>
            <TextInput
            style={{
                
                flex:1,
                padding:6,
                alignItems :'center',
                height:45,
                fontFamily: 'SunshineRegular',
                marginHorizontal:5,
                fontSize:15,
                color:'black',
                
            }}
            placeholder={placeholder}
            secureTextEntry={showPassword}
            value={value}
            onChangeText={setValue} 
            editable={editable}
            multiline={multiline}
            keyboardType={keyboardType}
            placeholderTextColor='gray'
            />
            {!multiline?(
                <Pressable
                    onPress={onPress}
                    style={({ pressed }) => [
                        {
                            backgroundColor:pressed ? "#dcdcdc" :'',
                            borderRadius: 50,
                            padding: 2,
                        },
                        styles.wrapperCustom,
                    ]}
                >
                <FontAwesome
                    name='search'
                    size={25}
                    style={styles.icon} 
                    color="#aaa" 
                    onPress={onPress} 
                    />  
                </Pressable>
            ):''}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        
    }, 
    icon: {
        padding: 10, 
    }, 
  });
