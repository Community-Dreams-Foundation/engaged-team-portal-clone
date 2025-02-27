
import { useState } from "react"
import { useMeetings } from "@/contexts/MeetingContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { format, parseISO } from "date-fns"
import { FileVideo, FileText, Search, Calendar, Clock, Download } from "lucide-react"
import { getMeetingRecording, RecordingDetails } from "@/utils/calendarIntegration"
import { useToast } from "@/hooks/use-toast"

export function MeetingRecordings() {
  const { pastMeetings } = useMeetings()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null)
  const [recordingDetails, setRecordingDetails] = useState<RecordingDetails | null>(null)
  const [loadingRecording, setLoadingRecording] = useState(false)
  
  // Filter meetings that have a recording URL or might have one (completed meetings)
  const meetingsWithRecordings = pastMeetings.filter(
    meeting => meeting.status === "completed" || meeting.recordingUrl
  )
  
  // Filter by search term
  const filteredMeetings = meetingsWithRecordings.filter(
    meeting => 
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleViewRecording = async (meetingId: string) => {
    setSelectedRecording(meetingId)
    setLoadingRecording(true)
    
    try {
      // In a real app, this would fetch the actual recording from a storage service
      const details = await getMeetingRecording(meetingId)
      setRecordingDetails(details)
    } catch (error) {
      console.error("Error loading recording:", error)
      toast({
        title: "Error Loading Recording",
        description: "There was an error loading the recording. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingRecording(false)
    }
  }
  
  const selectedMeeting = pastMeetings.find(m => m.id === selectedRecording)
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meeting Recordings & Transcripts</CardTitle>
          <CardDescription>
            Access recordings and transcripts of your past meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recordings found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMeetings.map(meeting => (
                <Card key={meeting.id} className="overflow-hidden">
                  <div className="bg-muted aspect-video flex items-center justify-center">
                    <FileVideo className="h-12 w-12 text-primary/40" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1">{meeting.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(parseISO(meeting.startTime), "MMM d, yyyy")}
                      <Clock className="h-3 w-3 mx-1 ml-2" />
                      {format(parseISO(meeting.startTime), "h:mm a")}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline">{meeting.meetingType}</Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleViewRecording(meeting.id)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedRecording && selectedMeeting && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedMeeting.title}</CardTitle>
            <CardDescription>
              {format(parseISO(selectedMeeting.startTime), "MMMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecording ? (
              <div className="text-center py-8">
                <p>Loading recording...</p>
              </div>
            ) : !recordingDetails ? (
              <div className="text-center py-8">
                <p>Recording not found or still processing</p>
              </div>
            ) : (
              <Tabs defaultValue="recording">
                <TabsList className="mb-4">
                  <TabsTrigger value="recording">Recording</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="details">Meeting Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recording">
                  <div className="rounded-md overflow-hidden bg-muted aspect-video">
                    {/* In a real app, this would be a video player */}
                    <div className="h-full flex flex-col items-center justify-center p-4">
                      <FileVideo className="h-16 w-16 text-primary/40 mb-2" />
                      <p className="text-center text-sm text-muted-foreground mb-4">
                        Video recording from {format(parseISO(selectedMeeting.startTime), "MMM d, yyyy")}
                      </p>
                      <Button className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Recording
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="transcript">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Meeting Transcript</CardTitle>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-muted rounded-md max-h-[400px] overflow-y-auto">
                        <div className="flex items-start space-x-2 mb-4">
                          <FileText className="h-4 w-4 mt-1 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{selectedMeeting.hostName} (Host)</p>
                            <p className="text-sm">
                              Welcome everyone to our {selectedMeeting.meetingType} meeting. Today we'll be discussing our progress and any blockers.
                            </p>
                          </div>
                        </div>
                        
                        {selectedMeeting.participants.slice(0, 3).map((participant, index) => (
                          <div key={participant.id} className="flex items-start space-x-2 mb-4">
                            <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{participant.name}</p>
                              <p className="text-sm">
                                {index === 0 ? "Thanks for organizing this. I've completed the tasks we discussed last time." : 
                                 index === 1 ? "I'm still working on the integration part. Should be done by tomorrow." :
                                 "I've been helping the team with the documentation. It's coming along well."}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 mt-1 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{selectedMeeting.hostName} (Host)</p>
                            <p className="text-sm">
                              Great updates everyone. Let's schedule our next meeting for next week.
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                          Note: This is a mock transcript. In a real application, this would be the actual transcribed text.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Description</h3>
                      <p className="text-sm text-muted-foreground">{selectedMeeting.description || "No description provided"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Participants</h3>
                      <div className="grid gap-2 md:grid-cols-2">
                        {selectedMeeting.participants.map(participant => (
                          <div key={participant.id} className="flex items-center p-2 rounded-md border">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              {participant.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{participant.name}</p>
                              <p className="text-xs text-muted-foreground">{participant.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedMeeting.agendaItems && selectedMeeting.agendaItems.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-1">Agenda</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedMeeting.agendaItems.map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
