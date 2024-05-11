import { FIREBASE_AUTH,db } from '../app/FirebaseConfig';
import {
  getDoc,  
  getDocs,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "@firebase/firestore";

async function getUsers(){
  const usersCol = collection(db, "users");
  const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      return userList;
}

async function getUser(id){
    const docRef = doc(db, "users", id);
    const docDa = await getDoc(docRef);
    if (docDa.exists()) {
        return { id: id, ...docDa.data()};
      }
      
      // docSnap.data() will be undefined in this case
      console.log("No such document in user!");
      return undefined
}
async function getAdmin () {
  return (await getUsers()).find(u=>u.admin != undefined);
}

async function editUser(id,newUser) {
    await updateDoc(doc(db, "users", id),newUser);
  }
  
  async function deleteUser(id) {
    try {
      await deleteDoc(doc(db, "users", id));
      console.log("Document deleted with ID: ", id);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  }
  
  async function addUser(user) {
    try {
      await setDoc(doc(db, "users", FIREBASE_AUTH.currentUser.uid), user);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  function subscribe(callback) {
    const unsubscribe = onSnapshot(
      query(collection(db, "users")),
      (snapshot) => {
        const source = snapshot.metadata.hasPendingWrites ? "Local" : "Server";
        snapshot.docChanges().forEach((change) => {
          // console.log("changes", change, snapshot.metadata);
          if (callback) callback({ change, snapshot });
        });
        // console.log(source, " data: ", snapshot.data());
      }
    );
    return unsubscribe;
  }

  export { getUsers,getUser, addUser, editUser, deleteUser,getAdmin, subscribe };
