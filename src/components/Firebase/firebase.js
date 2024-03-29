import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID
};

class Firebase {
    constructor() {
        app.initializeApp(config);

        this.auth = app.auth();
        this.db = app.firestore();

        this.googleProvider = new app.auth.GoogleAuthProvider();
    }

    /* auth API */
    doCreateUserWithEmailAndPassword = (email, password) => 
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) => 
        this.auth.signInWithEmailAndPassword(email, password);

    doSignInWithGoogle = () =>
        this.auth.signInWithPopup(this.googleProvider);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

    /* Merge Auth adn DB User API */
    onAuthUserListener = (next, fallback) =>
        this.auth.onAuthStateChanged(authUser => {
            if(authUser) {
                this.user(authUser.uid)
                    .get()
                    .then(snapshot => {
                        // console.log('snapshot data', snapshot.data());
                        const dbUser = snapshot.data() || {};

                        //default empty roles
                        if(!dbUser.roles) {
                            dbUser.roles = {}
                        }
    
                        // merge auth and db user
                        authUser = {
                            uid: authUser.uid,
                            email: authUser.email,
                            ...dbUser
                        };

                        next(authUser);
                    });
            } else {
                fallback();
            }
        })

    // User Api 
    user = uid => this.db.collection('users').doc(uid);

    users = () => this.db.collection('users');
}

export default Firebase;