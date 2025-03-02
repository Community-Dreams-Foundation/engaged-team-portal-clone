
import { useState } from "react"
import { CosChat } from "./cos-agent/CosChat"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function CosSidebarChat() {
  const [minimized, setMinimized] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <>
      <div className={`fixed bottom-4 right-4 z-50 transition-opacity ${fullscreen ? 'opacity-0' : 'opacity-100'}`}>
        {minimized ? (
          <Button 
            onClick={() => setMinimized(false)} 
            className="flex items-center gap-2 rounded-full p-3 shadow-lg"
            variant="default"
          >
            <Bot className="h-5 w-5" />
            <span>Ask CoS</span>
          </Button>
        ) : (
          <div className="w-80 h-96 shadow-xl rounded-md overflow-hidden">
            <CosChat 
              minimized={false} 
              onMinimize={() => setMinimized(true)}
              onMaximize={() => {
                setFullscreen(true)
                setMinimized(true)
              }}
            />
          </div>
        )}
      </div>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] p-0">
          <CosChat 
            onMinimize={() => {
              setFullscreen(false)
              setMinimized(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
