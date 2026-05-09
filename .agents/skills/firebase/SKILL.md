# Firebase Integration Guide

## Overview
Firebase is Google's Backend-as-a-Service (BaaS) platform providing authentication, database, storage, and hosting.

## Core Services

### 1. Firebase Authentication
- **Email/Password**: Traditional authentication
- **Google Sign-In**: OAuth with Google accounts
- **Social Providers**: Facebook, Twitter, GitHub, etc.
- **Anonymous Auth**: Temporary user sessions

### 2. Firestore (Database)
- **NoSQL Document Database**: Flexible schema
- **Real-time Updates**: Live data synchronization
- **Offline Support**: Works without internet
- **Security Rules**: Server-side access control

### 3. Firebase Storage
- **File Upload/Download**: Images, videos, documents
- **CDN Integration**: Fast global delivery
- **Security Rules**: Fine-grained access control

### 4. Firebase Hosting
- **Static Site Hosting**: Fast, secure, and free
- **Custom Domains**: Use your own domain
- **SSL Certificates**: Automatic HTTPS

## Quick Start

### Installation
```bash
npm install firebase
```

### Initialize Firebase
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## Common Patterns

### Authentication
```typescript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Sign up
const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign in
const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
```

### Firestore CRUD
```typescript
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create
const createDocument = async (collectionName: string, id: string, data: any) => {
  await setDoc(doc(db, collectionName, id), data);
};

// Read
const getDocument = async (collectionName: string, id: string) => {
  const docSnap = await getDoc(doc(db, collectionName, id));
  return docSnap.exists() ? docSnap.data() : null;
};

// Update
const updateDocument = async (collectionName: string, id: string, data: any) => {
  await updateDoc(doc(db, collectionName, id), data);
};

// Delete
const deleteDocument = async (collectionName: string, id: string) => {
  await deleteDoc(doc(db, collectionName, id));
};

// Query
const queryDocuments = async (collectionName: string, field: string, value: any) => {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Real-time Listeners
```typescript
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const listenToDocument = (collectionName: string, id: string, callback: (data: any) => void) => {
  const unsubscribe = onSnapshot(doc(db, collectionName, id), (doc) => {
    callback(doc.exists() ? doc.data() : null);
  });
  
  return unsubscribe; // Call this to stop listening
};
```

### File Upload
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};
```

## Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read, authenticated write
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Best Practices

### 1. Environment Variables
- Never commit Firebase config to Git
- Use `.env.local` for development
- Use environment variables in production

### 2. Security
- Always use Security Rules
- Validate data on the server side
- Use Firebase Admin SDK for sensitive operations

### 3. Performance
- Use pagination for large collections
- Implement caching strategies
- Minimize real-time listeners
- Use indexes for complex queries

### 4. Cost Optimization
- **Free Tier Limits**:
  - 50K reads/day
  - 20K writes/day
  - 1GB storage
  - 10GB bandwidth/month
- **Optimize**:
  - Cache frequently accessed data
  - Use batch operations
  - Implement pagination
  - Delete unused data

## Common Pitfalls

❌ **Don't:**
- Store sensitive data in Firestore without encryption
- Use real-time listeners everywhere (expensive)
- Ignore security rules
- Fetch entire collections

✅ **Do:**
- Use security rules for all collections
- Implement proper error handling
- Use batch operations for multiple writes
- Paginate large datasets
- Cache data when possible

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Security Rules Guide](https://firebase.google.com/docs/rules)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

**Generated by VibeArchitect** - AI-First Boilerplate Generator
