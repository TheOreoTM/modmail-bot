import {
	container,
	type ChatInputCommandSuccessPayload,
	type Command,
	type ContextMenuCommandSuccessPayload,
	type MessageCommandSuccessPayload,
	UserError
} from '@sapphire/framework';
import { cyan } from 'colorette';
import { APIUser, CategoryChannel, EmbedBuilder, Guild, GuildBasedChannel, Message, TextChannel, User } from 'discord.js';
import { AssistantColors, AssistantEmojis, ModmailConfig, ModmailStateEmojis } from '#constants';
import { Nullish } from '@sapphire/utilities';
import { ModmailData } from './types';
import { ModmailStatus } from '@prisma/client';

export async function sendStateEmbed(target: TextChannel | User, modmail: ModmailData) {
	const state: ModmailStatus = modmail.status;

	target.send({
		embeds: [
			new EmbedBuilder()
				.setColor(AssistantColors.Info)
				.setDescription(`${ModmailStateEmojis[state]} This modmail has been marked as \`${state.toLowerCase()}\``)
		]
	});
}

export async function sendFailEmbed(message: Message, description: string) {
	message.channel.send({ embeds: [new EmbedBuilder().setDescription(`${AssistantEmojis.Fail} ${description}`).setColor(AssistantColors.Fail)] });
}

export async function sendSuccessEmbed(message: Message, description: string) {
	message.channel.send({ embeds: [new EmbedBuilder().setDescription(`${AssistantEmojis.Fail} ${description}`).setColor(AssistantColors.Success)] });
}

export async function fetchChannel(channelId: string) {
	return (
		container.client.channels.cache.get(channelId) ??
		(await container.client.channels.fetch(channelId, {
			cache: true
		}))
	);
}

export async function fetchUser(userId: string) {
	return (
		container.client.users.cache.get(userId) ??
		(await container.client.users.fetch(userId, {
			cache: true
		}))
	);
}

export async function fetchMember(memberId: string) {
	const guild = await fetchMainServer();
	return guild.members.cache.get(memberId) ?? (await guild.members.fetch(memberId));
}

export async function fetchMainServer() {
	let guild: Guild | Nullish = container.client.guilds.cache.get(ModmailConfig.server);
	guild ??= await container.client.guilds.fetch(ModmailConfig.server);

	if (!guild) throw new UserError({ message: 'No guild found', identifier: 'NoGuild' });

	return guild;
}

export async function fetchModmailCategory() {
	const guild = await fetchMainServer();

	let modmailCategory: GuildBasedChannel | Nullish = guild.channels.cache.get(ModmailConfig.category);
	modmailCategory ??= await guild.channels.fetch(ModmailConfig.category);

	if (!modmailCategory || !(modmailCategory instanceof CategoryChannel))
		throw new UserError({ message: 'No modmail category found', identifier: 'NoCategory' });

	return modmailCategory as CategoryChannel;
}

export function logSuccessCommand(payload: ContextMenuCommandSuccessPayload | ChatInputCommandSuccessPayload | MessageCommandSuccessPayload): void {
	let successLoggerData: ReturnType<typeof getSuccessLoggerData>;

	if ('interaction' in payload) {
		successLoggerData = getSuccessLoggerData(payload.interaction.guild, payload.interaction.user, payload.command);
	} else {
		successLoggerData = getSuccessLoggerData(payload.message.guild, payload.message.author, payload.command);
	}

	container.logger.debug(`${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`);
}

export function getSuccessLoggerData(guild: Guild | null, user: User, command: Command) {
	const shard = getShardInfo(guild?.shardId ?? 0);
	const commandName = getCommandInfo(command);
	const author = getAuthorInfo(user);
	const sentAt = getGuildInfo(guild);

	return { shard, commandName, author, sentAt };
}

function getShardInfo(id: number) {
	return `[${cyan(id.toString())}]`;
}

function getCommandInfo(command: Command) {
	return cyan(command.name);
}

function getAuthorInfo(author: User | APIUser) {
	return `${author.username}[${cyan(author.id)}]`;
}

function getGuildInfo(guild: Guild | null) {
	if (guild === null) return 'Direct Messages';
	return `${guild.name}[${cyan(guild.id)}]`;
}
