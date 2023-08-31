import { ModmailStatus } from '@prisma/client';
import { TextChannel } from 'discord.js';
import { ModmailDirection } from './constants';

export type ModmailTransmission = {
	firstTime: boolean;
	channel: TextChannel;
	modmail: ModmailData;
	direction: ModmailDirection;
};

export type ModmailData = {
	id: number;
	userId: string;
	status: ModmailStatus;
	channelId: string | null;
	createdAt: Date;
};
