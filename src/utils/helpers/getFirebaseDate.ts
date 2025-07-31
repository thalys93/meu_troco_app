import { FirebaseTimestamp } from "@/types/Firebase"

/**
 * Converte um FirebaseTimestamp para um objeto Date do JS
 * @param timestamp - Um objeto com segundos e nanosegundos
 * @returns Date
 */
export function firebaseTimestampToDate(timestamp: FirebaseTimestamp): Date {    
    if (!timestamp || typeof timestamp.seconds !== "number") {
        console.error("Invalid FirebaseTimestamp")
        return
    }

    return new Date(timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1_000_000))
}