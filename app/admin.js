import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ContactUsPage from './contact'
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
const AdminPage = () => {
    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.title}>Welcome Admin</Text>
                <Feather name='log-out' size={25} onPress={()=>router.replace('signIN')}></Feather>
            </View>
            <ContactUsPage />
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.button} onPress={() => console.log('Dashboard')}>
                    <Text style={styles.buttonText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => console.log('Settings')}>
                    <Text style={styles.buttonText}>Settings</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 100,
        width: '100%',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: 'white',
        paddingTop: 50,
        paddingBottom: 10,
        elevation: 5,
        borderBottomWidth: 2,
        borderBottomColor:'#f7f7f7'
    },
    title: {
        fontSize: 24,
        fontFamily: 'SunshineRegular'
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingBottom: 10,
    },
    button: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#657786',
        fontFamily:'SunshineRegular',
    },
});

export default AdminPage;
