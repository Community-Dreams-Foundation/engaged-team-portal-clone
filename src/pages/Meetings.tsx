
import { MeetingsDashboard } from "@/components/meetings/MeetingsDashboard"
import { MeetingProvider } from "@/contexts/MeetingContext"
import { CalendarProvider } from "@/contexts/CalendarContext"

export default function MeetingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Meetings</h1>
      <CalendarProvider>
        <MeetingProvider>
          <MeetingsDashboard />
        </MeetingProvider>
      </CalendarProvider>
    </div>
  )
}
