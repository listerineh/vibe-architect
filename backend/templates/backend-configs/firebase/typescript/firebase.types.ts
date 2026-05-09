/**
 * Firebase Type Definitions
 * 
 * Common types used across Firebase services
 */

import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FirebaseAuthUser = FirebaseUser;
