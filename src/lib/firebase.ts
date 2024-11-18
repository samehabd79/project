import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Auth,
  User
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  get,
  remove, 
  query, 
  orderByChild,
  onValue,
  DatabaseReference,
  Query,
  Database
} from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDU4ukhIFwWmXC2ETdN_1Cij8vVLM1Z8wc",
  authDomain: "sales-pro-ddd13.firebaseapp.com",
  projectId: "sales-pro-ddd13",
  databaseURL: "https://sales-pro-ddd13-default-rtdb.firebaseio.com",
  storageBucket: "sales-pro-ddd13.appspot.com",
  messagingSenderId: "597947205965",
  appId: "1:597947205965:web:a3ddbc1aa9197726c24f04",
  measurementId: "G-28NLEJ76HD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Database = getDatabase(app);

// Auth functions
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile and initialize data
    await set(ref(db, `users/${result.user.uid}/profile`), {
      email: result.user.email,
      createdAt: Date.now()
    });
    
    await initializeDatabase();
    return result.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Database functions
export const createData = async (path: string, data: any) => {
  try {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const collectionRef = ref(db, `users/${auth.currentUser.uid}/data/${path}`);
    const newRef = push(collectionRef);
    const timestamp = Date.now();
    
    const newData = {
      ...data,
      id: newRef.key,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await set(newRef, newData);
    return newData;
  } catch (error: any) {
    console.error('Create data error:', error);
    throw error;
  }
};

export const updateData = async (path: string, id: string, data: any) => {
  try {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const itemRef = ref(db, `users/${auth.currentUser.uid}/data/${path}/${id}`);
    const timestamp = Date.now();
    
    const updatedData = {
      ...data,
      id,
      updatedAt: timestamp
    };
    
    await set(itemRef, updatedData);
    return updatedData;
  } catch (error: any) {
    console.error('Update data error:', error);
    throw error;
  }
};

export const deleteData = async (path: string, id: string) => {
  try {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const itemRef = ref(db, `users/${auth.currentUser.uid}/data/${path}/${id}`);
    await remove(itemRef);
    return { success: true };
  } catch (error: any) {
    console.error('Delete data error:', error);
    throw error;
  }
};

export const getData = async (path: string) => {
  try {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const dataRef = ref(db, `users/${auth.currentUser.uid}/data/${path}`);
    const snapshot = await get(dataRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const items: any[] = [];
    snapshot.forEach((child) => {
      items.push({
        id: child.key,
        ...child.val()
      });
    });
    
    return items;
  } catch (error: any) {
    console.error('Get data error:', error);
    throw error;
  }
};

export const getOrderedData = async (path: string, orderBy: string) => {
  try {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const dataRef = ref(db, `users/${auth.currentUser.uid}/data/${path}`);
    const orderedQuery = query(dataRef, orderByChild(orderBy));
    const snapshot = await get(orderedQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const items: any[] = [];
    snapshot.forEach((child) => {
      items.push({
        id: child.key,
        ...child.val()
      });
    });
    
    return items;
  } catch (error: any) {
    console.error('Get ordered data error:', error);
    throw error;
  }
};

export const subscribeToData = (
  path: string, 
  callback: (data: any[]) => void,
  orderBy?: string
) => {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }

  const dataRef = ref(db, `users/${auth.currentUser.uid}/data/${path}`);
  const queryRef: DatabaseReference | Query = orderBy 
    ? query(dataRef, orderByChild(orderBy))
    : dataRef;

  const unsubscribe = onValue(queryRef, (snapshot) => {
    const items: any[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        items.push({
          id: child.key,
          ...child.val()
        });
      });
    }
    callback(items);
  }, (error) => {
    console.error(`Error in ${path} subscription:`, error);
    callback([]);
  });

  return unsubscribe;
};

// Initialize database with sample data
export const initializeDatabase = async () => {
  try {
    if (!auth.currentUser) {
      console.log('User not authenticated, skipping initialization');
      return false;
    }
    
    // Test write permission
    const testRef = ref(db, `users/${auth.currentUser.uid}/test`);
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Database connection successful'
    });
    
    // Clean up test data
    await remove(testRef);
    
    // Check if collections exist
    const dataRef = ref(db, `users/${auth.currentUser.uid}/data`);
    const snapshot = await get(dataRef);
    
    if (!snapshot.exists()) {
      // Initialize with sample data
      const sampleData = {
        products: {
          '-sample1': {
            name: 'Laptop Pro X1',
            sku: 'LAP-001',
            price: 1299.99,
            stock: 50,
            category: 'Electronics',
            description: 'High-performance laptop',
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          '-sample2': {
            name: 'Wireless Mouse',
            sku: 'MOU-001',
            price: 29.99,
            stock: 100,
            category: 'Electronics',
            description: 'Ergonomic wireless mouse',
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        },
        customers: {
          '-sample1': {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1 234-567-8900',
            address: '123 Main St',
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        }
      };
      
      await set(ref(db, `users/${auth.currentUser.uid}/data`), sampleData);
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

export { auth, db };