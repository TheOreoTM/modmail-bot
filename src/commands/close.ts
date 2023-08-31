import { Modmail } from '#lib/classes/Modmail';
import { fetchChannel, fetchUser, sendFailEmbed, sendStateEmbed } from '#lib/utils';
import { ModmailStatus } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { isDMChannel } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { TextChannel, type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Close the modmail channel',
	preconditions: ['StaffOnly']
})
export class UserCommand extends Command {
	public override async messageRun(message: Message) {
		const modmailManager = new Modmail();
		const isModmailChannel = await modmailManager.isModlogChannel(message.channel.id);
		const isDM = isDMChannel(message.channel);

		const isModmail = isDM || isModmailChannel;

		if (!isModmail) {
			return sendFailEmbed(message, 'This channel isnt a modmail channel');
		}

		const modmail = isDM ? await modmailManager.get({ userId: message.channelId }) : await modmailManager.get({ channelId: message.channel.id });

		if (modmail && modmail.status && modmail.status === 'CLOSED') {
			return sendFailEmbed(message, `This modmail is already closed`);
		}

		if (!modmail || !modmail.channelId) {
			return sendFailEmbed(message, 'I cant find this modmail in the database');
		}

		const user = await fetchUser(modmail.userId);
		const channel = (await fetchChannel(modmail.channelId)) as TextChannel;

		modmailManager.setState(modmail.id, ModmailStatus.CLOSED).then(async () => {
			await sendStateEmbed(user, ModmailStatus.CLOSED);
			await sendStateEmbed(channel, ModmailStatus.CLOSED);
		});
	}
}
