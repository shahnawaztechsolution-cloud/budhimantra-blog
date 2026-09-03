import { db } from "./src/db/index.js";
import { articles } from "./src/db/schema.js";
import { inArray } from "drizzle-orm";

async function run() {
  await db.delete(articles).where(inArray(articles.id, [2, 4, 7]));
  console.log("Deleted IDs 2, 4, 7");
  process.exit(0);
}
run();
