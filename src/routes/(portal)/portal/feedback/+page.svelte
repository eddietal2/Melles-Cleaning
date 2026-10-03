<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDate } from '$lib/utils/dates';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Feedback</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Tell us how we did. Your rating helps us keep quality high.
		</p>
	</div>

	{#if message}
		<p class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
			{message}
		</p>
	{/if}

	{#if data.eligible.length > 0}
		<section class="rounded-brand border border-border bg-background p-5 shadow-card">
			<h2 class="text-sm font-semibold text-foreground">Rate a recent clean</h2>
			<form method="POST" action="?/submit" class="mt-4 grid gap-4 sm:grid-cols-2" use:enhance>
				<div class="sm:col-span-2">
					<label for="bookingId" class="block text-sm font-medium text-foreground">Which visit?</label>
					<select
						id="bookingId"
						name="bookingId"
						required
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						{#each data.eligible as booking (booking.id)}
							<option value={booking.id}>
								{booking.service.name} · {formatDate(booking.scheduledStart)}
							</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="rating" class="block text-sm font-medium text-foreground">Rating</label>
					<select
						id="rating"
						name="rating"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="5">5 — Excellent</option>
						<option value="4">4 — Good</option>
						<option value="3">3 — Fair</option>
						<option value="2">2 — Poor</option>
						<option value="1">1 — Bad</option>
					</select>
				</div>
				<div>
					<label for="comment" class="block text-sm font-medium text-foreground">Comment</label>
					<input
						id="comment"
						name="comment"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div class="sm:col-span-2">
					<button
						type="submit"
						class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
					>
						Submit feedback
					</button>
				</div>
			</form>
		</section>
	{/if}

	<section class="rounded-brand border border-border bg-background p-5 shadow-card">
		<h2 class="text-sm font-semibold text-foreground">Your history</h2>
		<ul class="mt-3 divide-y divide-border">
			{#each data.history as entry (entry.id)}
				<li class="py-3 text-sm">
					<div class="flex items-center justify-between">
						<span class="font-medium text-foreground">{entry.booking.service.name}</span>
						<span class="text-muted-foreground">{entry.rating} / 5</span>
					</div>
					<p class="text-xs text-muted-foreground">
						{formatDate(entry.submittedAt)}{entry.comment ? ` · ${entry.comment}` : ''}
					</p>
				</li>
			{:else}
				<li class="py-3 text-sm text-muted-foreground">No feedback submitted yet.</li>
			{/each}
		</ul>
	</section>
</div>
