import fs, { read } from "fs";
import os from "os";
import path from "path";

export type Config = {
    dbUrl: string,
    currentUserName?: string
}

export function setUser(userName: string) {
    const readFile = readConfig()
    readFile["currentUserName"] = userName
    writeConfig(readFile)
 
}
export function readConfig(): Config {
    const thePath = getConfigFilePath()
    const readFile = fs.readFileSync(thePath, { encoding: "utf8" });
    const parsed = JSON.parse(readFile)
    return validateConfig(parsed)
}

function getConfigFilePath(): string {
    const home = os.homedir()
    return path.join(home, '.gatorconfig.json');
}

function writeConfig(cfg: Config): void {
    const thePath = getConfigFilePath()
    const objToWrite = {
        db_url: cfg.dbUrl,
        ...(cfg.currentUserName
      ? { current_user_name: cfg.currentUserName }
      : {}),
  };
    const stringed = JSON.stringify(objToWrite)
    fs.writeFileSync(thePath, stringed, { encoding: "utf8" });
}
function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig?.db_url !== "string") {
    throw new Error("Config validation failed: 'db_url' is required and must be a string.");
  }

  if (
    "current_user_name" in rawConfig &&
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("Config validation failed: 'current_user_name' must be a string if provided.");
  }

  
  return {
    dbUrl: rawConfig.db_url,
    ...(rawConfig.current_user_name
      ? { currentUserName: rawConfig.current_user_name }
      : {}),
  };
}