import { ModmailStatus } from '@prisma/client';
import { UserError, container } from '@sapphire/framework';

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

	public async setChannel(modmailId: number, channelId: string) {
		const modmailData = await container.db.modmail.update({
			where: {
				id: modmailId
			},
			data: {
				channelId
			}
		});

		if (modmailData) return modmailData;
		throw new UserError({ message: 'Modmail doesnt exist', identifier: 'NoModmail' });
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

		return channel;
	}
}
