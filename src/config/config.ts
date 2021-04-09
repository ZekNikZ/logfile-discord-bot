import { Snowflake } from 'discord.js';
import { getEnvVar } from '../util/env';
import { readFileSync } from 'fs';
export interface Config {
    bot: Bot;
    roles: Roles;
    registration: Registration;
    channels: Channels;
}

export interface Bot {
    nickname: string;
    owners: Snowflake[];
}

export interface Roles {
    firstJoin: Snowflake;
    registered: Snowflake[];
}

export interface Registration {
    channel: Snowflake;
}

export interface Channels {
    sponsor: ChannelInfo[];
    team: ChannelInfo[];
}

export interface ChannelInfo {
    name: string;
    type: 'text' | 'voice';
    visibility?: RoleGroup[];
}

export type RoleGroup =
    | 'staff'
    | 'sponsor'
    | 'participant'
    | 'judge'
    | 'sponsor-team'
    | 'team';

export const DEFAULT_GROUPS: RoleGroup[] = [
    'staff',
    'sponsor',
    'participant',
    'judge',
];

const config: Config = JSON.parse(
    readFileSync(
        getEnvVar('CONFIG_FILE', 'Config File', false) || './config.json',
        'utf-8'
    )
);

export default config;
