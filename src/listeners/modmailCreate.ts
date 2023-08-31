import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailDirection } from '#constants';
import { Message } from 'discord.js';
import { Modmail } from '#classes/Modmail';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.ModmailCreate })
export class UserEvent extends Listener {
	public override async run(message: Message) {
		const modmailManager = new Modmail();
		let firstTime = !(await modmailManager.existsFor(message.author.id));
		console.log('🚀 ~ file: modmailCreate.ts:13 ~ UserEvent ~ overriderun ~ firstTime:', firstTime);
		if (firstTime) {
			const channel = await modmailManager.getChannel((await modmailManager.get(message.author.id))!.id).catch(async () => {
				const modmail = (await modmailManager.get(message.author.id))!;
				const channel = await modmailManager.createChannel({ user: message.author, modmail: modmail! });
				await modmailManager.setChannel(modmail.id, channel.id);
			});
			return this.container.client.emit(AssistantEvents.ModmailSendMessage, ModmailDirection.ToServer, firstTime, message, channel);
		}
		firstTime = true;

		const modmail = await modmailManager.create({ userId: message.author.id });

		const channel = await modmailManager.createChannel({ user: message.author, modmail: modmail });

		await modmailManager.setChannel(modmail.id, channel.id);

		return this.container.client.emit(AssistantEvents.ModmailSendMessage, ModmailDirection.ToServer, firstTime, message, channel);
	}
}
