import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AssistantEvents, ModmailColors, ModmailDirection } from '#constants';
import { EmbedBuilder, Message, userMention } from 'discord.js';
import { Modmail } from '#classes/Modmail';
import { ModmailTransmission } from '#lib/types';
import { isDMChannel } from '@sapphire/discord.js-utilities';

@ApplyOptions<Listener.Options>({ event: AssistantEvents.ModmailCreate })
export class UserEvent extends Listener {
	public override async run(message: Message) {
		const user = message.author;
		const ModmailManager = new Modmail();
		let isFirstTime = !(await ModmailManager.existsFor(user.id));
		const modmail = await ModmailManager.get({ userId: user.id });
		if (!modmail) isFirstTime = true;
		const isDM = isDMChannel(message.channel);
		const shouldCreateChannel = ((isFirstTime || !modmail) && isDM) || !modmail;
		console.log('🚀 ~ file: modmailCreate.ts:19 ~ UserEvent ~ overriderun ~ shouldCreateChannel:', shouldCreateChannel);

		if (shouldCreateChannel) {
			const modmail = await ModmailManager.create({ userId: user.id });
			const channel = await ModmailManager.createChannel({ user: user, modmail: modmail });
			await ModmailManager.setChannel(modmail.id, channel.id);

			const userModmailEmbed = new EmbedBuilder() //
				.setTitle('Modmail Started')
				.setDescription('Your message has been sent. Please wait patiently for a staff member to respond.')
				.setColor(ModmailColors.Send);

			const serverModmailEmbed = new EmbedBuilder() //
				.setTitle('Modmail Started')
				.setDescription(`New modmail from ${userMention(user.id)}`)
				.setColor(ModmailColors.Receive);

			await user.send({ embeds: [userModmailEmbed] });
			const msg = await channel.send({ embeds: [serverModmailEmbed] });
			if (msg.pinnable) msg.pin();

			const data: ModmailTransmission = {
				channel: channel,
				direction: ModmailDirection.ToServer, // Bc this is a DM
				firstTime: isFirstTime,
				modmail: modmail
			};

			return this.container.client.emit(AssistantEvents.ModmailMessageCreate, message, data);
		}

		let modmailChannel = await ModmailManager.getChannel(modmail.id);

		const data: ModmailTransmission = {
			channel: modmailChannel,
			direction: isDM ? ModmailDirection.ToServer : ModmailDirection.ToUser,
			firstTime: isFirstTime,
			modmail: modmail
		};

		return this.container.client.emit(AssistantEvents.ModmailMessageCreate, message, data);
	}
}
