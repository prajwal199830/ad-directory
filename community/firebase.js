import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyDNjWPkpLsnlCZ4sSTvXebyHqGCWNe7sTI",

    authDomain: "pubsrate-community.firebaseapp.com",

    projectId: "pubsrate-community",

    storageBucket: "pubsrate-community.firebasestorage.app",

    messagingSenderId: "1049440527338",

    appId: "1:1049440527338:web:87d4bd939218f912774893",

    measurementId: "G-Z4LX4VW3BV"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);


// Initialize Firestore

const db = getFirestore(app);


// Function to save a blog

export async function publishBlog(
    authorName,
    blogTitle,
    category,
    blogContent
) {

    try {

        const docRef = await addDoc(
            collection(db, "blogs"),
            {

                authorName: authorName,

                title: blogTitle,

                category: category,

                content: blogContent,

                createdAt: serverTimestamp(),

                status: "pending"

            }
        );


        console.log(
            "Blog submitted successfully:",
            docRef.id
        );


        return true;


    } catch (error) {

        console.error(
            "Error publishing blog:",
            error
        );


        return false;

    }

}
