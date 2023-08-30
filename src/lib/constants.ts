import { Events } from '@sapphire/framework';
import { join } from 'path';

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

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

export const enum ModmailDirection {
	ToServer = 'toServer',
	ToUser = 'toUser'
}
