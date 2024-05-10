import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProductsPage from './dashboard/manageProducts';
import UsersPage from './dashboard/manageUsers';
import DiscountCodesPage from './dashboard/manageCodes';
import ReviewsPage from './dashboard/manageReviews';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import ContactMessagesPage from './dashboard/manageEmails';
import OrdersPage from './dashboard/manageOrders';
import { collection, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from './FirebaseConfig';
import { useEffect } from 'react';
// Import other components as needed

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('Products'); // State to track active tab

    const [products, setProducts] = useState(false);
    const [orders, setOrders] = useState(false);
    const [contact, setContact] = useState(false);
    const [notReadyOrdersCount, setNotReadyOrdersCount] = useState(0);
    const [notRespondedMessagesCount, setNotRespondedMessagesCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [loading, setLoading] = useState(true);

    function getProducts() {
        const productsRef = collection(db, "products");
        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            const productsData = [];
            let outOfStockCount = 0;
            snapshot.forEach((doc) => {
                const productData = { id: doc.id, ...doc.data() };
                if (productData.quantity === 0) {
                    outOfStockCount++;
                }
                productsData.push(productData);
            });
            setProducts(productsData);
            setOutOfStockCount(outOfStockCount);
            setLoading(false)
        }, (error) => {
            console.error("Error getting products from Firestore: ", error);
        });

        return unsubscribe;
    }

    useEffect(() => {
        const unsubscribeOrders = getOrders();
        const unsubscribeContact = getContact();
        const unsubscribeProducts = getProducts();
        return () => {
            unsubscribeOrders();
            unsubscribeContact();
            unsubscribeProducts();
        };
    }, []);

    function getOrders() {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const notReadyOrdersData = ordersData.filter(
                (order) => order.isReady === 'no'
            );
            setNotReadyOrdersCount(notReadyOrdersData.length);
            setOrders(ordersData);
        });

        return unsubscribe;
    }

    function getContact() {
        const contactMessagesCollectionRef = collection(db, 'contacts');
        const orderByDate = orderBy('createdAt');
        const contactMessagesQuery = query(
            contactMessagesCollectionRef,
            orderByDate
        );
        const unsubscribe = onSnapshot(contactMessagesQuery, (querySnapshot) => {
            const contactMessagesData = [];
            querySnapshot.forEach((doc) => {
                const contactMessageData = doc.data();
                contactMessageData.id = doc.id;
                contactMessagesData.push(contactMessageData);
            });
            const notRespondedMessagesData = contactMessagesData.filter(
                (contactMessage) => !contactMessage.responded
            );
            setNotRespondedMessagesCount(notRespondedMessagesData.length);
            setContact(contactMessagesData);
        });

        return unsubscribe;
    }



    const handleBackButton = useCallback(() => {
        if (activeTab === 'Products') {
            BackHandler.exitApp();
            return true; // disable going back
        } else {
            setActiveTab('Products');
            return true; // disable going back
        }
    }, [activeTab]);

    useFocusEffect(
        React.useCallback(() => {

            BackHandler.addEventListener('hardwareBackPress', handleBackButton);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
            };
        }, [handleBackButton, activeTab])
    );
    // Function to render screen based on active tab
    const renderScreen = () => {
        switch (activeTab) {
            case 'Products':
                return <ProductsPage />;
            case 'Users':
                return <UsersPage />;
            case 'Discount Codes':
                return <DiscountCodesPage />
            case 'Reviews':
                return <ReviewsPage />
            case 'Emails':
                return <ContactMessagesPage />
            case 'Orders':
                return <OrdersPage />
            default: return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.title}>Admin panal</Text>
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
                    {outOfStockCount > 0 ? <View style={{backgroundColor:'#1DA1F2',width:20,height:20,alignItems:'center',justifyContent:"center",borderRadius:20,position:'absolute',bottom:40,left:27}}>
                        <Text style={{fontFamily:'lonsfont',color:'white',fontSize:12}}>{outOfStockCount}</Text>
                    </View> : null}
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
                    {notReadyOrdersCount > 0 ? <View style={{backgroundColor:'#1DA1F2',width:20,height:20,alignItems:'center',justifyContent:"center",borderRadius:20,position:'absolute',bottom:40,left:27}}>
                        <Text style={{fontFamily:'lonsfont',color:'white',fontSize:12}}>{notRespondedMessagesCount}</Text>
                    </View> : null}
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
                    {notReadyOrdersCount > 0 ? <View style={{backgroundColor:'#1DA1F2',width:20,height:20,alignItems:'center',justifyContent:"center",borderRadius:20,position:'absolute',bottom:40,left:27}}>
                        <Text style={{fontFamily:'lonsfont',color:'white',fontSize:12}}>{notReadyOrdersCount}</Text>
                    </View> : null}
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
        gap: 130,
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
