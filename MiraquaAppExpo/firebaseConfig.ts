import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDlG2Va5bVZIwKHK5nvmQy69d58KYanuEA',
  authDomain: 'miraqua-fc088.firebaseapp.com',
  projectId: 'miraqua-fc088',
  storageBucket: 'miraqua-fc088.appspot.com',
  messagingSenderId: '331738998442',
  appId: '1:331738998442:web:b60d4f8f8dd5a56ebc401a',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
