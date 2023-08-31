import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailColors, ModmailDirection } from '#constants';
import { EmbedBuilder, Message } from 'discord.js';
import { ModmailTransmission } from '#lib/types';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.ModmailSendMessage })
export class UserEvent extends Listener {
	public override run(message: Message, data: ModmailTransmission) {
		const { direction, firstTime, channel } = data;

		if (direction !== ModmailDirection.ToServer) return;

		const toServerEmbed = new EmbedBuilder();

		if (firstTime) {
			const embed = new EmbedBuilder();
			embed.setTitle('Modmail recieved').addFields({
				name: 'User',
				value: `<@${message.author.id}>`
			});

			channel.send({ embeds: [embed] });
		}

		toServerEmbed
			.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ forceStatic: true }) })
			.setDescription(message.content)
			.setColor(ModmailColors.Receive);

		channel.send({ embeds: [toServerEmbed] });

		if (message.attachments.size) {
			let attachmentNum = 1;
			message.attachments.forEach((attachment) => {
				channel.send({ embeds: [new EmbedBuilder().setThumbnail(attachment.proxyURL).setAuthor({ name: `Attachment ${attachmentNum}` })] });
				attachmentNum++;
			});
		}
	}
}
