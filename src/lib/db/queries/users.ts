import { db } from "..";
import { users, feeds , feedFollows, posts } from "../schema";
import { eq, and, sql, asc, desc } from "drizzle-orm";
import { fetchFeed } from "../../rss";

export type FeedRow = typeof feeds.$inferSelect;
 
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

 export async function markFeedFetched(feedUrl: string) {
  const [feed] = await db
    .select({ id: feeds.id })
    .from(feeds)
    .where(eq(feeds.url, feedUrl))
    .limit(1);

  if (!feed) {
    throw new Error(`Feed with URL "${feedUrl}" not found`);
  }
  const now = new Date();

  await db
    .update(feeds)
    .set({
      lastFetchAt: now,
      updatedAt: now,
    })
    .where(eq(feeds.id, feed.id));
}
  
 export async function getNextFeedToFetch(): Promise<FeedRow | null> {
  const [row] = await db
    .select()
    .from(feeds)
    .orderBy(
      
      sql`${feeds.lastFetchAt} ASC NULLS FIRST`,
      asc(feeds.id)
    )
    .limit(1);

  return row ?? null;
}

export async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();
  if (!feed || !feed.url) return;

  await markFeedFetched(feed.url);

  const parsed = await fetchFeed(feed.url);
  const items = parsed.channel.item;

  for (const item of items) {
    try {
     
      const publishedAt = new Date(item.pubDate);
      
   
      if (isNaN(publishedAt.getTime())) {
        console.warn(`Invalid date format for post: ${item.title}`);
        continue;
      }

     
      await createPost(
        item.title,
        item.link,
        item.description,
        publishedAt,
        feed.id
      );
      
      console.log(`Saved: ${item.title}`);
     } catch (error) {
      if (error instanceof Error && (error.message?.includes('duplicate') || error.message?.includes('unique'))) {
        console.log(`Skipped duplicate: ${item.title}`);
      } else {
        console.error(`Failed to save post: ${item.title}`, error instanceof Error ? error.message : String(error));
      }
    }
  }
}



export async function createPost(title: string, url: string, description: string, publishedAt: Date, feedId: string) {
  const [result] = await db
    .insert(posts)
    .values({ title, url, description, publishedAt, feedId })
    .returning();
  return result; 
}
export async function getPostsForUser(userId: string, limit: number = 20) {
  const row = await db
  .select({
    id: posts.id,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    title: posts.title,
    url: posts.url,
    description: posts.description,
    publishedAt: posts.publishedAt,
    feedId: posts.feedId,
    feedName: feeds.name,
    userName: users.name
  })
  .from(posts)
  .innerJoin(feeds, eq(posts.feedId, feeds.id))
  .innerJoin(users, eq(feeds.userId, users.id))
  .where(eq(users.id, userId))
  .orderBy(desc(posts.publishedAt))
  .limit(limit);
  return row;
}