import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailConfig, ModmailDirection } from '#constants';
import { ChannelType, Message, PermissionFlagsBits } from 'discord.js';
import { fetchMainServer, fetchModmailCategory } from '#utils';
import { Modmail } from '#classes/Modmail';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.ModmailCreate })
export class UserEvent extends Listener {
	public override async run(message: Message) {
		const modmailManager = new Modmail();
		let firstTime = false;
		if (await modmailManager.existsFor(message.author.id)) {
			const channel = await modmailManager.getChannel((await modmailManager.get(message.author.id))!.id).catch(() => {
				modmailManager.delete({ userId: message.author.id });
			});
			return this.container.client.emit(AssistantEvents.ModmailSendMessage, ModmailDirection.ToServer, firstTime, message, channel);
		}
		firstTime = true;

		const category = await fetchModmailCategory();
		const guild = await fetchMainServer();
		const modmail = await modmailManager.create({ userId: message.author.id });

		const channel = await guild.channels.create({
			name: `${message.author.username}-${modmail.id.toString().padStart(4, '0')}`,
			type: ChannelType.GuildText,
			parent: category,
			permissionOverwrites: [
				{
					id: guild.id,
					deny: [PermissionFlagsBits.ViewChannel]
				},
				{
					id: ModmailConfig.handlerRole,
					allow: ['ViewChannel', 'SendMessages', 'AttachFiles']
				}
			],
			position: 0,
			topic: `Modmail for ${message.author.username} (\`${message.author.id}\`)`
		});

		await modmailManager.setChannel(modmail.id, channel.id);

		return this.container.client.emit(AssistantEvents.ModmailSendMessage, ModmailDirection.ToServer, firstTime, message, channel);
	}
}
