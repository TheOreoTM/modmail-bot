import { Events } from '@sapphire/framework';
import { join } from 'path';

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

export const BotPrefix = '!';

export const ModmailConfig = {
	server: '1138806085352951950',
	category: '1138806085805940775',
	handlerRole: '1138806085365530714'
};

export const AssistantEvents = {
	...Events,
	ModmailCreate: 'modmailCreate',
	ModmailSendMessage: 'modmailSendMessage'
};

export enum ModmailDirection {
	ToServer = 'toServer',
	ToUser = 'toUser'
}

export const ModmailColors = {
	Receive: 0xe8b527,
	Send: 0x4aab16
};

export const AssistantColors = {
	Success: 0x46b485,
	Fail: 0xf05050,
	Warn: 0xfee65c,
	Info: 0x297bd1,
	Loading: 0x23272a,
	Default: 0x2b2d31
};

export const ModmailStateEmojis = {
	ONGOING: '<:online:1146736514118725673> ',
	CLOSED: '<:invis:1146736627151011943> ',
	DELETED: '<:dnd:1146736537673941012>'
} as const;

export const AssistantEmojis = {
	Success: '<:success:1146683498766291024>',
	Fail: '<:fail:1146683470114996274>',
	Reply: '<:reply:1146683155370221639>',
	Off: '<:off:1146683633483141140>',
	On: '<:on:1146683600641736744>'
};
