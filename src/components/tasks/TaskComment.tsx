
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { Reply, ThumbsUp, Trash } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { addCommentReply, deleteComment } from "@/utils/tasks/commentOperations"

interface TaskCommentProps {
  id: string
  text: string
  userId: string
  timestamp: number
  taskId: string
  userName?: string
  parentId?: string
  onReplyToggle?: (commentId: string) => void
  showReplyForm?: boolean
  replies?: TaskCommentProps[]
}

export function TaskComment({ 
  id, 
  text, 
  userId, 
  timestamp, 
  taskId,
  userName = "User",
  parentId,
  onReplyToggle,
  showReplyForm,
  replies = []
}: TaskCommentProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [replyText, setReplyText] = useState("")

  const handleDelete = async () => {
    if (!currentUser?.uid) return

    try {
      setIsDeleting(true)
      await deleteComment(currentUser.uid, taskId, id)
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully"
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        variant: "destructive",
        title: "Error deleting comment",
        description: "There was an error deleting your comment. Please try again."
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReply = async () => {
    if (!currentUser?.uid || !replyText.trim()) return

    try {
      await addCommentReply(currentUser.uid, taskId, replyText, id)
      setReplyText("")
      if (onReplyToggle) onReplyToggle(id) // Hide reply form
      toast({
        title: "Reply added",
        description: "Your reply has been added successfully"
      })
    } catch (error) {
      console.error("Error adding reply:", error)
      toast({
        variant: "destructive",
        title: "Error adding reply",
        description: "There was an error adding your reply. Please try again."
      })
    }
  }

  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase()
  const isOwnComment = currentUser?.uid === userId
  
  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://avatar.vercel.sh/${userId}`} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{userName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(timestamp, { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm mt-1">{text}</p>
          </div>
          
          <div className="flex items-center gap-2 pl-1">
            {onReplyToggle && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => onReplyToggle(id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            
            {isOwnComment && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {showReplyForm && (
        <div className="pl-10 mt-2">
          <div className="space-y-2">
            <Textarea 
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (onReplyToggle) onReplyToggle(id);
                  setReplyText("");
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleReply}
                disabled={!replyText.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {replies.length > 0 && (
        <div className="pl-10 space-y-3">
          {replies.map(reply => (
            <TaskComment 
              key={reply.id}
              {...reply}
              taskId={taskId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
