import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';


import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState } from 'react';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth); 
  return (
    <div className="App">
      <header className="App-header">
        {user ? <SignOut /> : null}
      </header> 
      <section>
        {user ? <ChatApp /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div className="SignIn-container">
      <h2>ChatRoom</h2>
      <p className="App-description">
        ChatRoom is a real-time chat application where you can connect and communicate with your friends instantly.
        Sign in with your Google account to get started!
      </p>

      <div className="btn-container">
        <div className="btn">
        <button type="button" onClick={signInWithGoogle} class="login-with-google-btn" >
          Sign in with Google
        </button>
        </div>
      </div>

    </div>
  );
}


function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign out</button>
  );
}

function ChatApp() {
  const msgref = firestore.collection('messages');
  const query = msgref.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    await msgref.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid
    });
    setFormValue("");
  }

  return (
    < >
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid } = props.message;
  const currentUserUid = auth.currentUser.uid;

  const msgClass = uid === currentUserUid ? "sent" : "received";
  return (
    <div className={`Message ${msgClass}`}>
      <p>{text}</p>
    </div>
  );
}

export default App;
