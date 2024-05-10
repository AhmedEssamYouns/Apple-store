import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProductsPage from './dashboard/manageProducts';
// Import other components as needed

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('Products'); // State to track active tab

    // Function to render screen based on active tab
    const renderScreen = () => {
        switch (activeTab) {
            case 'Products':
                return <ProductsPage />;
            // Add cases for other screens
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.title}>Welcome Admin</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <FontAwesome name='comments' size={25}></FontAwesome>
                    <Feather name='log-out' size={25} onPress={() => router.replace('signIN')}></Feather>
                </View>
            </View>
            {renderScreen()} 
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setActiveTab('Products')} 
                >
                    <Feather
                        name="shopping-bag"
                        size={20}
                        color={activeTab === 'Products' ? '#1DA1F2' : '#657786'}
                    />
                    <Text style={styles.buttonText}>Products</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setActiveTab('Users')} 
                >
                    <FontAwesome
                        name="user"
                        size={20}
                        color={activeTab === 'Users' ? '#1DA1F2' : '#657786'} 
                    />
                    <Text style={styles.buttonText}>Users</Text>
                </TouchableOpacity>
             
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setActiveTab('Discount Codes')}
                >
                    <Feather
                        name="percent"
                        size={20}
                        color={activeTab === 'Discount Codes' ? '#1DA1F2' : '#657786'} 
                    />
                    <Text style={styles.buttonText}>Discount</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setActiveTab('Reviews')} 
                >
                    <FontAwesome
                        name="star"
                        size={20}
                        color={activeTab === 'Reviews' ? '#1DA1F2' : '#657786'} 
                    />
                    <Text style={styles.buttonText}>Reviews</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setActiveTab('Emails')} 
                >
                    <Feather
                        name="mail"
                        size={20}
                        color={activeTab === 'Emails' ? '#1DA1F2' : '#657786'} 
                    />
                    <Text style={styles.buttonText}>Emails</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setActiveTab('Orders')}
                >
                    <Feather
                        name="list"
                        size={20}
                        color={activeTab === 'Orders' ? '#1DA1F2' : '#657786'}
                    />
                    <Text style={styles.buttonText}>Orders</Text>
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
        gap: 80,
        width: '100%',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: 'white',
        paddingTop: 50,
        paddingBottom: 10,
        elevation: 5,
        borderBottomWidth: 2,
        borderBottomColor: '#f7f7f7'
    },
    title: {
        fontSize: 20,
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
        paddingVertical: 15, // Increased padding for better spacing
        paddingHorizontal: 10, // Added horizontal padding
        elevation: 5, // Added elevation for shadow (Android)
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center', // Center button content vertically
        paddingVertical: 10,
    },
    buttonText: {
        fontSize: 10, // Reduced font size for button text
        color: '#657786',
        marginTop: 5, // Added margin top for better spacing between icon and text
        fontFamily: 'SunshineRegular',
    },
});

export default AdminPage;
