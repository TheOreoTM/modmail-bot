import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailColors, ModmailDirection } from '#constants';
import { AttachmentBuilder, EmbedBuilder, Message } from 'discord.js';
import { fetchUser } from '#lib/utils';
import { ModmailTransmission } from '#lib/types';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.ModmailMessageCreate })
export class UserEvent extends Listener {
	public override async run(message: Message, data: ModmailTransmission) {
		const { direction, channel, modmail } = data;

		if (direction !== ModmailDirection.ToUser) return;

		const toUserEmbed = new EmbedBuilder();
		const user = await fetchUser(modmail.userId);

		toUserEmbed
			.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ forceStatic: true }) })
			.setDescription(message.content.length ? message.content : 'Nothing...')
			.setColor(ModmailColors.Receive);

		if (message.attachments.size) {
			toUserEmbed.setFooter({ text: 'Images sent with this message are below.' });
		}

		message.content.length
			? await user.send({ embeds: [toUserEmbed] }).catch(() => {
					return channel.send(`❌ I cant DM the user. Do they have their DMs off?`);
			  })
			: null;

		if (message.attachments.size) {
			const attachmentEmbeds: EmbedBuilder[] = [];
			const attachmentFiles: AttachmentBuilder[] = [];
			let attachmentNum = 1;
			message.attachments.forEach((attachment, index) => {
				const file = new AttachmentBuilder(attachment.url, { name: `${index}.png` });

				attachmentEmbeds.push(
					new EmbedBuilder()
						.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ forceStatic: true }) })
						.setImage(`attachment://${index}.png`)
						.setColor(ModmailColors.Receive)
				);

				attachmentFiles.push(file);

				attachmentNum++;
			});

			user.send({ embeds: attachmentEmbeds, files: attachmentFiles });
		}
	}
}
