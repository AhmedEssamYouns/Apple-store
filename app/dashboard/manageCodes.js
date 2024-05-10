import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc ,getDocs,query,where} from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { FlatList } from 'react-native';

const DiscountCodesPage = () => {
    const [discountCodes, setDiscountCodes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newDiscountCode, setNewDiscountCode] = useState('');
    const [newDiscountAmount, setNewDiscountAmount] = useState(0.05);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const discountsCollectionRef = collection(db, 'discountCodes');
        const unsubscribe = onSnapshot(discountsCollectionRef, (querySnapshot) => {
            const discountsData = [];
            querySnapshot.forEach((doc) => {
                const discountData = doc.data();
                discountData.id = doc.id;
                discountsData.push(discountData);
            });
            setDiscountCodes(discountsData);
            setIsLoading(false);
        });
        return unsubscribe;
    };

    const handleSearchTermChange = (value) => {
        setSearchTerm(value.toLowerCase());
    };

    const handleDeleteDiscountCode = async (discountCodeId) => {
        setIsLoading(true);
        try {
            // Query for the document with the matching discount code
            const querySnapshot = await getDocs(query(collection(db, 'discountCodes'), where('code', '==', discountCodeId)));
    
            // Delete the document if found
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
    
            // Filter out the deleted discount code from the local state
            setDiscountCodes(discountCodes.filter((discount) => discount.code !== discountCodeId));
    
            setIsLoading(false);
            Alert.alert('Success', 'Discount code deleted successfully.');
        } catch (error) {
            console.error('Error deleting discount code: ', error);
            setIsLoading(false);
            Alert.alert('Error', 'Error deleting discount code. Please try again later.');
        }
    };

    const handleAddDiscountCode = async () => {
        setIsLoading(true);
        const code = newDiscountCode.trim();
        if (!code) {
            setIsLoading(false);
            Alert.alert('Please enter a valid discount code.');
            return;
        }

        const codeExists = discountCodes.find((discount) => discount.code.toLowerCase() === code.toLowerCase());
        if (codeExists) {
            setIsLoading(false);
            Alert.alert('Discount code already exists. Please enter a unique code.');
            return;
        }

        try {
            await addDoc(collection(db, 'discountCodes'), { code, amount: newDiscountAmount });
            setNewDiscountCode('');
            setNewDiscountAmount(0.05);
            setIsLoading(false);
            Alert.alert('Success', 'Discount code added successfully.');
        } catch (error) {
            console.error('Error adding discount code: ', error);
            setIsLoading(false);
            Alert.alert('Error', 'Error adding discount code. Please try again later.');
        }
    };

    const handleDiscountAmountChange = (value) => {
        setNewDiscountAmount(value);
    };

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: '#F5F8FA' }}>
            <View>
                <Text style={styles.text}>Search by Code:</Text>
                <TextInput
                    style={styles.input}
                    value={searchTerm}
                    placeholder='Search by Code..'
                    onChangeText={handleSearchTermChange}
                />
            </View>
            <View>
                <Text style={styles.text}>Add New Code:</Text>
                <TextInput
                    style={styles.input}
                    value={newDiscountCode}
                    placeholder='Enter new code..'
                    onChangeText={(text) => setNewDiscountCode(text)}
                />
                <Picker
                    selectedValue={newDiscountAmount}
                    onValueChange={(value) => handleDiscountAmountChange(value)}
                    style={{ marginBottom: 10 }}
                >
                    <Picker.Item label="5%" value={0.05} />
                    <Picker.Item label="10%" value={0.1} />
                    <Picker.Item label="50%" value={0.5} />
                </Picker>
                <TouchableOpacity onPress={handleAddDiscountCode} style={styles.button}>
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : discountCodes.length === 0 ? (
                <Text style={styles.text}>No discount codes found.</Text>
            ) : (
                <FlatList
                    style={{ marginBottom: 100 }}
                    data={discountCodes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.listItemText}>{item.code}</Text>
                            <Text style={styles.listItemText}>{`${Number(item.amount * 100).toFixed(0)}%`}</Text>
                            <TouchableOpacity onPress={() => handleDeleteDiscountCode(item.code)} style={styles.deleteButton}>
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = {
    text: { fontFamily: 'SunshineRegular' },
    input: { backgroundColor: 'white', borderRadius: 10, elevation: 3, padding: 10, marginBottom: 10 },
    button: { backgroundColor: '#1DA1F2', padding: 10, borderRadius: 5, margin: 10 },
    buttonText: { color: 'white', textAlign: 'center', fontFamily: 'SunshineRegular' },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'gray', padding: 10 },
    listItemText: { fontFamily: 'SunshineRegular' },
    deleteButton: { backgroundColor: 'red', padding: 10, borderRadius: 5 }
};

export default DiscountCodesPage;
