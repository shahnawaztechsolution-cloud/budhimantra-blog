import { db } from "./src/db/index.js";
import { articles } from "./src/db/schema.js";
import { inArray, desc } from "drizzle-orm";

async function run() {
  const all = await db.select({ id: articles.id, title: articles.title, createdDate: articles.createdDate }).from(articles).orderBy(desc(articles.createdDate));
  console.log("Found articles:", all);
  
  // Find titles with "किला" or just generic duplicates
  const toDelete = [];
  const seen = new Set();
  for (let i = all.length - 1; i >= 0; i--) {
      // iterate from oldest to newest. First one is kept, subsequent are deleted.
      if (seen.has(all[i].title)) {
          toDelete.push(all[i].id);
      } else {
          seen.add(all[i].title);
      }
  }
  
  if (toDelete.length > 0) {
      console.log("Deleting duplicate IDs:", toDelete);
      await db.delete(articles).where(inArray(articles.id, toDelete));
      console.log("Deleted!");
  } else {
      console.log("No duplicates found by exact title. Looking for 'किला' related...");
      const forts = all.filter(a => a.title.includes("किला") || a.title.includes("Fort"));
      console.log("Fort articles:", forts);
      if (forts.length > 1) {
          const idsToDelete = forts.slice(0, forts.length - 1).map(f => f.id);
          console.log("Deleting extra fort articles:", idsToDelete);
          await db.delete(articles).where(inArray(articles.id, idsToDelete));
          console.log("Deleted extra forts!");
      }
  }
  process.exit(0);
}
run();
