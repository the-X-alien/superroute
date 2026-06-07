import { initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore"
import { getDatabase, connectDatabaseEmulator, type Database } from "firebase/database"

const defaultConfig = {
  apiKey: "demo-superroute-milpitas-hacks",
  authDomain: "demo-superroute.firebaseapp.com",
  projectId: "demo-superroute",
  storageBucket: "demo-superroute.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
  databaseURL: "https://demo-superroute-default-rtdb.firebaseio.com",
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let rtdb: Database | null = null

export function initFirebase(config?: Record<string, string>) {
  const resolved = config ?? defaultConfig
  app = initializeApp(resolved)
  auth = getAuth(app)
  db = getFirestore(app)
  rtdb = getDatabase(app)

  if (resolved.apiKey === "demo-superroute-milpitas-hacks") {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    connectFirestoreEmulator(db, "localhost", 8080)
    connectDatabaseEmulator(rtdb, "localhost", 9000)
  }

  return { app, auth, db, rtdb }
}

export function getFirebaseApp() {
  if (!app) throw new Error("Firebase not initialized. Call initFirebase() first.")
  return { app, auth: auth!, db: db!, rtdb: rtdb! }
}
