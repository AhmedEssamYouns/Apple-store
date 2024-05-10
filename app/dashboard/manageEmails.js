import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, doc, updateDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const ContactMessagesPage = () => {
    const [contactMessages, setContactMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAll, setShowAll] = useState(true);
    const [showResponded, setShowResponded] = useState(false);
    const [showUnresponded, setShowUnresponded] = useState(false);
    const [loading, setLoading] = useState(true); // State to track loading status

    useEffect(() => {
        const contactMessagesCollectionRef = collection(db, 'contacts');
        const orderByDate = orderBy('createdAt');
        const contactMessagesQuery = query(contactMessagesCollectionRef, orderByDate);
        const unsubscribe = onSnapshot(contactMessagesQuery, (querySnapshot) => {
            const contactMessagesData = [];
            querySnapshot.forEach((doc) => {
                const contactMessageData = doc.data();
                contactMessageData.id = doc.id;
                contactMessagesData.push(contactMessageData);
            });
            setContactMessages(contactMessagesData);
            setLoading(false); // Set loading to false when data is fetched
        });

        return unsubscribe;
    }, []);

    const filteredContactMessages = contactMessages.filter(
        (contactMessage) =>
            contactMessage.user.toLowerCase().startsWith(searchTerm.toLowerCase()) &&
            ((showAll || (showResponded && contactMessage.responded) || (showUnresponded && !contactMessage.responded)))
    );

    const handleSearchTermChange = (value) => {
        setSearchTerm(value);
    };

    const handleMarkAsResponded = async (contactMessageId) => {
        const confirmResponded = await new Promise((resolve) => {
            Alert.alert(
                'Confirm',
                'Are you sure you want to mark this contact message as responded?',
                [
                    { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                    { text: 'Mark as Responded', onPress: () => resolve(true) }
                ],
                { cancelable: true }
            );
        });
        if (!confirmResponded) {
            return;
        }

        try {
            await updateDoc(doc(db, 'contacts', contactMessageId), {
                responded: true,
            });
            setContactMessages(
                contactMessages.map((contactMessage) => {
                    if (contactMessage.id === contactMessageId) {
                        return { ...contactMessage, responded: true };
                    }
                    return contactMessage;
                })
            );
            alert('Contact message marked as responded successfully.');
        } catch (error) {
            console.error('Error updating contact message: ', error);
            alert('Error updating contact message. Please try again later.');
        }
    };


    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'SunshineRegular' }}>Search by Email:</Text>
                <TextInput
                    style={styles.input}
                    value={searchTerm}
                    placeholder='Enter email address..'
                    onChangeText={handleSearchTermChange}
                />
            </View>
            <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 10, padding: 10, margin: 10 }}>
                <TouchableOpacity style={styles.button} onPress={() => { setShowAll(true); setShowResponded(false); setShowUnresponded(false); }}>
                    <Text style={styles.buttonText}>Show All {contactMessages.length > 0 && <Text style={styles.badge}>{contactMessages.length}</Text>}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => { setShowAll(false); setShowResponded(true); setShowUnresponded(false); }}>
                    <Text style={styles.buttonText}>Responded {contactMessages.filter((contactMessage) => contactMessage.responded).length > 0 && <Text style={styles.badge}>{contactMessages.filter((contactMessage) => contactMessage.responded).length}</Text>}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => { setShowAll(false); setShowResponded(false); setShowUnresponded(true); }}>
                    <Text style={styles.buttonText}>Unresponded {contactMessages.filter((contactMessage) => !contactMessage.responded).length > 0 && <Text style={styles.badge}>{contactMessages.filter((contactMessage) => !contactMessage.responded).length}</Text>}</Text>
                </TouchableOpacity>
            </View>

            {loading ? ( // Conditionally render loading indicator
                <ActivityIndicator size="large" color="#1da1f2" />
            ) : filteredContactMessages.length === 0 ? (
                <Text>No messages found.</Text>
            ) : (
                <FlatList
                    style={{ marginBottom: 100 }}
                    data={filteredContactMessages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.contactMessage}>
                            <Text style={{ fontFamily: "lonsfont" }}>Name: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.name}</Text></Text>
                            <Text style={{ fontFamily: "lonsfont" }}>Email: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.user}</Text></Text>
                            <Text style={{ fontFamily: "lonsfont" }}>Phone number: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.subject}</Text></Text>
                            <Text style={{ fontFamily: "lonsfont" }}>Message: <Text style={{ fontFamily: 'SunshineRegular' }}>{item.message}</Text></Text>
                            <Text style={{ fontFamily: "lonsfont" }}>Date: <Text style={{ fontFamily: 'SunshineRegular' }}>{new Date(item.createdAt.toDate()).toLocaleString()}</Text></Text>
                            <View>
                                {item.responded ? (
                                    <Text style={{ fontFamily: "lonsfont" }}>Responded</Text>
                                ) : (
                                    <TouchableOpacity style={styles.button} onPress={() => handleMarkAsResponded(item.id)}>
                                        <Text style={[styles.buttonText, { fontFamily: 'lonsfont' }]}>Mark as Responded</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#F5F8FA'
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 13,
        marginLeft: 10,
        padding: 10,
    },
    button: {
        backgroundColor: '#1da1f2',
        borderRadius: 10,
        padding: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
    },
    badge: {
        backgroundColor: 'cornflowerblue',
        borderRadius: 50,
        padding: 5,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    contactMessage: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
};

export default ContactMessagesPage;
