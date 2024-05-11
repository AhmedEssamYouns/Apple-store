import {FIREBASE_AUTH,storage } from '../app/FirebaseConfig';
import {
    ref ,
    uploadBytes ,
    getDownloadURL,
} from '@firebase/storage';


async function uploadImage(url){
    const referance = ref(storage , `${FIREBASE_AUTH.currentUser.uid}.jpg`);
    const img = await fetch(url);
    const bytes = await img.blob();
    await uploadBytes(referance , bytes);
}

async function downloadImage(image){
    const referance = ref(storage,image);
    const url = await getDownloadURL(referance);
    return url;
}

export {downloadImage , uploadImage};
