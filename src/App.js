import firebase from 'firebase/app'
import "firebase/auth";
import { useState } from 'react';
import './App.css';
import firebaseConfig from './firebase.config';



if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}else {
  firebase.app(); // if already initialized, use that one
}


function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn : false ,
    name: '',
    
    password: '',
    photo: '',
    email: ''


  })

  
  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleGoogleSignIn = () => {
    firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;
  
      var token = credential.accessToken;
     
      var user = result.user;
      const {displayName, email, photoURL}  = result.user;
      const signedInUser = {
        isSignedIn: true,
        name : displayName,
        photo: photoURL,
        email: email
      }
      

      

      setUser(signedInUser);
      console.log(displayName, email, photoURL);
      console.log(result)
    }).catch((error) => {
      
      var errorCode = error.code;
      var errorMessage = error.message;
      
      var email = error.email;
     
      var credential = error.credential;
      
      console.log(errorCode, errorMessage, email, credential)
    });
  }
  const handleFbSignIn = () => {
    firebase
  .auth()
  .signInWithPopup(fbProvider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;

    // The signed-in user info.
    var user = result.user;

    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var accessToken = credential.accessToken;

    // ...
    console.log('user sign in', user)
  })
  .catch((error) => {
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
  const handleGoogleSignOut = () => {
    firebase.auth().signOut().then(() => {
      const signedOutUser = {
        isSignedIn: false,
        name: '',
        
        email: '',
        photo: '',
        error: '',
        success: false
      }
      setUser(signedOutUser);
    }).catch((error) => {
      // An error happened.
    });
  }
  const handleBlur = (e) => {
     let isFieldValid = true;
    if(e.target.name === 'email'){
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value)
        
    }
    if(e.target.name === 'password'){
       const isPasswordValid = e.target.value.length > 6;
       const passwordHasNumber = /^(?=.{6,20}$)\D*\d/.test(e.target.value)

       isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if(isFieldValid){
        const newUserInfo = {...user}
        newUserInfo[e.target.name] = e.target.value;
        setUser(newUserInfo);
    }
  }
  const handleSubmit = (e) => {
    if( newUser && user.name && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then( res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo)
        updateUserName(user.name);
            })
      .catch((error) => {
        const newUserInfo = {...user}
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo)
        // ..
      });
    }
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then( res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo)
            })
            .catch((error) => {
              const newUserInfo = {...user}
              newUserInfo.error = error.message;
              newUserInfo.success = false;
              setUser(newUserInfo)
              // ..
            });
    }
    e.preventDefault();
  }
   const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
      
    }).then(() => {
      // Update successful
      // ...
    }).catch((error) => {
      // An error occurred
      // ...
    });  
   }
  return (
    <div className="App">

      {
        user.isSignedIn ? <button onClick={handleGoogleSignOut}>sign out</button>:
        <button onClick={handleGoogleSignIn}>sign in</button>
      }
      <br />
      <button onClick={handleFbSignIn}>Sign in using Facebook</button>
      {
        user.isSignedIn && <div>

          <p>Welcome, {user.name}</p>
          <p>Your Email: {user.email}</p>
          <img src={user.photo} alt="" />

        </div>
      }
      <br />

        <input type="checkbox" onChange={() => setNewUser(!newUser)}   name="newUser"/>
        <label htmlFor="newUser">New user sign in</label>
        <form onSubmit={handleSubmit} >
        {
          newUser && <input type="text" name="name"  onBlur={handleBlur}  placeholder="write your Name" required />
        }
        <br/>

        <input type="text" name="email" onBlur={handleBlur}  placeholder="write your email" required />
        <br />
        <input type="password" name="password" onBlur={handleBlur}  placeholder="write your password" required />
        <br />
        <input type="submit" value= {newUser ? 'sign up' : 'sign in'} />
        </form>
        <p style={{color:'red'}}>{user.error}</p>

      {
        user.success && <p style={{color:'green'}}>Successfully {newUser ? 'created': 'logged in'}  account</p>
      }
        
    </div>
  );
}

export default App;
