import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, Button, Modal, Alert } from 'react-native';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';


const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemOffer, setNewItemOffer] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemFavorite, setNewItemFavorite] = useState('no');
  const [newItemCategory, setNewItemCategory] = useState('iphones');
  const [newItemImage, setNewItemImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editItemId, setEditItemId] = useState('');
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemOffer, setEditItemOffer] = useState('');
  const [editItemQuantity, setEditItemQuantity] = useState('');
  const [editItemFavorite, setEditItemFavorite] = useState('no');
  const [editItemCategory, setEditItemCategory] = useState('iphones');
  const [editItemImage, setEditItemImage] = useState(null);
  const [showOfferOnly, setShowOfferOnly] = useState(false); // New state
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false); // New state


  useEffect(() => {
    const unsubscribe = getProducts();

    return () => {
      unsubscribe();
    };
  }, []);

  function getProducts() {
    const productsRef = collection(db, "products");
    return onSnapshot(productsRef, (snapshot) => {
      const productsData = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error getting products from Firestore: ", error);
    });
  }


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setNewItemImage(result.assets[0].uri);
    }
  };
  const pickImage2 = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setEditItemImage(result.assets[0].uri);
    }
  };

  async function addProduct(productData) {
    try {
      await addDoc(collection(db, "products"), productData);
    } catch (error) {
      console.error("Error adding product to Firestore: ", error);
    }
  }

  async function deleteProduct(productId) {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "products", productId));
            } catch (error) {
              console.error("Error deleting product from Firestore: ", error);
            }
          },
          style: "destructive"
        }
      ]
    );
  }

  async function editProduct(productId, newData) {
    try {
      await updateDoc(doc(db, "products", productId), newData);
    } catch (error) {
      console.error("Error updating product in Firestore: ", error);
    }
  }

  const renderProduct = ({ item }) => {
    // Apply search filter
    if (searchQuery.length > 0 && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }

    // Apply category filter
    if (selectedCategory !== 'All' && item.cat !== selectedCategory) {
      return null;
    }
    if (selectedCategory !== 'All' && item.cat !== selectedCategory) {
      return null;
    }

    // Apply offer filter
    if (showOfferOnly && !item.offer) {
      return null;
    }

    // Apply favorite filter
    if (showFavoriteOnly && item.fav !== 'yes') {
      return null;
    }



    return (
      <View style={styles.productContainer}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Price: {item.price}</Text>
        {item.offer && <Text style={styles.productOffer}>Offer: {item.offer}</Text>}
        <Text style={styles.productCategory}>Category: {item.cat}</Text>
        <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
        {item.fav === 'yes' && <Text style={styles.productFavorite}>Favorite: Yes</Text>}
        {/* Display image if available */}
        {item.image && <Image source={{ uri: item.image }} style={styles.productImage} />}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ backgroundColor: 'red', padding: 6, borderRadius: 5 }} onPress={() => deleteProduct(item.id)}>
            <Text style={{ color: 'white', fontWeight: 'bold', }}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#A9B3C1', padding: 6, borderRadius: 5, flexDirection: 'row', gap: 10 }} onPress={() => openEditModal(item)}>
            <Text style={{ fontWeight: 'bold', }}>Edit
            </Text>
            <Feather name='edit' size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  const openEditModal = (item) => {
    setEditItemId(item.id);
    setEditItemName(item.name);
    setEditItemPrice(item.price);
    setEditItemOffer(item.offer || '');
    setEditItemQuantity(item.quantity);
    setEditItemFavorite(item.fav);
    setEditItemCategory(item.cat);
    setEditItemImage(item.image || null);
    setEditModalVisible(true);
  };

  const applySearch = (query) => {
    setSearchQuery(query);
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleAddProduct = () => {
    // Check if all required fields are filled
    if (!newItemName || !newItemPrice || !newItemQuantity || !newItemImage) {
      Alert.alert('Missing Information', 'Please fill in all required fields (Name, Price, Quantity, and Image)');
      return;
    }

    // Convert price and quantity to numbers
    const price = parseFloat(newItemPrice);
    const quantity = parseInt(newItemQuantity);

    // Check if price and quantity are valid numbers
    if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
      Alert.alert('Invalid Information', 'Price and Quantity must be valid numbers greater than zero');
      return;
    }

    const productData = {
      name: newItemName,
      price: price.toString(), // Convert back to string
      offer: newItemOffer,
      quantity: quantity.toString(), // Convert back to string
      fav: newItemFavorite,
      cat: newItemCategory,
      image: newItemImage,
    };
    addProduct(productData);

    // Reset input fields and modal state after adding the product
    setNewItemName('');
    setNewItemPrice('');
    setNewItemOffer('');
    setNewItemQuantity('');
    setNewItemFavorite('no');
    setNewItemCategory('iphones');
    setNewItemImage(null);
    setModalVisible(false);
  };

  const handleEditProduct = () => {
    const newData = {
      name: editItemName,
      price: editItemPrice,
      offer: editItemOffer,
      quantity: editItemQuantity,
      fav: editItemFavorite,
      cat: editItemCategory,
      image: editItemImage,
    };
    editProduct(editItemId, newData);
    setEditModalVisible(false);
  };

  const showOfferProducts = () => {
    setShowOfferOnly(true);
    setShowFavoriteOnly(false);
  };

  const showFavoriteProducts = () => {
    setShowOfferOnly(false);
    setShowFavoriteOnly(true);
  };

  const showAllProducts = () => {
    setShowOfferOnly(false);
    setShowFavoriteOnly(false);
  };
  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          onChangeText={applySearch}
          value={searchQuery}
        />
        <View style={styles.categoryButtons}>
          <TouchableOpacity style={[styles.categoryButton, selectedCategory === 'All' && styles.selectedCategory]}
            onPress={() => filterByCategory('All')}>
            <Text style={styles.categoryButtonText}>All Products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'iphones' && styles.selectedCategory]}
            onPress={() => filterByCategory('iphones')}
          >
            <Text style={styles.categoryButtonText}>iPhones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryButton, selectedCategory === 'Watches' && styles.selectedCategory]}
            onPress={() => filterByCategory('watches')}>
            <Text style={styles.categoryButtonText}>Watches</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryButton, selectedCategory === 'macbooks' && styles.selectedCategory]}
            onPress={() => filterByCategory('macbooks')}>
            <Text style={styles.categoryButtonText}>MacBooks</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, padding: 10 }}>
          <TouchableOpacity style={styles.categoryButton2} onPress={() => setModalVisible(true)}>
            <Text style={styles.categoryButtonText}>Add New Item</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, showOfferOnly && styles.selectedCategory]}
            onPress={showOfferProducts}
          >
            <Text style={styles.categoryButtonText}>Offers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, showFavoriteOnly && styles.selectedCategory]}
            onPress={showFavoriteProducts}
          >
            <Text style={styles.categoryButtonText}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, !showOfferOnly && !showFavoriteOnly && styles.selectedCategory]}
            onPress={showAllProducts}
          >
            <Text style={styles.categoryButtonText}>any</Text>
          </TouchableOpacity>

        </View>
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          style={{
            marginBottom: 65

          }}
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <View style={{ padding: 20, gap: 10, flexDirection: "row", alignItems: 'center' }}>
              <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                <Text style={styles.pickImageButtonText}>Pick Image</Text>
              </TouchableOpacity>
              {newItemImage &&
                <Image source={{ uri: newItemImage }} style={{ height: 100, width: 100, borderRadius: 10 }}></Image>}
            </View>
            <TextInput
              style={styles.newItemInput}
              placeholder="Product Name"
              onChangeText={setNewItemName}
              value={newItemName}
            />
            <TextInput
              style={styles.newItemInput}
              placeholder="Price"
              onChangeText={setNewItemPrice}
              value={newItemPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.newItemInput}
              placeholder="Offer Price (optional)"
              onChangeText={setNewItemOffer}
              value={newItemOffer}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.newItemInput}
              placeholder="Quantity"
              onChangeText={setNewItemQuantity}
              value={newItemQuantity}
              keyboardType="numeric"
            />
            <View style={styles.favoriteContainer}>
              <Text style={styles.favoriteText}>Is it a favorite?</Text>
              <TouchableOpacity
                style={[styles.favoriteButton, newItemFavorite === 'yes' && styles.selectedFavorite]}
                onPress={() => setNewItemFavorite('yes')}
              >
                <Text style={styles.favoriteButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.favoriteButton, newItemFavorite === 'no' && styles.selectedFavorite]}
                onPress={() => setNewItemFavorite('no')}
              >
                <Text style={styles.favoriteButtonText}>No</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>Category:</Text>
              <TouchableOpacity
                style={[styles.categoryButton, newItemCategory === 'iphones' && styles.selectedCategory]}
                onPress={() => setNewItemCategory('iphones')}
              >
                <Text style={styles.categoryButtonText}>iPhones</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryButton, newItemCategory === 'watches' && styles.selectedCategory]}
                onPress={() => setNewItemCategory('watches')}
              >
                <Text style={styles.categoryButtonText}>Watches</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryButton, newItemCategory === 'macbooks' && styles.selectedCategory]}
                onPress={() => setNewItemCategory('macbooks')}
              >
                <Text style={styles.categoryButtonText}>MacBooks</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
              <Text style={styles.addButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <View style={{ padding: 20, gap: 10, flexDirection: "row", alignItems: 'center' }}>
              <TouchableOpacity style={styles.pickImageButton} onPress={pickImage2}>
                <Text style={styles.pickImageButtonText}>Pick Image</Text>
              </TouchableOpacity>
              {editItemImage &&
                <Image source={{ uri: editItemImage }} style={{ height: 100, width: 100, borderRadius: 10 }}></Image>}
            </View>
            <TextInput
              style={styles.newItemInput}
              placeholder="Product Name"
              onChangeText={setEditItemName}
              value={editItemName}
            />
            <TextInput
              style={styles.newItemInput}
              placeholder="Price"
              onChangeText={setEditItemPrice}
              value={editItemPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.newItemInput}
              placeholder="Offer Price (optional)"
              onChangeText={setEditItemOffer}
              value={editItemOffer}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.newItemInput}
              placeholder="Quantity"
              onChangeText={setEditItemQuantity}
              value={editItemQuantity}
              keyboardType="numeric"
            />
            <View style={styles.favoriteContainer}>
              <Text style={styles.favoriteText}>Is it a favorite?</Text>
              <TouchableOpacity
                style={[styles.favoriteButton, editItemFavorite === 'yes' && styles.selectedFavorite]}
                onPress={() => setEditItemFavorite('yes')}
              >
                <Text style={styles.favoriteButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.favoriteButton, editItemFavorite === 'no' && styles.selectedFavorite]}
                onPress={() => setEditItemFavorite('no')}
              >
                <Text style={styles.favoriteButtonText}>No</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>Category:</Text>
              <TouchableOpacity
                style={[styles.categoryButton, editItemCategory === 'iphones' && styles.selectedCategory]}
                onPress={() => setEditItemCategory('iphones')}
              >
                <Text style={styles.categoryButtonText}>iPhones</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryButton, editItemCategory === 'watches' && styles.selectedCategory]}
                onPress={() => setEditItemCategory('watches')}
              >
                <Text style={styles.categoryButtonText}>Watches</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryButton, editItemCategory === 'macbooks' && styles.selectedCategory]}
                onPress={() => setEditItemCategory('macbooks')}
              >
                <Text style={styles.categoryButtonText}>MacBooks</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleEditProduct}>
              <Text style={styles.addButtonText}>Edit Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F8FA',
  },

  filterContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 10,
    padding: 5,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  favoriteText: {
    fontFamily: 'SunshineRegular',
    fontSize: 16,
    marginRight: 10,
  },
  favoriteButton: {
    backgroundColor: '#A9B3C1',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    elevation: 4,
  },
  selectedFavorite: {
    backgroundColor: '#1DA1F2', // Change color for selected state
  },
  favoriteButtonText: {
    fontFamily: 'SunshineRegular',
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 5,
  },
  categoryText: {
    fontFamily: 'SunshineRegular',
    fontSize: 16,
    marginRight: 10,
  },
  categoryButton: {
    backgroundColor: '#A9B3C1',
    borderRadius: 10,
    marginRight: 10,
    elevation: 4,
  },
  selectedCategory: {
    backgroundColor: '#1DA1F2', // Change color for selected state
  },
  categoryButtonText: {
    fontFamily: 'SunshineRegular',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#A9B3C1',
    padding: 15,
    borderRadius: 10,
    elevation: 4,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: 'SunshineRegular',
    fontSize: 18,
    color: 'white',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    fontFamily: 'SunshineRegular',
    fontSize: 16,
    color: '#333',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    alignSelf: 'center'
  },
  categoryButton: {
    backgroundColor: '#A9B3C1',
    paddingVertical: 10,
    borderRadius: 10,
    padding: 5,
    elevation: 4
  },
  categoryButton2: {
    marginTop: 10,
    width: 100,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 10,
    padding: 5,
    elevation: 4
  },
  categoryButtonText: {
    fontFamily: "SunshineRegular",
    fontSize: 13,
  },
  productContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    elevation: 5
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 16,
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 16,
    marginBottom: 5,
  },
  productOffer: {
    fontSize: 16,
    color: 'green',
    marginBottom: 5,
  },
  productFavorite: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 5,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 10,
    marginBottom: 5,
  },
  addItemContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    elevation: 5
  },
  newItemInput: {
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 10,
    padding: 5,
    marginBottom: 10,
  },
  pickImageButton: {
    backgroundColor: '#A9B3C1',
    paddingVertical: 10,
    borderRadius: 10,
    padding: 5,
    elevation: 4,
    alignSelf: 'center'
  },
  pickImageButtonText: {
    fontFamily: "SunshineRegular",
    fontSize: 13,
  },
  newItemImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 10,
    marginBottom: 5,
  },
});

export default ProductsPage;
