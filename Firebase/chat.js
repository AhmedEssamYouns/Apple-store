import { db } from '../app/FirebaseConfig';
import {
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getAdmin, getUsers } from "./users";
// Get a list of todos from your database
async function getChats() {
  const chatsCol = collection(db, "chats");
  const chatSnapshot = await getDocs(chatsCol);
    const chatList = chatSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      return chatList;
}

async function getChat(id) {
  const docRef = doc(db, `chats`, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    return { id: id, uid, ...docSnap.data()};
  }
  
  // docSnap.data() will be undefined in this case
  console.log("No such document!");
  return undefined
}

async function editChat(chatId , chat) {
  const doc = await setDoc(doc(db, `chats`, chatId), chat);
  console.log("doc : ",doc.id);
}

async function updateChat(chatId , chat) {
  // const admin = await getAdmin();
  await updateDoc(doc(db, `chats`, chatId), chat);
}

async function deleteChat(chatId) {
  try {
    await deleteDoc(doc(db, `chats`, chatId));
    console.log("Document deleted with ID: ", chatId);
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
}


async function addChat(chat) {
  try {
    const docRef = await addDoc(collection(db, `chats`), chat);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}


async function setChat(id , chat) {
  try {
    const docRef = await setDoc(doc(db, `chats` , id), chat);
    console.log("Document written with ID: ", id);
    return id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

function subscribe(uid,callback) {
  // if(chatID != undefined){
    const unsubscribe = onSnapshot(
      query(collection(db, `chats`)),
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
  // }
}

export { addChat,setChat,getChats,editChat, deleteChat, getChat, subscribe , updateChat };
