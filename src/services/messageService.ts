
import { 
  getDatabase, 
  ref, 
  push,
  set, 
  onValue, 
  off,
  serverTimestamp,
  query,
  orderByChild,
  update
} from "firebase/database"
import { Message } from "@/types/communication"

export const fetchMessages = async (): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    const messagesRef = query(ref(db, 'messages'), orderByChild('timestamp'))

    onValue(messagesRef, (snapshot) => {
      const messages: Message[] = []
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val()
        messages.push({
          id: childSnapshot.key || '',
          ...message,
          timestamp: message.timestamp || new Date().toISOString()
        })
      })
      resolve(messages.reverse())
    }, (error) => {
      console.error("Error fetching messages:", error)
      reject(error)
    })
  })
}

export const sendMessage = async (messageData: Omit<Message, 'id'>) => {
  const db = getDatabase()
  const messagesRef = ref(db, 'messages')
  return push(messagesRef, {
    ...messageData,
    timestamp: serverTimestamp(),
    likes: 0,
    replies: []
  })
}

export const toggleLike = async (messageId: string, currentLikes: number) => {
  const db = getDatabase()
  const messageRef = ref(db, `messages/${messageId}`)
  return update(messageRef, {
    likes: currentLikes + 1
  })
}

export const addReply = async (messageId: string, replyData: Omit<Message, 'id'>) => {
  const db = getDatabase()
  const repliesRef = ref(db, `messages/${messageId}/replies`)
  return push(repliesRef, {
    ...replyData,
    timestamp: serverTimestamp()
  })
}

export const markAsRead = async (messageId: string) => {
  const db = getDatabase()
  const messageRef = ref(db, `messages/${messageId}`)
  return update(messageRef, {
    isRead: true
  })
}
