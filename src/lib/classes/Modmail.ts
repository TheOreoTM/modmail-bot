import { ModmailConfig } from '#lib/constants';
import { ModmailData } from '#lib/types';
import { fetchMainServer, fetchModmailCategory } from '#lib/utils';
import { ModmailStatus } from '@prisma/client';
import { UserError, container } from '@sapphire/framework';
import { ChannelType, PermissionFlagsBits, TextChannel, User } from 'discord.js';

export class Modmail {
	public async create({ userId, channelId }: { userId: string; channelId?: string }) {
		const modmailData = await container.db.modmail.create({
			data: {
				userId,
				channelId,
				status: ModmailStatus.ONGOING
			}
		});

		return modmailData;
	}

	public async get(userId: string) {
		const modmailData = await container.db.modmail.findFirst({
			where: {
				userId,
				status: ModmailStatus.ONGOING
			}
		});

		return modmailData;
	}

	public async delete({ userId, modmailId }: { userId?: string; modmailId?: number }) {
		if (!userId && !modmailId) {
			throw new Error(`Specify one argument for Modmail.delete() either userId or modmailId`);
		}

		if (userId) {
			await container.db.modmail
				.deleteMany({
					where: {
						userId
					}
				})
				.catch(null);
		}

		if (modmailId) {
			await container.db.modmail
				.delete({
					where: {
						id: modmailId
					}
				})
				.catch(null);
		}
	}

	public async existsFor(userId: string) {
		const modmailData = await this.get(userId);

		return modmailData ? true : false;
	}

	public async createChannel({ user, modmail }: CreateChannelInput) {
		const guild = await fetchMainServer();
		const category = await fetchModmailCategory();

		const channel = await guild.channels.create({
			name: `${user.username}-${modmail.id.toString().padStart(4, '0')}`,
			type: ChannelType.GuildText,
			parent: category,
			permissionOverwrites: [
				{
					id: guild.id,
					deny: [PermissionFlagsBits.ViewChannel]
				},
				{
					id: ModmailConfig.handlerRole,
					allow: ['ViewChannel', 'SendMessages', 'AttachFiles']
				}
			],
			position: 0,
			topic: `Modmail for ${user.username} (\`${user.id}\`)`
		});

		return channel;
	}

	public async setChannel(modmailId: number, channelId: string) {
		const modmailData = await container.db.modmail.update({
			where: {
				id: modmailId
			},
			data: {
				channelId
			}
		});

		if (!modmailData) throw new UserError({ message: 'Modmail doesnt exist', identifier: 'NoModmail' });

		return this.getChannel(modmailData.id);
	}

	public async getChannel(modmailId: number) {
		const modmailData = await container.db.modmail.findUnique({
			where: {
				id: modmailId
			}
		});

		if (!modmailData) throw new UserError({ message: 'Modmail doesnt exist', identifier: 'NoModmail' });

		const channelId = modmailData.channelId;

		if (!channelId) throw new UserError({ message: 'Modmail channel doesnt exist', identifier: 'NoModmailChannel' });

		const channel = container.client.channels.cache.get(channelId) ?? (await container.client.channels.fetch(channelId));

		if (!channel) throw new UserError({ message: 'Modmail channel doesnt exist', identifier: 'NoModmailChannel' });

		return channel as TextChannel;
	}
}

type CreateChannelInput = {
	user: User;
	modmail: ModmailData;
};
