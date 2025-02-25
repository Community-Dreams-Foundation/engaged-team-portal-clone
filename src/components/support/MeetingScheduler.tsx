
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Users } from "lucide-react"

export function MeetingScheduler() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [timeSlot, setTimeSlot] = useState<string>()
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ]

  const handleScheduleMeeting = () => {
    if (!date || !timeSlot) {
      toast({
        variant: "destructive",
        title: "Please select both date and time",
        description: "A date and time slot are required to schedule a meeting",
      })
      return
    }

    toast({
      title: "Meeting Scheduled",
      description: `Your meeting has been scheduled for ${date.toLocaleDateString()} at ${timeSlot}`,
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Schedule a Meeting</h3>
        </div>
        <Badge variant="outline">Fellowship Counselor</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="time-slot">Select Time</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger id="time-slot">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Meeting Notes</Label>
            <Textarea
              id="notes"
              placeholder="What would you like to discuss?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleScheduleMeeting}
          >
            Schedule Meeting
          </Button>
        </div>
      </div>
    </Card>
  )
}
