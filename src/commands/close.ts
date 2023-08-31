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
		console.log('🚀 ~ file: close.ts:14 ~ UserCommand ~ overridemessageRun ~ isModmailChannel:', isModmailChannel);
		const isDM = isDMChannel(message.channel);
		console.log('🚀 ~ file: close.ts:16 ~ UserCommand ~ overridemessageRun ~ isDM:', isDM);

		const isModmail = isDM || isModmailChannel;

		if (!isModmail) {
			return;
		}

		const modmail = isDM ? modmailManager.get({ userId: message.channelId }) : modmailManager.get({ channelId: message.channel.id });
		console.log('🚀 ~ file: close.ts:24 ~ UserCommand ~ overridemessageRun ~ modmail:', modmail);

		message.channel.send({ content: `\`\`\`json\n${JSON.stringify(modmail, null, 2)}\`\`\`` });
	}
}
