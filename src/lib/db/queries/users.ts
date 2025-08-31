import { db } from "..";
import { users, feeds , feedFollows } from "../schema";
import { eq, and } from "drizzle-orm";
 
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
export async function getUserById(uuid: string) {
  const [user] = await db
  .select()
  .from(users)
  .where(eq(users.id, uuid));
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

export async function createFeed(name:string, url:string, userId:string) {
  const [result] = await db
    .insert(feeds)
    .values({ name, url, userId })
    .returning();
  return result; 
}
export async function getFeeds() {
  const feed = await db
    .select()
    .from(feeds)
    return feed ?? null;
}

export async function createFeedFollow(feedId:string, userId:string) {
  const [newFeedFollow] = await db
    .insert(feedFollows)
    .values({feedId, userId})
    .returning();
  const [result] = await db
  .select({
    id: feedFollows.id,
    createdAt: feedFollows.createdAt,
    updatedAt: feedFollows.updatedAt,
    userId: feedFollows.userId,
    feedId: feedFollows.feedId,
    feedName: feeds.name,
    userName: users.name,
  })
  
  .from(feedFollows)
  .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
  .innerJoin(users, eq(feedFollows.userId, users.id))
  .where(eq(feedFollows.id, newFeedFollow.id));
  return result; 
}

export async function getFeedByUrl(url: string) {
  const [row] = await db
    .select({
      id: feeds.id,
      name: feeds.name,
      url: feeds.url,
    })
    .from(feeds)
    .where(eq(feeds.url, url));

  return row ?? null;
}


export async function getFeedFollowsForUser(user: string) {
const row = await db
.select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      user: feedFollows.userId,
      feed: feedFollows.feedId,
      feedName: feeds.name,
      userName: users.name
    
    })
.from(feedFollows)
.innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
.innerJoin(users, eq(feedFollows.userId, users.id))
.where(eq(feedFollows.userId, user));
return row

}



export async function deleteFeedFollow(userId: string, feedUrl: string) {

  const [feed] = await db
    .select({ id: feeds.id })
    .from(feeds)
    .where(eq(feeds.url, feedUrl))
    .limit(1);

  if (!feed) {
    throw new Error(`Feed with URL "${feedUrl}" not found`);
  }

  const [deleted] = await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)))
    .returning();

  if (!deleted) {
    throw new Error(`User ${userId} is not following feed "${feedUrl}"`);
  }

 } 
