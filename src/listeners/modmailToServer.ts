import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailColors, ModmailDirection } from '#constants';
import { AttachmentBuilder, EmbedBuilder, Message } from 'discord.js';
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
			.setDescription(message.content.length ? message.content : 'Nothing...')
			.setColor(ModmailColors.Receive);

		if (message.attachments.size) {
			toServerEmbed.setFooter({ text: 'Images sent with this message are below.' });
		}

		message.content.length ? channel.send({ embeds: [toServerEmbed] }) : null;

		if (message.attachments.size) {
			const attachmentEmbeds: EmbedBuilder[] = [];
			const attachmentFiles: AttachmentBuilder[] = [];
			message.attachments.forEach((attachment, index) => {
				const file = new AttachmentBuilder(attachment.url, { name: `${index}.png` });

				attachmentEmbeds.push(
					new EmbedBuilder()
						.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ forceStatic: true }) })
						.setImage(`attachment://${index}.png`)
						.setColor(ModmailColors.Receive)
				);

				attachmentFiles.push(file);
			});

			channel.send({ embeds: attachmentEmbeds, files: attachmentFiles });
		}
	}
}
