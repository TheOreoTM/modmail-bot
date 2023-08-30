import { ApplyOptions } from '@sapphire/decorators';
import { isDMChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { Message } from 'discord.js';
import { AssistantEvents } from '../lib/constants';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.MessageCreate })
export class UserEvent extends Listener {
	public override run(message: Message) {
		console.log('hi');
		if (!isDMChannel(message.channel)) return;
		if (message.guild) return;
		if (message.member) return;

		return this.container.client.emit(AssistantEvents.ModmailCreate, message);
	}
}
