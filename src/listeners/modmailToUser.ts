import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailColors, ModmailDirection } from '#constants';
import { AttachmentBuilder, EmbedBuilder, Message } from 'discord.js';
import { fetchUser } from '#lib/utils';
import { ModmailTransmission } from '#lib/types';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.ModmailSendMessage })
export class UserEvent extends Listener {
	public override async run(message: Message, data: ModmailTransmission) {
		const { direction, channel, modmail } = data;

		if (direction !== ModmailDirection.ToUser) return;

		const toUserEmbed = new EmbedBuilder();
		const user = await fetchUser(modmail.userId);

		toUserEmbed
			.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ forceStatic: true }) })
			.setDescription(message.content)
			.setColor(ModmailColors.Receive);

		user.send({ embeds: [toUserEmbed] }).catch(async () => {
			return channel.send(`❌ I cant DM the user. Do they have their DMs off?`);
		});

		if (message.attachments.size) {
			let attachmentNum = 1;
			message.attachments.forEach((attachment) => {
				const file = new AttachmentBuilder(attachment.url, { name: 'image.png' });

				user.send({
					files: [file]
				});
				attachmentNum++;
			});
		}
	}
}
