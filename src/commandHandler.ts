

import { setUser } from "./config";
import {getAllUsers, deleteUsers, createUser, getUserByName} from "./lib/db/queries/users"
import { readConfig } from "./config";

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
