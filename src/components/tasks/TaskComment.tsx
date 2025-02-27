
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Edit, Trash2, Reply, Check, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { deleteComment, addCommentReply, editComment } from "@/utils/tasks/commentOperations"

interface CommentWithReplies {
  id: string
  text: string
  userId: string
  timestamp: number
  userName?: string
  parentId?: string
  taskId: string
  lastEdited?: number
  replies?: CommentWithReplies[]
}

interface TaskCommentProps {
  id: string
  text: string
  userId: string
  timestamp: number
  userName?: string
  taskId: string
  onReplyToggle: (commentId: string) => void
  showReplyForm: boolean
  parentId?: string
  replies?: CommentWithReplies[]
  lastEdited?: number
}

export function TaskComment({
  id,
  text,
  userId,
  timestamp,
  userName = "User",
  taskId,
  onReplyToggle,
  showReplyForm,
  parentId,
  replies,
  lastEdited,
}: TaskCommentProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(text)
  const [replyText, setReplyText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const isOwner = currentUser?.uid === userId

  const handleDelete = async () => {
    if (!currentUser?.uid) return

    try {
      await deleteComment(currentUser.uid, taskId, id)
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        variant: "destructive",
        title: "Error deleting comment",
        description: "There was an error deleting your comment. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReply = async () => {
    if (!currentUser?.uid || !replyText.trim()) return

    setIsSubmittingReply(true)
    try {
      await addCommentReply(currentUser.uid, taskId, replyText, id)
      setReplyText("")
      onReplyToggle(id) // Close the reply form
      toast({
        title: "Reply added",
        description: "Your reply has been added successfully",
      })
    } catch (error) {
      console.error("Error adding reply:", error)
      toast({
        variant: "destructive",
        title: "Error adding reply",
        description: "There was an error adding your reply. Please try again.",
      })
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleEdit = async () => {
    if (!currentUser?.uid || !editedText.trim()) return

    try {
      await editComment(currentUser.uid, taskId, id, editedText)
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error editing comment:", error)
      toast({
        variant: "destructive",
        title: "Error updating comment",
        description: "There was an error updating your comment. Please try again.",
      })
    }
  }

  return (
    <div className="space-y-3">
      <Card className={`p-4 transition ${parentId ? "ml-6" : ""}`}>
        <div className="flex justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://avatar.vercel.sh/${userId}`} alt={userName} />
              <AvatarFallback>{userName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-sm">{userName}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(timestamp, { addSuffix: true })}
                {lastEdited && (
                  <> · Edited {formatDistanceToNow(lastEdited, { addSuffix: true })}</>
                )}
              </span>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex items-center gap-1">
              {!isEditing && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive" 
                    onClick={() => setIsDeleting(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              
              {isEditing && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-green-500" 
                    onClick={handleEdit}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive" 
                    onClick={() => {
                      setIsEditing(false)
                      setEditedText(text)
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="mb-2"
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{text}</p>
        )}
        
        {!isEditing && currentUser && !parentId && (
          <div className="mt-2 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs" 
              onClick={() => onReplyToggle(id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>
        )}
      </Card>

      {showReplyForm && !parentId && (
        <div className="ml-6 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setReplyText("")
                onReplyToggle(id)
              }}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleReply}
              disabled={!replyText.trim() || isSubmittingReply}
            >
              {isSubmittingReply ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </div>
      )}

      {replies && replies.length > 0 && (
        <div className="space-y-3 mt-3">
          {replies.map((reply) => (
            <TaskComment
              key={reply.id}
              id={reply.id}
              text={reply.text}
              userId={reply.userId}
              timestamp={reply.timestamp}
              userName={reply.userName}
              taskId={taskId}
              onReplyToggle={() => {}}
              showReplyForm={false}
              parentId={id}
              lastEdited={reply.lastEdited}
            />
          ))}
        </div>
      )}

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your comment and any replies.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
