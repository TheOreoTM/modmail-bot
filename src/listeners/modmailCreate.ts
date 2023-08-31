import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailDirection } from '#constants';
import { Message } from 'discord.js';
import { Modmail } from '#classes/Modmail';
import { ModmailTransmission } from '#lib/types';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.ModmailCreate })
export class UserEvent extends Listener {
	public override async run(message: Message) {
		const modmailManager = new Modmail();
		let firstTime = !(await modmailManager.existsFor(message.author.id));
		if (!firstTime) {
			const modmail = (await modmailManager.get(message.author.id))!;
			const channel = await modmailManager.getChannel((await modmailManager.get(message.author.id))!.id).catch(async () => {
				const channel = await modmailManager.createChannel({ user: message.author, modmail: modmail! });
				return await modmailManager.setChannel(modmail.id, channel.id);
			});
			const data: ModmailTransmission = {
				channel,
				direction: ModmailDirection.ToServer,
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
			direction: ModmailDirection.ToServer,
			firstTime: firstTime,
			modmail: modmail
		};

		return this.container.client.emit(AssistantEvents.ModmailSendMessage, message, data);
	}
}
