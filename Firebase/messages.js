import { db } from '../app/FirebaseConfig';
import {
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  updateDoc,
  onSnapshot,
  getDoc,
  Timestamp, 
} from "firebase/firestore";
import { getAdmin } from "./users";
// Get a list of todos from your database
async function getMessages(chatId) {
  const messagesCol = collection(db, `chats/${chatId}/messages`);
  console.log("messagesCol : ",messagesCol);
  const messageSnapshot = await getDocs(messagesCol);
  const messageList = messageSnapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data()};
  });
  return messageList;
}

async function getMessage(chatId , messageId) {
  const docRef = doc(db,`chats/${chatId}/messages`, messageId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    return { id: messageId, ...docSnap.data()};
  }
  // docSnap.data() will be undefined in this case
  console.log("No such document!");
  return undefined
}

async function editMessage( chatId , messageId , message) {
  await setDoc(doc(db, `chats/${chatId}/messages`, messageId), message);
}

async function updateMessage(chatId,messageId, message) {
  // const admin = await getAdmin();
  await updateDoc(doc(db, `chats/${chatId}/messages`, messageId), message);
}

async function deleteMessage(chatId , messageId) {
  try {
    await deleteDoc(doc(db, `chats/${chatId}/messages`, messageId));
    console.log("Document deleted with ID: ", messageId);
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
}


async function addMessage(chatId , message) {
  try {
    // const admin = await getAdmin();
    const docRef = await addDoc(collection(db, `chats/${chatId}/messages`), {...message,currentTime: Timestamp.now().seconds});
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

function subscribe(chatId , callback) {
  const unsubscribe = onSnapshot(
    query(collection(db, `chats/${chatId}/messages`)),
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

export { getMessages, addMessage, editMessage,updateMessage, deleteMessage, getMessage, subscribe };
