import type { FeedbackInput } from '$lib/schemas/feedback';
import { db } from '../db';

export async function listFeedback() {
	return db.feedback.findMany({
		orderBy: { submittedAt: 'desc' },
		include: {
			booking: { include: { client: true, service: true } }
		}
	});
}

export async function createFeedback(input: FeedbackInput) {
	return db.feedback.create({
		data: {
			bookingId: input.bookingId,
			rating: input.rating,
			comment: input.comment ?? null
		}
	});
}

export async function setFeedbackPublished(id: string, isPublished: boolean) {
	await db.feedback.update({ where: { id }, data: { isPublished } });
}

export async function deleteFeedback(id: string) {
	await db.feedback.delete({ where: { id } });
}
