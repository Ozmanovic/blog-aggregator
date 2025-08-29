import { handlerLogin, registerCommand, runCommand, type CommandsRegistry } from "./commandHandler.js";

function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);

  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("not enough arguments");
    process.exit(1);
  }

  const command = args[0];
  const restArgs = args.slice(1);

  try {
    runCommand(registry, command, ...restArgs);
  } catch (err) {
    console.error(String(err));
    process.exit(1);
  }
}

main();