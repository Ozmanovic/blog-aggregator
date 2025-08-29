

import { setUser } from "./config";
import {getFeeds, getAllUsers, deleteUsers, createUser, getUserByName, createFeed, getUserById} from "./lib/db/queries/users"
import { readConfig } from "./config";
import { fetchFeed } from "./lib/rss";
import {Feed, User} from "./lib/db/schema"

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>


export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("The login handler expects a single argument, the username")
    }
    if (!await getUserByName(args[0])) {
        throw new Error(`User ${args[0]} does not exist`)
    }
    setUser(args[0])
    console.log(`User:${args[0]} has been set`)
}

export async function  registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
     registry[cmdName] = handler
}


export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    if (cmdName in registry) {
        await registry[cmdName](cmdName, ...args)
    }
    else {
        throw new Error(`Unknown command: ${cmdName}`)
    }
}


export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("register requires a username")
    }
    if (await getUserByName(args[0])) {
        throw new Error(`User ${args[0]} already exists`)
    }
      const user = await createUser(args[0])  
      setUser(args[0])  
      console.log(`Created user "${args[0]}"`);
      console.log(user)
    
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
    const users = await getAllUsers()
    for (const user of users) {
        const config = readConfig()
        if (user.name === config.currentUserName) {
            console.log(`* ${user.name} (current)`)
        }
        else{
        console.log(`* ${user.name}`)
        }
    }
  } catch (error) {
    console.log(error)
  }
}
export async function handlerAgg(cmdName: string, ...args: string[]) {
  const urlie = args[0]
  const rssFeed = await fetchFeed("https://www.wagslane.dev/index.xml")
  const json = JSON.stringify(rssFeed, null, 2);
  console.log(json)
  }

export async function addFeed(cmdName: string, ...args: string[]) {
  const name = args[0]
  const url = args[1]
  if (!name || !url) {
    throw new Error("Error: missing either name, url or both")
  }
  const config = readConfig()
  const username = config.currentUserName?.trim();
  if (!username || username.length === 0) {
    throw new Error("No current user found. Please register/login first.")
  }
  const currentUser = await getUserByName(username)
  const result = await createFeed(name, url, currentUser.id)
  await printFeed(result, currentUser)
  
  }
  async function printFeed(feed: Feed, user: User) {
    console.log(feed.name)
    console.log(feed.url)
    console.log(feed.id)
    console.log(user.name)

  }
  export async function feeds() {
    const feeds = await getFeeds()
    for (const feed of feeds) {
      const userId = await getUserById(feed.userId)
      if (!userId) {
        throw new Error("User id doesn't exist.")
      }
      console.log(feed.name)
      console.log(feed.url)
      console.log(userId.name)
    }
  }
