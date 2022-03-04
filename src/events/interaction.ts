import { Client, Interaction, Message } from "discord.js";

export function onInteraction(client: Client, interaction: Interaction) {
  if (interaction.isButton()) {
    if (interaction.customId === "hide") {
      (interaction.message as Message).delete();
    }
  }
}
