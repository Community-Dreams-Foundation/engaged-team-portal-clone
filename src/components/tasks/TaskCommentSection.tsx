
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskComment } from "./TaskComment"
import { TaskActivity } from "./TaskActivity"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/NotificationContext"
import { Task } from "@/types/task"
import { addComment, fetchComments } from "@/utils/tasks/commentOperations"
import { fetchUsers, UserSummary } from "@/utils/userOperations"

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
  taskId: string
  replies?: CommentWithReplies[]
  mentions?: string[]
  reactions?: Record<string, string[]>
  lastEdited?: number
}

export function TaskCommentSection({ task }: TaskCommentSectionProps) {
  const { currentUser } = useAuth()
  const { addNotification } = useNotifications()
  const { toast } = useToast()
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<UserSummary[]>([])
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [mentionSearchPosition, setMentionSearchPosition] = useState({ top: 0, left: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
          commentMap.set(comment.id, { ...comment, taskId: task.id, replies: [] })
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

  useEffect(() => {
    // Load users for mentions
    const loadUsers = async () => {
      if (!currentUser?.uid) return
      
      try {
        const fetchedUsers = await fetchUsers()
        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }
    
    loadUsers()
  }, [currentUser])

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
        commentMap.set(comment.id, { ...comment, taskId: task.id, replies: [] })
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setCommentText(text)
    
    // Check if the last character is '@' to start mention search
    const lastAtPosition = text.lastIndexOf('@')
    if (lastAtPosition !== -1 && (lastAtPosition === 0 || text[lastAtPosition - 1] === ' ')) {
      // Extract search term after '@'
      const searchText = text.substring(lastAtPosition + 1).split(' ')[0]
      setSearchTerm(searchText)
      
      // Position the user search dropdown
      if (textareaRef.current) {
        const cursorPosition = textareaRef.current.selectionStart
        const textBeforeCursor = text.substring(0, cursorPosition)
        const lines = textBeforeCursor.split('\n')
        const currentLine = lines.length
        const lineLength = lines[lines.length - 1].length
        
        // Calculate position based on cursor location
        // These values are approximate and may need adjustment
        const lineHeight = 20 // approx line height in pixels
        const charWidth = 8 // approx character width in pixels
        
        setMentionSearchPosition({
          top: (currentLine * lineHeight) + 20, // add some offset
          left: (lineLength * charWidth) - (searchText.length * charWidth)
        })
      }
      
      setShowUserSearch(true)
    } else {
      setShowUserSearch(false)
    }
  }

  const insertMention = (user: UserSummary) => {
    if (!textareaRef.current) return
    
    const text = commentText
    const lastAtPosition = text.lastIndexOf('@')
    
    if (lastAtPosition !== -1) {
      // Replace the @searchterm with @[username](userId)
      const before = text.substring(0, lastAtPosition)
      const after = text.substring(lastAtPosition + searchTerm.length + 1)
      
      const newText = before + `@[${user.name}](${user.id})` + " " + after
      setCommentText(newText)
      
      // Focus back on textarea after insertion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 0)
    }
    
    setShowUserSearch(false)
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Tabs defaultValue="comments" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      
      <TabsContent value="comments" className="space-y-4 mt-4">
        <div className="space-y-3 relative">
          <Textarea 
            ref={textareaRef}
            placeholder="Add a comment... Use @ to mention someone"
            value={commentText}
            onChange={handleTextareaChange}
            className="min-h-[100px]"
          />
          
          {showUserSearch && filteredUsers.length > 0 && (
            <div 
              className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10 w-64"
              style={{ 
                top: `${mentionSearchPosition.top}px`, 
                left: `${mentionSearchPosition.left}px` 
              }}
            >
              <ScrollArea className="h-[200px]">
                <div className="p-2">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => insertMention(user)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
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
                mentions={comment.mentions}
                reactions={comment.reactions}
                lastEdited={comment.lastEdited}
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

// Import the necessary components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
