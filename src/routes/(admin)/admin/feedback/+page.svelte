<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { formatDateTime } from '$lib/utils/dates';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">
			{m.admin_feedback_title()}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			{m.admin_feedback_intro()}
		</p>
	</div>

	{#await data.streamed}
		<TableSkeleton rows={6} columns={6} />
	{:then payload}
		<details class="rounded-brand border border-border bg-background shadow-card">
			<summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground"
				>{m.admin_feedback_log()}</summary
			>
			<form
				method="POST"
				action="?/create"
				class="grid gap-4 border-t border-border p-5 sm:grid-cols-2"
				use:enhance
			>
				<div class="sm:col-span-2">
					<label for="bookingId" class="block text-sm font-medium text-foreground"
						>{m.common_booking()}</label
					>
					<select
						id="bookingId"
						name="bookingId"
						required
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="">{m.admin_feedback_select_booking()}</option>
						{#each payload.bookings as booking (booking.id)}
							<option value={booking.id}
								>{booking.bookingNumber} · {booking.client.displayName}</option
							>
						{/each}
					</select>
					{#if errors.bookingId}<p class="mt-1 text-xs text-danger">{errors.bookingId}</p>{/if}
				</div>
				<div>
					<label for="rating" class="block text-sm font-medium text-foreground"
						>{m.common_rating()}</label
					>
					<select
						id="rating"
						name="rating"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="5">{m.admin_feedback_rating_5()}</option>
						<option value="4">{m.admin_feedback_rating_4()}</option>
						<option value="3">{m.admin_feedback_rating_3()}</option>
						<option value="2">{m.admin_feedback_rating_2()}</option>
						<option value="1">{m.admin_feedback_rating_1()}</option>
					</select>
				</div>
				<div>
					<label for="comment" class="block text-sm font-medium text-foreground"
						>{m.common_comment()}</label
					>
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
						{m.admin_feedback_save()}
					</button>
				</div>
			</form>
		</details>

		<div class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
			<table class="min-w-full divide-y divide-border text-sm">
				<thead
					class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase"
				>
					<tr>
						<th class="px-5 py-3 font-medium">{m.common_client()}</th>
						<th class="px-5 py-3 font-medium">{m.common_job()}</th>
						<th class="px-5 py-3 font-medium">{m.common_rating()}</th>
						<th class="px-5 py-3 font-medium">{m.common_comment()}</th>
						<th class="px-5 py-3 font-medium">{m.admin_feedback_submitted()}</th>
						<th class="px-5 py-3 font-medium">{m.admin_feedback_visibility()}</th>
						<th class="px-5 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each payload.feedback as entry (entry.id)}
						<tr>
							<td class="px-5 py-3 text-foreground">{entry.booking.client.displayName}</td>
							<td class="px-5 py-3 text-muted-foreground">{entry.booking.service.name}</td>
							<td class="px-5 py-3 text-foreground">{entry.rating} / 5</td>
							<td class="max-w-xs px-5 py-3 text-muted-foreground">{entry.comment ?? '—'}</td>
							<td class="px-5 py-3 text-muted-foreground">{formatDateTime(entry.submittedAt)}</td>
							<td class="px-5 py-3">
								<span
									class="rounded-pill px-2 py-0.5 text-xs font-medium {entry.isPublished
										? 'bg-success/10 text-success'
										: 'bg-surface-muted text-muted-foreground'}"
								>
									{entry.isPublished ? m.common_published() : m.common_hidden()}
								</span>
							</td>
							<td class="px-5 py-3">
								<div class="flex items-center gap-3">
									<form method="POST" action="?/setPublished" use:enhance>
										<input type="hidden" name="id" value={entry.id} />
										<input
											type="hidden"
											name="published"
											value={entry.isPublished ? 'false' : 'true'}
										/>
										<button
											type="submit"
											class="text-xs font-medium text-foreground hover:text-brand-700"
										>
											{entry.isPublished ? m.common_hide() : m.common_publish()}
										</button>
									</form>
									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={entry.id} />
										<button type="submit" class="text-xs text-muted-foreground hover:text-danger"
											>{m.common_delete()}</button
										>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td class="px-5 py-6 text-muted-foreground" colspan="7">{m.admin_feedback_empty()}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:catch}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{m.admin_feedback_error()}
		</p>
	{/await}
</div>
