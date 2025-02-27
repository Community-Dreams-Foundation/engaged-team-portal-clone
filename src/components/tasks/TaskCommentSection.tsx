
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskComment } from "./TaskComment"
import { TaskActivity } from "./TaskActivity"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Task } from "@/types/task"
import { addComment, fetchComments } from "@/utils/tasks/commentOperations"

interface TaskCommentSectionProps {
  task: Task
}

interface CommentWithReplies {
  id: string
  text: string
  userId: string
  timestamp: number
  userName?: string
  parentId?: string
  replies?: CommentWithReplies[]
}

export function TaskCommentSection({ task }: TaskCommentSectionProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!currentUser?.uid) return

    const loadComments = async () => {
      setIsLoading(true)
      try {
        const fetchedComments = await fetchComments(currentUser.uid, task.id)
        
        // Organize comments into a tree structure
        const commentMap = new Map<string, CommentWithReplies>()
        const rootComments: CommentWithReplies[] = []
        
        // First pass: Create all comment objects
        fetchedComments.forEach(comment => {
          commentMap.set(comment.id, { ...comment, replies: [] })
        })
        
        // Second pass: Organize into parent/child relationships
        fetchedComments.forEach(comment => {
          if (comment.parentId) {
            const parent = commentMap.get(comment.parentId)
            if (parent && parent.replies) {
              parent.replies.push(commentMap.get(comment.id)!)
            }
          } else {
            rootComments.push(commentMap.get(comment.id)!)
          }
        })
        
        // Sort comments by timestamp (newest first)
        const sortByTimestamp = (a: CommentWithReplies, b: CommentWithReplies) => 
          b.timestamp - a.timestamp
          
        rootComments.sort(sortByTimestamp)
        rootComments.forEach(comment => {
          if (comment.replies) {
            comment.replies.sort(sortByTimestamp)
          }
        })
        
        setComments(rootComments)
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          variant: "destructive",
          title: "Error fetching comments",
          description: "There was an error loading comments. Please try again."
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadComments()
  }, [currentUser?.uid, task.id, toast])

  const handleAddComment = async () => {
    if (!currentUser?.uid || !commentText.trim()) return

    try {
      await addComment(currentUser.uid, task.id, commentText)
      setCommentText("")
      
      // Refresh comments
      const fetchedComments = await fetchComments(currentUser.uid, task.id)
      
      // Similar organization logic as in useEffect
      const commentMap = new Map<string, CommentWithReplies>()
      const rootComments: CommentWithReplies[] = []
      
      fetchedComments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] })
      })
      
      fetchedComments.forEach(comment => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId)
          if (parent && parent.replies) {
            parent.replies.push(commentMap.get(comment.id)!)
          }
        } else {
          rootComments.push(commentMap.get(comment.id)!)
        }
      })
      
      rootComments.sort((a, b) => b.timestamp - a.timestamp)
      rootComments.forEach(comment => {
        if (comment.replies) {
          comment.replies.sort((a, b) => b.timestamp - a.timestamp)
        }
      })
      
      setComments(rootComments)
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully"
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        variant: "destructive", 
        title: "Error adding comment",
        description: "There was an error adding your comment. Please try again."
      })
    }
  }

  const toggleReplyForm = (commentId: string) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId)
  }

  return (
    <Tabs defaultValue="comments" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      
      <TabsContent value="comments" className="space-y-4 mt-4">
        <div className="space-y-3">
          <Textarea 
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddComment}
              disabled={!commentText.trim() || !currentUser?.uid}
            >
              Add Comment
            </Button>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          {isLoading ? (
            <div className="text-center py-4">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map(comment => (
              <TaskComment 
                key={comment.id}
                id={comment.id}
                text={comment.text}
                userId={comment.userId}
                timestamp={comment.timestamp}
                userName={comment.userName}
                taskId={task.id}
                onReplyToggle={toggleReplyForm}
                showReplyForm={activeReplyId === comment.id}
                replies={comment.replies}
              />
            ))
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="activity" className="mt-4">
        <TaskActivity activities={task.activities || []} />
      </TabsContent>
    </Tabs>
  )
}
