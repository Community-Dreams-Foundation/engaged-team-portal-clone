
import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc, serverTimestamp, getDoc, deleteDoc, arrayUnion } from "firebase/firestore"
import { nanoid } from 'nanoid'
import { logActivity } from "./activityOperations"

export interface TaskComment {
  id: string
  text: string
  userId: string
  timestamp: number
  userName?: string
  parentId?: string
}

export async function addComment(userId: string, taskId: string, text: string) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    const commentId = nanoid()
    const timestamp = Date.now()
    
    // Create the comment
    const commentData = {
      id: commentId,
      text,
      userId,
      timestamp,
      userName,
      taskId,
      parentId: null
    }
    
    await addDoc(collection(db, "task_comments"), commentData)
    
    // Log this activity
    await logActivity(userId, taskId, {
      type: "comment",
      timestamp,
      details: `${userName} added a comment`
    })
    
    return commentId
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

export async function addCommentReply(userId: string, taskId: string, text: string, parentId: string) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    const commentId = nanoid()
    const timestamp = Date.now()
    
    // Create the reply
    const replyData = {
      id: commentId,
      text,
      userId,
      timestamp,
      userName,
      taskId,
      parentId
    }
    
    await addDoc(collection(db, "task_comments"), replyData)
    
    // Log this activity
    await logActivity(userId, taskId, {
      type: "comment",
      timestamp,
      details: `${userName} replied to a comment`
    })
    
    return commentId
  } catch (error) {
    console.error("Error adding reply:", error)
    throw error
  }
}

export async function fetchComments(userId: string, taskId: string): Promise<TaskComment[]> {
  try {
    const commentsQuery = query(
      collection(db, "task_comments"),
      where("taskId", "==", taskId),
      orderBy("timestamp", "desc")
    )
    
    const snapshot = await getDocs(commentsQuery)
    const comments: TaskComment[] = []
    
    snapshot.forEach(doc => {
      comments.push(doc.data() as TaskComment)
    })
    
    return comments
  } catch (error) {
    console.error("Error fetching comments:", error)
    throw error
  }
}

export async function deleteComment(userId: string, taskId: string, commentId: string) {
  try {
    // Find the comment doc to delete
    const commentsQuery = query(
      collection(db, "task_comments"),
      where("id", "==", commentId),
      where("taskId", "==", taskId)
    )
    
    const snapshot = await getDocs(commentsQuery)
    
    if (snapshot.empty) {
      throw new Error("Comment not found")
    }
    
    // Check if user owns the comment
    const commentDoc = snapshot.docs[0]
    const commentData = commentDoc.data()
    
    if (commentData.userId !== userId) {
      throw new Error("Unauthorized to delete this comment")
    }
    
    // Delete the comment
    await deleteDoc(commentDoc.ref)
    
    // Also delete all replies to this comment
    const repliesQuery = query(
      collection(db, "task_comments"),
      where("parentId", "==", commentId)
    )
    
    const repliesSnapshot = await getDocs(repliesQuery)
    
    for (const replyDoc of repliesSnapshot.docs) {
      await deleteDoc(replyDoc.ref)
    }
    
    // Log this activity
    await logActivity(userId, taskId, {
      type: "comment",
      timestamp: Date.now(),
      details: "Comment was deleted"
    })
    
    return true
  } catch (error) {
    console.error("Error deleting comment:", error)
    throw error
  }
}
