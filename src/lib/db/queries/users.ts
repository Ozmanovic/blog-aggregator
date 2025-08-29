import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";
 
export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}
export async function getUserByName(name: string) {
  const [user] = await db
  .select()
  .from(users)
  .where(eq(users.name, name));
  return user ?? null;
}

export async function deleteUsers() {
   return await db
  .delete(users)
  .returning();
}
export async function getAllUsers() {
  const user = await db
  .select()
  .from(users)
  return user ?? null;
}

