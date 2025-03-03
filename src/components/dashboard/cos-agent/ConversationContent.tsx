
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { 
  Bot, 
  Folder, 
  PlusCircle, 
  Layers, 
  PanelRight, 
  Lightbulb, 
  Mic, 
  FileImage,
  Paperclip,
  Image as ImageIcon,
  X,
  Send,
  Loader2
} from "lucide-react";
import { ConversationThread, ThreadMessage } from "@/types/conversation";
import { Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { getDatabase, ref, get } from "firebase/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ConversationContentProps {
  activeThread: ConversationThread | undefined;
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  setIsCreatingThread: (creating: boolean) => void;
}

export function ConversationContent({
  activeThread,
  newMessage,
  setNewMessage,
  sendMessage,
  setIsCreatingThread
}: ConversationContentProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    const fetchTasks = async () => {
      try {
        const db = getDatabase();
        const tasksRef = ref(db, `users/${currentUser.uid}/tasks`);
        const tasksSnapshot = await get(tasksRef);
        
        if (tasksSnapshot.exists()) {
          const tasksData = tasksSnapshot.val();
          const tasksList = Object.values(tasksData) as Task[];
          setTasks(tasksList.filter(task => task.status !== 'completed'));
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    
    fetchTasks();
  }, [currentUser?.uid]);

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setNewMessage(newMessage + `\n\nI'd like to discuss task "${task.title}" (ID: ${task.id}). Can you help me with this?`);
  };

  const getTaskSuggestions = () => {
    return tasks.filter(task => {
      if (task.status === 'in-progress' && task.totalElapsedTime && task.estimatedDuration) {
        return task.totalElapsedTime > task.estimatedDuration * 60 * 1000 * 0.8;
      }
      if (task.metadata?.complexity === 'high') {
        return true;
      }
      if (task.dependencies && task.dependencies.length > 2) {
        return true;
      }
      return false;
    }).slice(0, 3);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAttachment(file);
    
    // Create preview if it's an image
    if (file.type.includes("image")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
    
    // Update message with attachment note
    setNewMessage(newMessage + 
      (newMessage ? "\n\n" : "") + 
      `I'm sending you a ${file.type.includes("image") ? "image" : "file"}: ${file.name}`);
  };
  
  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };
  
  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Mock voice recording
      toast({
        title: "Voice Recording Active",
        description: "Speak clearly and I'll transcribe your message.",
      });
      
      // Simulate recording for 3 seconds then add transcribed text
      setTimeout(() => {
        setIsRecording(false);
        setNewMessage(prev => 
          prev + (prev ? " " : "") + "This is a simulated voice transcription added to your message."
        );
        
        toast({
          title: "Voice Recording Complete",
          description: "Your message has been transcribed.",
        });
      }, 3000);
    }
  };

  const taskSuggestions = getTaskSuggestions();

  // Render rich media content in messages (like images, charts, etc.)
  const renderMessageContent = (message: ThreadMessage) => {
    // Check if message contains special content markers
    if (message.content.includes("![IMAGE]")) {
      // Extract image URL if present (in a real implementation)
      const placeholderImage = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6";
      
      return (
        <div className="space-y-2">
          <p>{message.content.replace("![IMAGE]", "")}</p>
          <div className="rounded-md overflow-hidden border">
            <img 
              src={placeholderImage} 
              alt="Attachment" 
              className="max-h-60 object-contain"
            />
          </div>
        </div>
      );
    }
    
    // Check for task visualization
    if (message.content.includes("![CHART]")) {
      return (
        <div className="space-y-2">
          <p>{message.content.replace("![CHART]", "")}</p>
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="h-40 flex items-center justify-center">
              <p className="text-muted-foreground">Task completion chart would appear here</p>
            </div>
          </div>
        </div>
      );
    }
    
    // Regular text message
    return <p>{message.content}</p>;
  };

  if (!activeThread) {
    return (
      <div className="h-[600px] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">No Active Conversation</h3>
            <p className="text-muted-foreground max-w-md">
              Select an existing conversation or create a new one to start chatting with your CoS agent.
            </p>
            <Button 
              onClick={() => setIsCreatingThread(true)}
              className="mx-auto"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">
          {activeThread.title}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {activeThread.messages?.length || 0} messages
          </Badge>
          <Button
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setShowTaskPanel(!showTaskPanel)}
          >
            <PanelRight className="h-4 w-4" />
            <span className="sr-only">Task Panel</span>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Folder className="h-4 w-4" />
                <span className="sr-only">Thread Options</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Rename Thread
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Archive Thread
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive text-sm">
                  Delete Thread
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex flex-1">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {activeThread?.messages?.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.sender === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {renderMessageContent(message)}
                  <span className="text-xs opacity-70 mt-1 inline-block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {showTaskPanel && (
          <div className="w-80 border-l p-4 overflow-auto">
            <Tabs defaultValue="tasks">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Active Tasks</h4>
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active tasks found</p>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {tasks.map(task => (
                          <div 
                            key={task.id} 
                            className="border rounded-md p-2 cursor-pointer hover:bg-secondary/50"
                            onClick={() => handleTaskSelect(task)}
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm">{task.title}</h5>
                              {task.status === 'in-progress' && (
                                <Badge variant="secondary" className="text-xs">In Progress</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="suggestions" className="mt-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Task Suggestions</h4>
                  {taskSuggestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No suggestions available</p>
                  ) : (
                    <div className="space-y-2">
                      {taskSuggestions.map(task => (
                        <div 
                          key={task.id} 
                          className="border rounded-md p-3 hover:bg-secondary/50 cursor-pointer"
                          onClick={() => handleTaskSelect(task)}
                        >
                          <div className="flex items-start gap-2">
                            {task.metadata?.complexity === 'high' ? (
                              <Layers className="h-4 w-4 text-purple-500 mt-0.5" />
                            ) : (
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                            )}
                            <div>
                              <h5 className="font-medium text-sm">{task.title}</h5>
                              <p className="text-xs text-muted-foreground">
                                {task.metadata?.complexity === 'high' 
                                  ? "Complex task - may need breaking down" 
                                  : "Task might need your attention"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="bg-secondary/30 rounded-md p-3 mt-4">
                    <h5 className="text-sm font-medium mb-2">Quick Task Actions</h5>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-sm"
                        onClick={() => setNewMessage("Can you help me prioritize my tasks for today?")}
                      >
                        Prioritize today's tasks
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-sm"
                        onClick={() => setNewMessage("I need help breaking down a complex task. Can you assist me?")}
                      >
                        Help me break down a task
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-sm"
                        onClick={() => setNewMessage("Can you analyze my current workload and suggest optimizations?")}
                      >
                        Analyze my workload
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        {attachment && (
          <div className="mb-2 p-2 border rounded-md flex items-center justify-between">
            <div className="flex items-center">
              {attachmentPreview ? (
                <div className="w-10 h-10 mr-2 flex-shrink-0 overflow-hidden rounded">
                  <img 
                    src={attachmentPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <FileImage className="w-5 h-5 mr-2 text-muted-foreground" />
              )}
              <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={removeAttachment}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
            // Clear attachment after sending
            setAttachment(null);
            setAttachmentPreview(null);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={isRecording ? "text-red-500 animate-pulse" : ""}
            onClick={toggleVoiceRecording}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() && !attachment}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
