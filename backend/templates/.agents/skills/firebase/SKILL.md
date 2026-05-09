# Firebase Best Practices

## Overview
Firebase is Google's comprehensive app development platform providing authentication, real-time database, cloud storage, hosting, and serverless functions.

## Core Concepts

### 1. Firebase Authentication
- Use Firebase Auth for user management
- Support multiple auth providers (Email/Password, Google, GitHub, etc.)
- Implement proper session management
- Use Firebase Auth tokens for API authentication
- Handle auth state changes properly

### 2. Firestore Database
- Use Firestore for real-time NoSQL database
- Design collections and documents efficiently
- Implement security rules
- Use indexes for complex queries
- Optimize read/write operations

### 3. Realtime Database
- Use for simple real-time data sync
- Structure data as flat as possible
- Implement security rules
- Use listeners efficiently
- Clean up listeners on unmount

### 4. Cloud Storage
- Store files and media in Cloud Storage
- Implement security rules for buckets
- Generate download URLs
- Optimize images before upload
- Use Firebase CDN for delivery

### 5. Cloud Functions
- Use for serverless backend logic
- Trigger on database changes
- Handle HTTP requests
- Schedule background tasks
- Keep functions lightweight

## Code Patterns

### Firebase Initialization
```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

### Authentication
```typescript
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'

// Sign up
const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

// Sign in
const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Sign in with Google
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error) {
    console.error('Google sign in error:', error)
    throw error
  }
}

// Sign out
const logOut = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Auth state observer
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      setUser(user)
    } else {
      // User is signed out
      setUser(null)
    }
  })
  
  return () => unsubscribe()
}, [])
```

### Firestore CRUD Operations
```typescript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore'

// Create
const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating document:', error)
    throw error
  }
}

// Read single document
const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting document:', error)
    throw error
  }
}

// Read multiple documents
const getDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting documents:', error)
    throw error
  }
}

// Query with filters
const queryDocuments = async (collectionName: string) => {
  try {
    const q = query(
      collection(db, collectionName),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error querying documents:', error)
    throw error
  }
}

// Update
const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error updating document:', error)
    throw error
  }
}

// Delete
const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    await deleteDoc(doc(db, collectionName, docId))
  } catch (error) {
    console.error('Error deleting document:', error)
    throw error
  }
}

// Real-time listener
useEffect(() => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setPosts(posts)
  })
  
  return () => unsubscribe()
}, [])
```

### Cloud Storage
```typescript
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'

// Upload file
const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Upload with progress
const uploadFileWithProgress = (
  file: File,
  path: string,
  onProgress: (progress: number) => void
) => {
  const storageRef = ref(storage, path)
  const uploadTask = uploadBytesResumable(storageRef, file)
  
  uploadTask.on('state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      onProgress(progress)
    },
    (error) => {
      console.error('Upload error:', error)
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
      console.log('File available at', downloadURL)
    }
  )
  
  return uploadTask
}

// Delete file
const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}
```

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Posts collection
    match /posts/{postId} {
      allow read: if true; // Public read
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
  }
}
```

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    // User files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Performance Optimization

### 1. Query Optimization
- Use composite indexes for complex queries
- Limit query results with `.limit()`
- Use pagination with `startAfter()` and `endBefore()`
- Cache frequently accessed data
- Use `getDoc()` instead of `onSnapshot()` for one-time reads

### 2. Batched Writes
```typescript
import { writeBatch } from 'firebase/firestore'

const batchWrite = async () => {
  const batch = writeBatch(db)
  
  const ref1 = doc(db, 'collection', 'doc1')
  batch.set(ref1, { field: 'value1' })
  
  const ref2 = doc(db, 'collection', 'doc2')
  batch.update(ref2, { field: 'value2' })
  
  const ref3 = doc(db, 'collection', 'doc3')
  batch.delete(ref3)
  
  await batch.commit()
}
```

### 3. Offline Persistence
```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore'

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open
    } else if (err.code === 'unimplemented') {
      // Browser doesn't support
    }
  })
```

## Cost Optimization

### Free Tier Limits (Spark Plan)
- 1 GB stored data
- 10 GB/month bandwidth
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day

### Optimization Tips
- Use Firestore instead of Realtime Database for better pricing
- Implement pagination to reduce reads
- Cache data on client side
- Use Cloud Functions to reduce client-side operations
- Compress images before upload
- Delete unused data regularly
- Monitor usage in Firebase Console

## Custom Hooks

### useAuth Hook
```typescript
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    
    return unsubscribe
  }, [])
  
  return { user, loading }
}
```

### useDocument Hook
```typescript
export function useDocument(collectionName: string, docId: string) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const docRef = doc(db, collectionName, docId)
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() })
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    
    return unsubscribe
  }, [collectionName, docId])
  
  return { data, loading, error }
}
```

## Testing

### Emulator Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

### Connect to Emulators
```typescript
import { connectAuthEmulator } from 'firebase/auth'
import { connectFirestoreEmulator } from 'firebase/firestore'
import { connectStorageEmulator } from 'firebase/storage'

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

## Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase GitHub](https://github.com/firebase/firebase-js-sdk)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Pricing](https://firebase.google.com/pricing)
