import Dexie, { type Table } from "dexie"

export interface SavedRoute {
  id?: number
  origin: string
  destination: string
  mode: string
  duration: number
  distance: number
  score: number
  co2Saved: number
  savedAt: Date
  synced: boolean
}

export interface UserAction {
  id?: number
  type: "rate" | "save" | "share"
  routeId: string
  timestamp: Date
  synced: boolean
}

class SuperRouteDB extends Dexie {
  routes!: Table<SavedRoute>
  actions!: Table<UserAction>

  constructor() {
    super("SuperRouteDB")
    this.version(1).stores({
      routes: "++id, origin, destination, savedAt, synced",
      actions: "++id, type, timestamp, synced",
    })
  }
}

export const db = new SuperRouteDB()

export async function saveRouteOffline(route: Omit<SavedRoute, "id" | "savedAt" | "synced">) {
  return db.routes.add({
    ...route,
    savedAt: new Date(),
    synced: false,
  })
}

export async function getOfflineRoutes(): Promise<SavedRoute[]> {
  return db.routes.orderBy("savedAt").reverse().toArray()
}

export async function syncOfflineData() {
  const unsyncedRoutes = await db.routes.where("synced").equals(0).toArray()
  const unsyncedActions = await db.actions.where("synced").equals(0).toArray()

  console.log(`Syncing ${unsyncedRoutes.length} routes and ${unsyncedActions.length} actions`)

  await db.routes.bulkUpdate(
    unsyncedRoutes.map((r) => ({ key: r.id!, changes: { synced: true } })),
  )
  await db.actions.bulkUpdate(
    unsyncedActions.map((a) => ({ key: a.id!, changes: { synced: true } })),
  )
}
