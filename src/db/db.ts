import AppDB from "./app-db";

// Ensure the database is properly versioned for tags
const db = new AppDB();

// Add version 2 with tags field if not already done
if (db.verno < 2) {
  db.version(2).stores({
    loops: "++id, videoId, loopName, *tags", // Added tags index
  }).upgrade(tx => {
    // Add tags field to existing records
    return tx.table("loops").toCollection().modify(loop => {
      if (!loop.tags) loop.tags = [];
    });
  });
}

export { db };
