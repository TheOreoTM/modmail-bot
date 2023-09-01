import { Modmail } from '#lib/classes/Modmail';
import { ModmailColors } from '#lib/constants';
import { sendFailEmbed, fetchUser, fetchChannel, sendStateEmbed, wait } from '#lib/utils';
import { ModmailStatus } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { isDMChannel } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, type Message, type TextChannel } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'A basic command'
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

		const modmail = isDM ? await modmailManager.get({ userId: message.author.id }) : await modmailManager.get({ channelId: message.channel.id });

		if (modmail && modmail.status && modmail.status === 'DELETED') {
			return sendFailEmbed(message, `This modmail is already deleted`);
		}

		if (!modmail || !modmail.channelId) {
			return sendFailEmbed(message, 'I cant find this modmail in the database');
		}

		const user = await fetchUser(modmail.userId);
		const channel = (await fetchChannel(modmail.channelId)) as TextChannel;

		modmailManager.setState(modmail.id, ModmailStatus.DELETED).then(async () => {
			await sendStateEmbed(user, ModmailStatus.DELETED);
			await sendStateEmbed(channel, ModmailStatus.DELETED);
		});

		await channel.send({ embeds: [new EmbedBuilder().setColor(ModmailColors.DELETED).setDescription('Deleting this channel in 5 seconds')] });

		await wait(5000);

		if (channel.deletable) {
			return await channel.delete();
		} else {
			return await sendFailEmbed(message, 'I cant delete this channel');
		}
	}
}
