import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailDirection } from '#constants';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.ModmailSendMessage })
export class UserEvent extends Listener {
	public override run(direction: ModmailDirection, firstTime: boolean, message: Message, channel: TextChannel) {
		if (direction !== ModmailDirection.ToServer) return;

		const embed = new EmbedBuilder();

		if (firstTime) {
			const embed = new EmbedBuilder();
			embed.setTitle('Modmail recieved').addFields({
				name: 'User',
				value: `<@${message.author.id}>`
			});

			channel.send({ embeds: [embed] });
		}

		embed
			.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ forceStatic: true }) })
			.setDescription(message.content);

		channel.send({ embeds: [embed] });

		if (message.attachments.size) {
			message.attachments.forEach((attachment, index) => {
				channel.send({ embeds: [new EmbedBuilder().setThumbnail(attachment.proxyURL).setAuthor({ name: `Attachment #${index + 1}` })] });
			});
		}
	}
}
