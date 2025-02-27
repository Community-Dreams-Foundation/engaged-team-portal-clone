
import { io, Socket } from "socket.io-client"
import { useToast } from "@/hooks/use-toast"

// Socket.IO singleton service
class SocketService {
  private static instance: SocketService
  private socket: Socket | null = null
  private connected: boolean = false
  private userId: string | null = null
  private serverUrl: string = import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3001"

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public connect(userId: string): void {
    if (this.connected) return

    this.userId = userId
    
    this.socket = io(this.serverUrl, {
      query: { userId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    this.setupEventListeners()
    this.connected = true
    
    console.log(`Socket connected for user: ${userId}`)
  }

  public disconnect(): void {
    if (!this.socket || !this.connected) return
    
    this.socket.disconnect()
    this.connected = false
    this.userId = null
    
    console.log("Socket disconnected")
  }

  public isConnected(): boolean {
    return this.connected && !!this.socket
  }

  public subscribeToMeetingUpdates(meetingId: string): void {
    if (!this.socket || !this.connected) return
    
    this.socket.emit("subscribe:meeting", { meetingId })
    console.log(`Subscribed to updates for meeting: ${meetingId}`)
  }

  public unsubscribeFromMeetingUpdates(meetingId: string): void {
    if (!this.socket || !this.connected) return
    
    this.socket.emit("unsubscribe:meeting", { meetingId })
    console.log(`Unsubscribed from updates for meeting: ${meetingId}`)
  }

  public sendMeetingChat(meetingId: string, message: string): void {
    if (!this.socket || !this.connected || !this.userId) return
    
    this.socket.emit("meeting:chat", {
      meetingId,
      userId: this.userId,
      message,
      timestamp: new Date().toISOString()
    })
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected successfully")
      this.connected = true
    })

    this.socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`)
      this.connected = false
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.connected = false
    })

    // Meeting related events
    this.socket.on("meeting:updated", (data) => {
      console.log("Meeting updated:", data)
      const { toast } = useToast()
      toast({
        title: "Meeting Updated",
        description: `${data.title} has been updated by ${data.updatedBy}`,
      })
      
      // We can dispatch an event to update the UI if needed
      window.dispatchEvent(new CustomEvent("meeting:updated", { detail: data }))
    })

    this.socket.on("meeting:reminder", (data) => {
      console.log("Meeting reminder:", data)
      const { toast } = useToast()
      toast({
        title: "Meeting Reminder",
        description: `${data.title} starts in ${data.timeRemaining} minutes`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:reminder", { detail: data }))
    })

    this.socket.on("meeting:started", (data) => {
      console.log("Meeting started:", data)
      const { toast } = useToast()
      toast({
        title: "Meeting Started",
        description: `${data.title} has started. Click to join.`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:started", { detail: data }))
    })

    this.socket.on("meeting:ended", (data) => {
      console.log("Meeting ended:", data)
      const { toast } = useToast()
      toast({
        title: "Meeting Ended",
        description: `${data.title} has ended.`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:ended", { detail: data }))
    })

    this.socket.on("meeting:recording", (data) => {
      console.log("Meeting recording:", data)
      const { toast } = useToast()
      toast({
        title: "Meeting Recording Available",
        description: `Recording for ${data.title} is now available.`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:recording", { detail: data }))
    })

    this.socket.on("meeting:transcript", (data) => {
      console.log("Meeting transcript:", data)
      const { toast } = useToast()
      toast({
        title: "Meeting Transcript Available",
        description: `Transcript for ${data.title} is now available.`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:transcript", { detail: data }))
    })

    this.socket.on("meeting:chat", (data) => {
      console.log("New chat message:", data)
      window.dispatchEvent(new CustomEvent("meeting:chat", { detail: data }))
    })
  }
}

export default SocketService.getInstance()
