
import { useEffect, useState } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WaiverStatus } from "./WaiverStatus"
import { formatDistanceToNow } from "date-fns"

interface Waiver {
  id: string
  title: string
  reason: string
  additionalDetails?: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export function WaiverList() {
  const [waivers, setWaivers] = useState<Waiver[]>([])
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) return

    const waiversRef = collection(db, "waivers")
    const userWaivers = query(waiversRef, where("userId", "==", currentUser.uid))
    
    const unsubscribe = onSnapshot(userWaivers, (snapshot) => {
      const waiversData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Waiver[]

      setWaivers(waiversData)
    })

    return () => unsubscribe()
  }, [currentUser])

  if (waivers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No waiver requests found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {waivers.map((waiver) => (
        <Card key={waiver.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{waiver.title}</CardTitle>
              <WaiverStatus status={waiver.status} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{waiver.reason}</p>
            {waiver.additionalDetails && (
              <p className="text-sm text-muted-foreground mb-4">{waiver.additionalDetails}</p>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Submitted {formatDistanceToNow(new Date(waiver.createdAt), { addSuffix: true })}
              </span>
              <span>
                Last updated {formatDistanceToNow(new Date(waiver.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
