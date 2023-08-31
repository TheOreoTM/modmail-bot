import { ModmailConfig } from '#lib/constants';
import { Precondition } from '@sapphire/framework';
import type { Collection, Message, Role } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override messageRun(message: Message) {
		if (message.member) {
			return this.check(message.member.roles.cache);
		} else {
			return this.ok();
		}
	}

	private check(roles: Collection<string, Role>) {
		return roles.has(ModmailConfig.handlerRole) ? this.ok() : this.error();
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		StaffOnly: never;
	}
}
