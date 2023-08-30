import { ModmailStatus } from '@prisma/client';
import { container } from '@sapphire/framework';

export async function createModmail(userId: string) {
	const modmailData = await container.db.modmail.create({
		data: {
			userId,
			status: ModmailStatus.ONGOING
		}
	});

	return modmailData;
}

export async function getModmailData(userId: string) {
	const modmailData = await container.db.modmail.findFirst({
		where: {
			userId,
			status: ModmailStatus.ONGOING
		}
	});

	return modmailData;
}

export async function memberHasModmail(userId: string) {
	const modmailData = await getModmailData(userId);

	return modmailData ? true : false;
}
