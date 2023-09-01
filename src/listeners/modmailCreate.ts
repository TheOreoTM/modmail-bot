import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailDirection } from '#constants';
import { Message, TextChannel } from 'discord.js';
import { Modmail } from '#classes/Modmail';
import { ModmailTransmission } from '#lib/types';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.ModmailCreate })
export class UserEvent extends Listener {
	public override async run(message: Message) {
		const modmailManager = new Modmail();
		const isModlogChannel = await modmailManager.isModlogChannel(message.channelId);

		const shouldCreateChannel = !isModlogChannel;
		console.log('🚀 ~ file: modmailCreate.ts:15 ~ UserEvent ~ overriderun ~ shouldCreateChannel:', shouldCreateChannel);

		let direction: ModmailDirection = ModmailDirection.ToServer;
		if (isModlogChannel) {
			direction = ModmailDirection.ToUser;
		}

		let firstTime = !(await modmailManager.existsFor(message.author.id));
		console.log('🚀 ~ file: modmailCreate.ts:23 ~ UserEvent ~ overriderun ~ firstTime:', firstTime);

		if (shouldCreateChannel) {
			const channel = await modmailManager.getChannel((await modmailManager.get({ userId: message.author.id }))!.id).catch(async () => {
				const channel = await modmailManager.createChannel({ user: message.author, modmail: modmail! });
				return await modmailManager.setChannel(modmail.id, channel.id);
			});

			const data: ModmailTransmission = {
				channel: message.channel as TextChannel,
				direction: ModmailDirection.ToServer,
				firstTime: firstTime,
				modmail: (await modmailManager.get({ channelId: channel.id }))!
			};
			return this.container.client.emit(AssistantEvents.ModmailMessageCreate, message, data);
		}

		if (!firstTime) {
			const modmail = isModlogChannel
				? (await modmailManager.get({ channelId: message.channelId }))!
				: (await modmailManager.get({ userId: message.author.id }))!;

			const channel = await modmailManager.getChannel((await modmailManager.get({ userId: modmail.userId }))!.id).catch(async () => {
				const channel = await modmailManager.createChannel({ user: message.author, modmail: modmail! });
				return await modmailManager.setChannel(modmail.id, channel.id);
			});
			const data: ModmailTransmission = {
				channel,
				direction,
				firstTime: firstTime,
				modmail: modmail
			};

			return this.container.client.emit(AssistantEvents.ModmailSendMessage, message, data);
		}
		firstTime = true;

		const modmail = await modmailManager.create({ userId: message.author.id });

		const channel = await modmailManager.createChannel({ user: message.author, modmail: modmail });

		await modmailManager.setChannel(modmail.id, channel.id);

		const data: ModmailTransmission = {
			channel,
			direction,
			firstTime: firstTime,
			modmail: modmail
		};

		return this.container.client.emit(AssistantEvents.ModmailSendMessage, message, data);
	}
}
