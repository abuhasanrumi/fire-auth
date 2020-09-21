import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase-config';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '', 
    photo: '',
    password: '',
    error: '',
    success: false
  })

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbprovider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn =  () => {
    firebase.auth().signInWithPopup(googleProvider)
    .then(res => {
      const {displayName, photoURL, email} = res.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email, 
        photo: photoURL
      }
      setUser(signedInUser)
      console.log(displayName, photoURL, email)
    })
    .catch(err => {
      console.log(err.message)
    })
  }

  const handleFbSignIn = () => {
    firebase.auth().signInWithPopup(fbprovider)
    .then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
      console.log(user)
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res => {
      const signedOutUser = {
        isSignedIn: false, 
        name: '', 
        email: '',
        photo: ''
      }
      setUser(signedOutUser)
    }).catch( err => {
      console.log(err.message)
    });
  }

  const handleSubmit = (e) => {
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then (res => {
        const newUserInfo = {...user}
        newUserInfo.error = ''
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name)
      })
      .catch( error => {
        // Handle Errors here.
        const newUserInfo = {...user}
        newUserInfo.error = error.message;
        newUserInfo.success = false
        setUser(newUserInfo)
        // ...
      });
    }
    if(!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then( res => {
        const newUserInfo = {...user}
        newUserInfo.error = ''
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log(res.user)
      })
      .catch(function(error) {
        const newUserInfo = {...user}
        newUserInfo.error = error.message;
        newUserInfo.success = false
        setUser(newUserInfo)
      });
    }
    e.preventDefault();
  }

  const handleBlur = (e) => {
    let isFieldValid = true;
    if(e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value)
      
    } 
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value)
      isFieldValid = isPasswordValid && passwordHasNumber

    } 
    if (isFieldValid) {
      const newUserInfo = {...user}
      newUserInfo[e.target.name] = e.target.value
      setUser(newUserInfo)
    }
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name
    }).then(function() {
      console.log('user name updated')
    }).catch(function(error) {
      console.log(error)
    });
  }
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign out</button> :
        <button onClick={handleSignIn}>Sign in</button>
      }
      <br/>
      <button onClick={handleFbSignIn}>Login using Facebook</button>
      {
        user.isSignedIn && <div>
          <p> Welcome, {user.name} </p>
          <p>Email: {user.email}</p>
          <img src={user.photo} alt=""/>
        </div>

      }

      <h1>Our own Authentication</h1>
      <p>{user.name}</p>
      <p>{user.email}</p>
      <p>{user.password}</p>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser"/>
      <label htmlFor="newUser">New User Checkbox</label>
      <form onSubmit={handleSubmit}>
        {
          newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="Name" required/>
        }
        <br/>
        <input type="text" name="email" onBlur={handleBlur} placeholder="Email" required/>
        <br/>
        <input type="password" name="password" onBlur={handleBlur} placeholder="Password" required/>
        <br/>
        <input type="submit" value={newUser ? "Sign up" : "Login"}/>
      </form>
      <p style={{color: 'red'}}>{user.error}</p>
      {
        user.success && <p style={{color: 'green'}}>User {newUser ? 'created' : 'logged in'} successfully</p>
      }
    </div>
  );
}

export default App;
