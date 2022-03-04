// Load .env if available
import dotenv from "dotenv";
dotenv.config();

import { Snowflake } from "discord.js";
import { getEnvVar } from "../util/env";
import { readFileSync } from "fs";
export interface Config {
  bot: Bot;
  gitlab: GitLab;
}

export interface Bot {
  nickname: string;
  owners: Snowflake[];
}

export interface GitLab {
  projectId: number;
  host: string;
}

const config: Config = JSON.parse(
  readFileSync(getEnvVar("CONFIG_FILE", "Config File", false) || "./config.json", "utf-8")
);

export default config;
