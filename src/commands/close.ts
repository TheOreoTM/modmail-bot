import { Modmail } from '#lib/classes/Modmail';
import { ApplyOptions } from '@sapphire/decorators';
import { isDMChannel } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'A basic command'
})
export class UserCommand extends Command {
	public override async messageRun(message: Message) {
		const modmailManager = new Modmail();
		const isModmailChannel = modmailManager.isModlogChannel(message.channel.id);
		const isDM = isDMChannel(message.channel);

		const isModmail = isDM || isModmailChannel;

		if (!isModmail) {
			return;
		}

		const modmail = isDM ? modmailManager.get({ userId: message.channelId }) : modmailManager.get({ channelId: message.channel.id });

		message.channel.send({ content: `\`\`\`json\n${JSON.stringify(modmail, null, 2)}\`\`\`` });
	}
}
