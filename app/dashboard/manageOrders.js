import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOrderId, setSearchOrderId] = useState('');
    const [filter, setFilter] = useState('all');
    const filteredOrders = orders.filter((order) =>
        order.username.toLowerCase().startsWith(searchQuery.toLowerCase()) &&
        order.id.toLowerCase().startsWith(searchOrderId.toLowerCase()) &&
        ((filter === 'all') ||
            (filter === 'notReady' && order.isReady === 'no') ||
            (filter === 'notDone' && order.done === 'no') ||
            (filter === 'done' && order.done === 'yes' && order.isReady === 'yes') ||
            (filter === 'ready' && order.isReady === 'yes'))
    );

    useEffect(() => {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setOrders(ordersData);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleDeleteOrder = async (orderId) => {
        const confirmDelete = await new Promise((resolve) => {
            Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this order?',
                [
                    { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                    { text: 'Delete', onPress: () => resolve(true) }
                ],
                { cancelable: true }
            );
        });
        if (confirmDelete) {
            const orderRef = doc(db, 'orders', orderId);
            await deleteDoc(orderRef);
            alert(`Order ID: (${orderId}) deleted`);
        }
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const handleSearchOrderIdChange = (value) => {
        setSearchOrderId(value);
    };

    const handleReadyChange = async (orderId) => {
        const orderRef = doc(db, 'orders', orderId);
        const currentDone = orders.find((order) => order.id === orderId).done;
        if (currentDone === 'yes') {
            alert('Cannot set Ready if order is already done.');
        } else {
            const confirmReady = await new Promise((resolve) => {
                Alert.alert(
                    'Confirm Ready',
                    orders.find((order) => order.id === orderId).isReady === 'no'
                        ? 'Are you sure you want to set this order as Ready?'
                        : 'Are you sure you want to set this order as not Ready?',
                    [
                        { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                        { text: 'Set Ready', onPress: () => resolve(true) }
                    ],
                    { cancelable: true }
                );
            });
            if (confirmReady) {
                await updateDoc(orderRef, {
                    isReady: orders.find((order) => order.id === orderId).isReady === 'no' ? 'yes' : 'no',
                });
            }
        }
    };

    const handleDoneChange = async (orderId) => {
        const orderRef = doc(db, 'orders', orderId);
        const currentIsReady = orders.find((order) => order.id === orderId).isReady;
        const confirmDone = await new Promise((resolve) => {
            Alert.alert(
                'Confirm Done',
                orders.find((order) => order.id === orderId).done === 'no'
                    ? 'Are you sure you want to set this order as Done?'
                    : 'Are you sure you want to set this order as not Done?',
                [
                    { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                    { text: 'Set Done', onPress: () => resolve(true) }
                ],
                { cancelable: true }
            );
        });
        if (confirmDone) {
            if (orders.find((order) => order.id === orderId).done === 'no') {
                await updateDoc(orderRef, { done: 'yes', isReady: 'yes' });
            } else {
                if (currentIsReady === 'no') {
                    await updateDoc(orderRef, { done: 'no' });
                } else {
                    await updateDoc(orderRef, { done: 'no', isReady: 'yes' });
                }
            }
        }
    };

    const getTitle = () => {
        if (filter === 'all') {
            return 'All Orders';
        } else if (filter === 'notReady') {
            return 'New Orders';
        } else if (filter === 'ready') {
            return 'Ready Orders';
        } else if (filter === 'notDone') {
            return 'Not Done Orders';
        } else if (filter === 'done') {
            return 'Done Orders';
        }
    };

    const handleCancelOrder = async (orderId) => {
        const confirmCancel = await new Promise((resolve) => {
            Alert.alert(
                'Confirm Cancel',
                'Are you sure you want to cancel this order?',
                [
                    { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                    { text: 'Confirm', onPress: () => resolve(true) }
                ],
                { cancelable: true }
            );
        });
        if (confirmCancel) {
            const orderRef = doc(db, 'orders', orderId);
            const orderDoc = await getDoc(orderRef);
            if (orderDoc.exists()) {
                const orderData = orderDoc.data();
                const orderItems = orderData.items;
                await Promise.all(
                    orderItems.map(async (item) => {
                        const productRef = doc(db, 'products', item.id);
                        const productDoc = await getDoc(productRef);
                        if (productDoc.exists()) {
                            const productData = productDoc.data();
                            const newQuantity = productData.quantity + item.quantity;
                            await updateDoc(productRef, { quantity: newQuantity });
                        }
                    })
                );
                await deleteDoc(orderRef);
                setOrders(orders.filter((order) => order.id !== orderId));
                alert(`Order ID: (${orderId}) canceled`);
            }
        }
    };

    const handleFilterChange = (filterType) => {
        setFilter(filterType);
    };

    const counts = {
        all: orders.length,
        notReady: orders.filter((order) => order.isReady === 'no').length,
        ready: orders.filter((order) => order.isReady === 'yes').length,
        notDone: orders.filter((order) => order.done === 'no').length,
        done: orders.filter((order) => order.done === 'yes' && order.isReady === 'yes').length,
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    placeholder='Search by username'
                />
                <TextInput
                    style={styles.input}
                    value={searchOrderId}
                    onChangeText={handleSearchOrderIdChange}
                    placeholder='Search by order ID'
                />
            </View>
            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={() => handleFilterChange('all')} style={styles.filterButton}>
                    <Text style={styles.filterText}>All {counts.all > 0 && `(${counts.all})`}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleFilterChange('notReady')} style={styles.filterButton}>
                    <Text style={styles.filterText}>New {counts.notReady > 0 && `(${counts.notReady})`}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleFilterChange('ready')} style={styles.filterButton}>
                    <Text style={styles.filterText}>Ready {counts.ready > 0 && `(${counts.ready})`}</Text>
                </TouchableOpacity>

            </View>
            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={() => handleFilterChange('notDone')} style={styles.filterButton}>
                    <Text style={styles.filterText}>Not Done {counts.notDone > 0 && `(${counts.notDone})`}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleFilterChange('done')} style={styles.filterButton}>
                    <Text style={styles.filterText}>Done {counts.done > 0 && `(${counts.done})`}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1da1f2" style={{ marginTop: 20 }} />
            ) : (
                <>
                    <Text style={styles.title}>{getTitle()}</Text>
                    {filteredOrders.length === 0 ? (
                        <Text>No orders found.</Text>
                    ) : (
                        <View>
                            {filteredOrders.map((order) => (
                                <View key={order.id} style={styles.orderContainer}>
                                    <Text style={styles.orderText}>ID: {order.id}</Text>
                                    <Text style={styles.orderText}>Username: {order.username}</Text>
                                    <Text style={styles.orderText}>Address: {order.Address}</Text>
                                    <Text style={styles.orderText}>Date: {new Date(order.timestamp).toLocaleString()}</Text>
                                    <Text style={styles.orderText2}>Items:</Text>
                                    <View style={{ backgroundColor: "white", padding: 5, margin: 3, borderRadius: 10 ,elevation:1 }}>

                                        {order.items.map((item) => (
                                            <Text key={item.productId} style={styles.orderText}>
                                                {item.name} x ({item.quantity}) - {item.price}
                                            </Text>
                                        ))}
                                    </View>
                                    <Text style={styles.orderText}>Payment Method: {order.paymentMethod}</Text>
                                    <Text style={styles.orderText}>Discount Code: {order.discountCode ? order.discountCode : 'No discount'}</Text>
                                    <Text style={styles.orderText}>Total: ${order.total}</Text>
                                    <Text style={styles.orderText2}>Order State:</Text>
                                    <View style={{ backgroundColor: "white", padding: 5, margin: 3, borderRadius: 10,elevation:1 }}>
                                        <Text style={styles.orderText}>Ready: {order.isReady}</Text>
                                        <Text style={styles.orderText}>Done: {order.done}</Text>
                                    </View>
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity onPress={() => handleReadyChange(order.id)} style={[styles.button, { marginRight: 10 }]}>
                                            <Text style={styles.buttonText}>{order.isReady === 'no' ? 'Set Ready' : 'Set not Ready'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDoneChange(order.id)} style={[styles.button, { marginRight: 10 }]}>
                                            <Text style={styles.buttonText}>{order.done === 'no' ? 'Set Done' : 'Set not Done'}</Text>
                                        </TouchableOpacity>
                                        {order.done === 'yes' ? (
                                            <TouchableOpacity onPress={() => handleDeleteOrder(order.id)} style={[styles.deleteButton, { marginRight: 10 }]}>
                                                <Text style={styles.buttonText}>Delete</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity onPress={() => handleCancelOrder(order.id)} style={[styles.cancelButton, { marginRight: 10 }]}>
                                                <Text style={styles.buttonText}>Cancel</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 40,
        backgroundColor: '#F5F8FA',
    },
    searchContainer: {
        flexDirection: 'column',
        width: '100%',
        alignSelf: 'center',
        alignItems: 'center'
    },
    label: {
        fontFamily: 'lonsfont',
    },
    input: {
        width: '90%',
        padding: 10,
        borderRadius: 13,
        backgroundColor: "white",
        margin: 10,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 5,
    },
    filterContainer: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 10
    },
    filterButton: {
        backgroundColor: "#E1E8ED",
        padding: 4,
        borderRadius: 10
    },
    filterText: {
        fontFamily: 'lonsfont',
        fontSize: 15
    },
    title: {
        padding: 20,
        fontFamily: 'lonsfont',
    },
    orderContainer: {
        marginBottom: 20,
    },
    orderText: {
        fontFamily: 'SunshineRegular',
    },
    orderText2: {
        fontFamily: 'lonsfont',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    button: {
        backgroundColor: 'lightblue',
        padding: 5,
        borderRadius: 10,
    },
    deleteButton: {
        backgroundColor: 'lightcoral',
        padding: 5,
        borderRadius: 10,
    },
    cancelButton: {
        backgroundColor: 'lightgreen',
        padding: 5,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'SunshineRegular',
    },
});

export default OrdersPage;
