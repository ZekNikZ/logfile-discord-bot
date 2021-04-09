Wacode discord bot

Registration channel
 => type in email address; bot sends DM to confirm or change it

Commands
 => !team create <name> <bracket:novice|expert>
 => !team disband <name|id|@mention>
 => !team join <name|id|@mention> <@mention...>
 => !team leave <name|id|@mention> <@mention...>

 => !team settings name <name|id|@mention> <new name>
 => !team settings bracket <name|id|@mention> <bracket:novice|expert>

 => !team channels add <"text"|"voice"> <name>
 => !team channels remove <name|#id>
 => !team channels reset <team name|id|@mention>

 => !channel add <"text"|"voice"> <name|#id> <perm-str>
 => !channel remove <name|#id>
 => !channel reset <team name|id|@mention>

 => !sponsor create <name>
 => !sponsor disband <name|id|@mention>
 => !sponsor join <name|id|@mention> <@mention>
 => !sponsor leave <name|id|@mention> <@mention>

 => !event state <time-enum>

// Have calendar management, perhaps through bot if time?

Team category settings
[
  {
    type: text|voice
    name-template: %s-general
    perm: {
      role: time,
      ...
    }
  }
]

roles:
 team
 staff
 sponsor
 participant
 all

times:
 before
 during
 judging
 after