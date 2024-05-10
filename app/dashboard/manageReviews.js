import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, doc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true); // State for loading indicator

    useEffect(() => {
        const reviewsCollectionRef = collection(db, 'reviews');
        const unsubscribe = onSnapshot(reviewsCollectionRef, (querySnapshot) => {
            const reviewsData = [];
            querySnapshot.forEach((doc) => {
                const reviewData = doc.data();
                reviewData.id = doc.id; // add the document ID to the review object
                reviewsData.push(reviewData);
            });
            setReviews(reviewsData);
            setFilteredReviews(reviewsData);
            setLoading(false); // Set loading to false once reviews are loaded
        });

        return unsubscribe;
    }, []);

    const handleSearchTermChange = (value) => {
        const searchTerm = value.toLowerCase();
        setSearchTerm(searchTerm);
        const filteredReviews = reviews.filter((review) =>
            review.productId.toLowerCase().startsWith(searchTerm) ||
            review.productName.toLowerCase().startsWith(searchTerm)
        );
        setFilteredReviews(filteredReviews);
    };

    const handleDeleteReview = async (reviewId) => {
        const confirmDelete = await new Promise((resolve) => {
            Alert.alert(
                'Confirm',
                'Are you sure you want to delete this review?',
                [
                    { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                    { text: 'Delete', onPress: () => resolve(true) }
                ],
                { cancelable: true }
            );
        });
        if (!confirmDelete) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
            setReviews(reviews.filter((review) => review.id !== reviewId));
            setFilteredReviews(filteredReviews.filter((review) => review.id !== reviewId));
            alert('Review deleted successfully.');
        } catch (error) {
            console.error('Error deleting review: ', error);
            alert(error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.label}>Search by Product ID or Name:</Text>
                <TextInput
                    style={styles.input}
                    value={searchTerm}
                    placeholder='Search by Product ID or Name..'
                    onChangeText={handleSearchTermChange}
                />
            </View>
            {filteredReviews.length === 0 ? (
                <Text>No reviews found.</Text>
            ) : (
                <FlatList
                    data={filteredReviews}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.review}>
                            <Text>Product id: {item.productId}</Text>
                            <Text>Product Name: {item.productName}</Text>
                            <Text>Rating: {item.rating}</Text>
                            <Text>Comment: {item.comment}</Text>
                            <Text>Name: {item.name}</Text>
                            <Text>User email: {item.pass}</Text>
                            <Text>Date: {new Date(item.createdAt).toLocaleString()}</Text>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => handleDeleteReview(item.id)}
                            >
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
    container: {
        flex: 1,
        padding: 20,
        backgroundColor:'#F5F8FA'
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        marginBottom: 10,
        fontFamily: 'SunshineRegular',
    },
    input: {
        width: '100%',
        padding: 10,
        borderRadius: 13,
        backgroundColor:'white',
        marginBottom: 20,
        fontFamily: 'SunshineRegular',
    },
    review: {
        marginBottom: 20,
    },
    button: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontFamily: 'SunshineRegular',
    },
};

export default ReviewsPage;
