import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { AssistantEvents } from '#constants';

export class UserEvent extends Listener<typeof AssistantEvents.MentionPrefixOnly> {
	public override async run(message: Message) {
		const prefix = this.container.client.options.defaultPrefix;
		return message.channel.send(prefix ? `My prefix in this guild is: \`${prefix}\`` : 'Cannot find any Prefix for Message Commands.');
	}
}
