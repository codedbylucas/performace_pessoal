import { db } from "../db";
import { getToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "";

export async function syncData() {
  const token = getToken();
  if (!token) return;

  try {
    const user = await db.users.toCollection().first();
    if (!user) return;

    const lastVersion = user.last_synced || 0;

    // 1. Pull changes from server
    const pullResponse = await fetch(`${API_URL}/api/sync/pull?last_version=${lastVersion}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { changes } = await pullResponse.json();

    for (const change of changes) {
      const { table_name, data } = change;
      const parsedData = JSON.parse(data);
      await (db as any)[table_name].put(parsedData);
    }

    // 2. Push local changes to server
    const tables = ['dailyLogs', 'meals', 'workouts', 'studySessions', 'tasks'];
    const pushChanges: any[] = [];

    for (const table of tables) {
      const unsynced = await (db as any)[table].where('last_synced').below(lastVersion).or('last_synced').equals(undefined).toArray();
      for (const item of unsynced) {
        pushChanges.push({ id: item.server_id || item.id, table, data: item });
      }
    }

    if (pushChanges.length > 0) {
      const pushResponse = await fetch(`${API_URL}/api/sync/push`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ changes: pushChanges })
      });
      const { timestamp } = await pushResponse.json();
      
      // Update local last_synced
      await db.users.update(user.id!, { last_synced: timestamp });
      for (const table of tables) {
        await (db as any)[table].toCollection().modify({ last_synced: timestamp });
      }
    }

  } catch (e) {
    console.error("Sync failed:", e);
  }
}
