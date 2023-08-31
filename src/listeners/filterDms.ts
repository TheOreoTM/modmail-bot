import { ApplyOptions } from '@sapphire/decorators';
import { isDMChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { Message } from 'discord.js';
import { AssistantEvents } from '#constants';
import { Modmail } from '#lib/classes/Modmail';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.MessageCreate })
export class UserEvent extends Listener {
	public override async run(message: Message) {
		const isModlogChannel = await new Modmail().isModlogChannel(message.channelId);
		if (!isDMChannel(message.channel) || !isModlogChannel) return;

		return this.container.client.emit(AssistantEvents.ModmailCreate, message);
	}
}
