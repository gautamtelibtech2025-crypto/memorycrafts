import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, getDocs, setDoc, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export interface Order {
  id: string;
  userId: string;
  title: string;
  price: number;
  type: 'canva_template' | 'custom_website';
  category: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Ready' | 'Delivered';
  createdAt: string;
  imageUrl?: string;
  canvaLink?: string;
  siteUrl?: string;
  downloadLink?: string;
  purchasedPlan?: string;
  paymentStatus?: 'Pending' | 'Paid';
}

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: 'user' | 'owner';
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: string;
}

// Local storage keys
const ORDERS_STORAGE_KEY = 'memorycraft_orders_v1';
const CHATS_STORAGE_KEY = 'memorycraft_chats_v1';

// Returning empty array so there are no default/fake orders as requested
const DEFAULT_ORDERS = (userId: string): Order[] => [];

// Initial default chat messages for the default orders
const DEFAULT_CHATS = (orderId: string): ChatMessage[] => {
  if (orderId === 'MC-8930') {
    return [
      {
        id: 'msg-1',
        orderId,
        sender: 'owner',
        senderName: 'Aris (Artisan)',
        senderPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
        text: 'Greetings! I am Aris, your dedicated MemoryCraft artisan. I have configured your Anniversary Surprise Chronology portal! Feel free to request custom musical selections or copy changes right here.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-2',
        orderId,
        sender: 'user',
        senderName: 'Me',
        text: 'Wow, thank you! It looks gorgeous. Can we ensure the background transitions are soft fades?',
        createdAt: new Date(Date.now() - 1.9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-3',
        orderId,
        sender: 'owner',
        senderName: 'Aris (Artisan)',
        senderPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
        text: 'Absolutely. I have updated the animation timing of the slide layouts to use an ultra-fine 800ms fade curve. The live portal is updated!',
        createdAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  if (orderId === 'MC-1102') {
    return [
      {
        id: 'msg-w1',
        orderId,
        sender: 'owner',
        senderName: 'Aris (Artisan)',
        senderPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
        text: 'Thank you for choosing our Wedding suite! Your Canva direct link is fully active. If you need custom matching fonts or layout tips, drop a note here.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  return [
    {
      id: `msg-auto-init-${orderId}`,
      orderId,
      sender: 'owner',
      senderName: 'Aris (Artisan)',
      senderPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
      text: 'Thank you for your premium order! I am currently pre-warming your milestone archive. What custom text, music, or specific aesthetic adjustments would you like me to make?',
      createdAt: new Date().toISOString()
    }
  ];
};

/**
 * Get all orders for the authenticated user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  if (isFirebaseConfigured && db) {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const firestoreOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        firestoreOrders.push({ id: doc.id, ...doc.data() } as Order);
      });

      if (firestoreOrders.length > 0) {
        // Cache to local storage
        localStorage.setItem(`${ORDERS_STORAGE_KEY}_${userId}`, JSON.stringify(firestoreOrders));
        return firestoreOrders;
      }
    } catch (err: any) {
      console.info('Firestore orders retrieval failed, falling back to local storage:', err.message || err);
    }
  }

  // Local Storage & Defaults Fallback
  try {
    const localData = localStorage.getItem(`${ORDERS_STORAGE_KEY}_${userId}`);
    if (localData) {
      return JSON.parse(localData);
    } else {
      const defaultData = DEFAULT_ORDERS(userId);
      localStorage.setItem(`${ORDERS_STORAGE_KEY}_${userId}`, JSON.stringify(defaultData));
      return defaultData;
    }
  } catch {
    return DEFAULT_ORDERS(userId);
  }
}

/**
 * Create a new order (after successful checkout)
 */
export async function createOrder(userId: string, title: string, price: number, type: 'canva_template' | 'custom_website', category: string): Promise<Order> {
  const newOrder: Order = {
    id: `MC-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    title,
    price,
    type,
    category,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    canvaLink: type === 'canva_template' ? 'https://www.canva.com/design/play-template' : undefined,
    siteUrl: type === 'custom_website' ? `https://memorycraft.site/custom-${Math.floor(100 + Math.random() * 900)}` : undefined,
    downloadLink: undefined,
    purchasedPlan: type === 'custom_website' ? 'Bespoke Surprise Site Plan' : 'Premium Canva Template Plan',
    paymentStatus: 'Paid',
    imageUrl: type === 'custom_website' 
      ? 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300'
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
  };

  if (isFirebaseConfigured && db) {
    try {
      const orderDocRef = doc(db, 'orders', newOrder.id);
      await setDoc(orderDocRef, newOrder);
    } catch (err: any) {
      console.info('Failed to save order to Firestore:', err.message || err);
    }
  }

  // Always save locally
  try {
    const orders = await getUserOrders(userId);
    const updated = [newOrder, ...orders.filter(o => o.id !== newOrder.id)];
    localStorage.setItem(`${ORDERS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save order to local storage cache:', err);
  }

  return newOrder;
}

/**
 * Fetch chat messages for a specific order
 */
export async function getChatMessages(orderId: string): Promise<ChatMessage[]> {
  if (isFirebaseConfigured && db) {
    try {
      const messagesRef = collection(db, 'chats', orderId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const firestoreMsgs: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        firestoreMsgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });

      if (firestoreMsgs.length > 0) {
        localStorage.setItem(`${CHATS_STORAGE_KEY}_${orderId}`, JSON.stringify(firestoreMsgs));
        return firestoreMsgs;
      }
    } catch (err: any) {
      console.info('Firestore chat retrieval failed:', err.message || err);
    }
  }

  // Fallback
  try {
    const localData = localStorage.getItem(`${CHATS_STORAGE_KEY}_${orderId}`);
    if (localData) {
      return JSON.parse(localData);
    } else {
      const defaultData = DEFAULT_CHATS(orderId);
      localStorage.setItem(`${CHATS_STORAGE_KEY}_${orderId}`, JSON.stringify(defaultData));
      return defaultData;
    }
  } catch {
    return DEFAULT_CHATS(orderId);
  }
}

/**
 * Send a chat message
 */
export async function sendChatMessage(orderId: string, sender: 'user' | 'owner', senderName: string, text: string, senderPhoto?: string): Promise<ChatMessage> {
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId,
    sender,
    senderName,
    senderPhoto,
    text,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const msgDocRef = doc(db, 'chats', orderId, 'messages', newMsg.id);
      await setDoc(msgDocRef, newMsg);
    } catch (err: any) {
      console.info('Firestore message sending failed:', err.message || err);
    }
  }

  // Always save locally
  try {
    const currentMsgs = await getChatMessages(orderId);
    const updated = [...currentMsgs, newMsg];
    localStorage.setItem(`${CHATS_STORAGE_KEY}_${orderId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save message to local storage:', err);
  }

  return newMsg;
}
