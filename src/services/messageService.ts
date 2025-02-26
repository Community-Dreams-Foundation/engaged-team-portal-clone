
import { 
  getDatabase, 
  ref, 
  push, 
  onValue, 
  off,
  serverTimestamp,
  query,
  orderByChild 
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
    timestamp: serverTimestamp()
  })
}
