import Discord, { MessageEmbed, MessageEmbedOptions } from 'discord.js';
import createLogger from '../lib/logger';

const log = createLogger('bot');

export async function getDiscordClient(): Promise<Discord.Client> {
  const client = new Discord.Client();
  const token = process.env.DISCORD_BOT_TOKEN;
  await client.login(token);
  log(`logged into discord as ${client.user?.username}`);
  return client;
}

export async function setPresenceOnline(client: Discord.Client, name: string): Promise<Discord.Presence> {
  const { user } = client;

  if (!user) {
    throw new Error('Client is not logged in');
  }

  log(`setting ${user.username}'s status to ${name}`);

  return user.setPresence({
    activity: { name },
    status: 'online',
  });
}

export async function sendEmbedMessage(client: Discord.Client, content: string, embed: MessageEmbedOptions) {
  const { channels } = client;

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId) throw new Error('missing discord channel id');

  const targetChannel = await channels.fetch(channelId);

  if (!targetChannel) throw new Error('target channel is missing or inaccesible');
  if (!targetChannel.isText()) throw new Error('target channel is not a text channel');

  return targetChannel.send({
    content,
    embed: new MessageEmbed(embed),
  });
}
