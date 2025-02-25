
import { getDatabase, ref, update, onValue, off } from "firebase/database";
import type { WaiverRequest } from "@/types/waiver";

export class WaiverService {
  private static listenersCount = 0;

  static async updateWaiverStatus(
    waiverId: string, 
    status: "approved" | "rejected",
    reviewComments: string
  ) {
    const db = getDatabase();
    const waiverRef = ref(db, `waivers/${waiverId}`);
    
    await update(waiverRef, {
      status,
      review_comments: reviewComments,
      reviewed_at: new Date().toISOString()
    });
  }

  static subscribeToWaivers(callback: (waivers: WaiverRequest[]) => void) {
    this.listenersCount++;
    const db = getDatabase();
    const waiversRef = ref(db, "waivers");

    onValue(waiversRef, (snapshot) => {
      if (snapshot.exists()) {
        const waiversData = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          waiver_id: id,
          ...data
        }));
        callback(waiversData);
      } else {
        callback([]);
      }
    });

    return () => {
      this.listenersCount--;
      if (this.listenersCount === 0) {
        off(waiversRef);
      }
    };
  }
}
