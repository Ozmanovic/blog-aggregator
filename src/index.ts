import {browse, unfollow, middlewareLoggedIn, following, follow, feeds, addFeed, handlerAgg, users, reset, handlerRegister ,handlerLogin, registerCommand, runCommand, type CommandsRegistry, } from "./commandHandler.js";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister)
  registerCommand(registry, "reset", reset)
  registerCommand(registry, "users", users)
  registerCommand(registry, "agg", handlerAgg)
  registerCommand(registry, "addfeed", middlewareLoggedIn(addFeed))
  registerCommand(registry, "feeds", feeds)
  registerCommand(registry, "follow", middlewareLoggedIn(follow))
  registerCommand(registry, "following", middlewareLoggedIn(following))
  registerCommand(registry, "unfollow", middlewareLoggedIn(unfollow))
  registerCommand(registry, "browse", middlewareLoggedIn(browse))


  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("not enough arguments");
    process.exit(1);
  }

  const command = args[0];
  const restArgs = args.slice(1);

  try {
    await runCommand(registry, command, ...restArgs);
  } catch (err) {
    console.error(String(err));
    process.exit(1);
  }
  process.exit(0)
}


main();