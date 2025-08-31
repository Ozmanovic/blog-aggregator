import { setUser } from "./config";
import {
  getFeedFollowsForUser,
  getFeedByUrl,
  createFeedFollow,
  getFeeds,
  getAllUsers,
  deleteUsers,
  createUser,
  getUserByName,
  createFeed,
  getUserById,
  deleteFeedFollow,
  scrapeFeeds,
  getPostsForUser,
} from "./lib/db/queries/users";
import { readConfig } from "./config";
import { fetchFeed } from "./lib/rss";
import { Feed, User } from "./lib/db/schema";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error(
      "The login handler expects a single argument, the username"
    );
  }
  if (!(await getUserByName(args[0]))) {
    throw new Error(`User ${args[0]} does not exist`);
  }
  setUser(args[0]);
  console.log(`User:${args[0]} has been set`);
}

export async function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
) {
  registry[cmdName] = handler;
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) {
  if (cmdName in registry) {
    await registry[cmdName](cmdName, ...args);
  } else {
    throw new Error(`Unknown command: ${cmdName}`);
  }
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error("register requires a username");
  }
  if (await getUserByName(args[0])) {
    throw new Error(`User ${args[0]} already exists`);
  }
  const user = await createUser(args[0]);
  setUser(args[0]);
  console.log(`Created user "${args[0]}"`);
  console.log(user);
}
export async function reset() {
  try {
    const deleted = await deleteUsers();

    console.log(`Reset successful. Deleted ${deleted.length} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Reset failed:", error);
    process.exit(1);
  }
}
export async function users() {
  try {
    const users = await getAllUsers();
    for (const user of users) {
      const config = readConfig();
      if (user.name === config.currentUserName) {
        console.log(`* ${user.name} (current)`);
      } else {
        console.log(`* ${user.name}`);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
export async function handlerAgg(cmdName: string, time_between_reqs: string) {
  if (!time_between_reqs) {
    throw new Error("time_between_reqs argument required (e.g. 10s, 1m, 1h)");
  }

  const intervalMs = parseDuration(time_between_reqs);
  console.log(`Collecting feeds every ${time_between_reqs}`);

  
  scrapeFeeds();

  const interval = setInterval(() => {
    scrapeFeeds();
  }, intervalMs);


  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export async function addFeed(cmdName: string, user: User, ...args: string[]) {
  const name = args[0];
  const url  = args[1];

  if (!name || !url) {
    throw new Error("Error: missing either name, url or both");
  }

  const result = await createFeed(name, url, user.id);
  const follow = await createFeedFollow(result.id, user.id);
  await printFeed(result, user);
  console.log(follow.feedName, follow.userName);
}

async function printFeed(feed: Feed, user: User) {
  console.log(feed.name);
  console.log(feed.url);
  console.log(feed.id);
  console.log(user.name);
}
export async function feeds() {
  const feeds = await getFeeds();
  for (const feed of feeds) {
    const userId = await getUserById(feed.userId);
    if (!userId) {
      throw new Error("User id doesn't exist.");
    }
    console.log(feed.name);
    console.log(feed.url);
    console.log(userId.name);
  }
}
export async function follow(cmdName: string, user: User, ...args: string[]) {
  const url = args[0];
  if (!url) {
    throw new Error("follow requires a feed url");
  }

  const urlExists = await getFeedByUrl(url);
  if (urlExists !== null) {
    const result = await createFeedFollow(urlExists.id, user.id);
    console.log(result.userName);
    console.log(result.feedName);
  } else {
    throw new Error("Url doesnt exist.");
  }
}

export async function following(cmdName: string, user: User) {
  const follows = await getFeedFollowsForUser(user.id);
  for (const feed of follows) {
    console.log(feed.feedName);
  }
}
export async function unfollow(cmdName: string, user: User, ...args: string[] ) {
const url = args[0]
 await deleteFeedFollow(user.id, url)

}


export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
   
    const config = readConfig();
    const username = config.currentUserName?.trim();

   
    if (!username) {
      throw new Error("No current user found. Please register/login first.");
    }
    const user = await getUserByName(username);
    if (!user) {
      throw new Error(`User ${username} not found`);
    }

    await handler(cmdName, user, ...args);
  };
}
export async function browse(cmdName: string, user: User) {
  const posts = await getPostsForUser(user.id);
  for (const post of posts) {
    console.log(post.title);
    console.log(post.url);
    console.log(post.description);
    console.log(post.publishedAt);
    console.log(post.feedName);
  }
}


function parseDuration(durationStr: string): number {
  const match = durationStr.match(/^(\d+)(ms|s|m|h)$/);
  if (!match) throw new Error("Invalid duration");

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === "ms") return value;
  if (unit === "s") return value * 1000;
  if (unit === "m") return value * 60_000;
  if (unit === "h") return value * 60 * 60_000;

  throw new Error("Invalid duration unit");
}


