import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, Modal, Button, ActivityIndicator } from 'react-native';
import { onSnapshot, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from '../FirebaseConfig';

const UsersPage = () => {
    const [usersData, setUsersData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectedEmail, setSelectedEmail] = useState('');
    const [selectedField, setSelectedField] = useState('');
    const [loading, setLoading] = useState(true); // State to manage loading indicator

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const userData = [];
            snapshot.forEach((doc) => {
                userData.push(doc.data());
            });
            setUsersData(userData);
            setLoading(false); // Set loading to false when data is loaded
        });
        return unsubscribe;
    }, []);

    const handleSearchQuery = (query) => {
        setSearchQuery(query);
    };

    const handleUpdate = async (email, field, newValue) => {
        try {
            const userRef = doc(db, "users", email);
            await updateDoc(userRef, { [field]: newValue });
            Alert.alert("Success", `${field} updated successfully`);
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    const renderUser = ({ item }) => (
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', padding: 10 }}>
            <Text style={{ fontFamily: 'lonsfont' }}>
                Username: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.name}</Text>
            </Text>
            <Text style={{ fontFamily: 'lonsfont' }}>
                Name: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.fullname}</Text>
            </Text>
            <Text style={{ fontFamily: 'lonsfont' }}>
                Email: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.email}</Text>
            </Text>
            <Text style={{ fontFamily: 'lonsfont' }}>
                Phone: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.Phone}</Text>
            </Text>
            <Text style={{ fontFamily: 'lonsfont' }}>
                Address: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.Address}</Text>
            </Text>
            <Text style={{ fontFamily: 'lonsfont' }}>
                Balance: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.balance ? item.balance : 0}</Text>
            </Text>

            <View style={{ flexDirection: 'row', marginTop: 10, gap: 5, alignSelf: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleModalOpen(item.email, 'Address')} style={{ backgroundColor: '#1da1f2', padding: 6, borderRadius: 5 }}>
                    <Text style={{ color: 'white', fontSize: 13, fontFamily: 'SunshineRegular' }}>Update Address</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleModalOpen(item.email, 'balance')} style={{ backgroundColor: '#1da1f2', padding: 6, borderRadius: 5 }}>
                    <Text style={{ color: 'white', fontSize: 13, fontFamily: 'SunshineRegular' }}>Update Balance</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleModalOpen(item.email, 'Phone')} style={{ backgroundColor: '#1da1f2', padding: 6, borderRadius: 5 }}>
                    <Text style={{ color: 'white', fontSize: 13, fontFamily: 'SunshineRegular' }}>Update Phone</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const formatDate = (date) => {
        const formattedDate = new Date(date);
        return formattedDate.toLocaleDateString();
    };

    const handleModalOpen = (email, field) => {
        setSelectedEmail(email);
        setSelectedField(field);
        setModalVisible(true);
        setInputValue('');
    };

    const handleModalClose = () => {
        setModalVisible(false);
    };

    const handleConfirmUpdate = () => {
        handleUpdate(selectedEmail, selectedField, inputValue);
        handleModalClose();
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F8FA', padding: 10, marginBottom: 80 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, marginLeft: 10 }}>Users</Text>
            <TextInput
                style={{ backgroundColor: 'white', borderRadius: 13, padding: 10, marginBottom: 10, elevation: 4 }}
                placeholder="Search by username"
                value={searchQuery}
                onChangeText={handleSearchQuery}
            />
            {loading ? ( // Show loading indicator if data is loading
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={usersData.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                    renderItem={renderUser}
                    keyExtractor={(item) => item.email}
                    style={{ marginBottom: 10 }}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleModalClose}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
                        <Text>Enter new value:</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginTop: 10 }}
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                            <Button title="Cancel" onPress={handleModalClose} />
                            <Button title="Update" onPress={handleConfirmUpdate} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default UsersPage;
