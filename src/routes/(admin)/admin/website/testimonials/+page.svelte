<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);
	const inputClass =
		'mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600';
	const labelClass = 'block text-sm font-medium text-foreground';
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/website"
			>{m.admin_website_back()}</a
		>
		<h1 class="mt-1 text-2xl font-semibold tracking-tight text-foreground">
			{m.admin_website_testimonials_title()}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			{m.admin_testimonials_intro()}
		</p>
	</div>

	{#if message}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{message}
		</p>
	{/if}

	<form
		method="POST"
		action="?/create"
		class="grid gap-4 rounded-brand border border-border bg-background p-5 shadow-card sm:grid-cols-2"
		use:enhance
	>
		<p class="text-sm font-semibold text-foreground sm:col-span-2">
			{m.admin_testimonials_add_heading()}
		</p>
		<div>
			<label for="clientName" class={labelClass}>{m.admin_testimonials_client_name()}</label>
			<input id="clientName" name="clientName" type="text" required class={inputClass} />
		</div>
		<div>
			<label for="clientRole" class={labelClass}>{m.admin_testimonials_client_role()}</label>
			<input
				id="clientRole"
				name="clientRole"
				type="text"
				placeholder={m.admin_testimonials_client_role_placeholder()}
				class={inputClass}
			/>
		</div>
		<div class="sm:col-span-2">
			<label for="quote" class={labelClass}>{m.admin_testimonials_quote()}</label>
			<textarea id="quote" name="quote" rows="3" required class={inputClass}></textarea>
		</div>
		<div>
			<label for="rating" class={labelClass}>{m.admin_testimonials_rating()}</label>
			<input id="rating" name="rating" type="number" min="1" max="5" value="5" class={inputClass} />
		</div>
		<div class="flex items-end">
			<button
				type="submit"
				class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
			>
				{m.admin_testimonials_add()}
			</button>
		</div>
	</form>

	<ul class="space-y-4">
		{#each data.items as item (item.id)}
			<li class="rounded-brand border border-border bg-background p-5 shadow-card">
				<form method="POST" action="?/update" class="grid gap-3 sm:grid-cols-2" use:enhance>
					<input type="hidden" name="id" value={item.id} />
					<div>
						<label for="n-{item.id}" class={labelClass}>{m.admin_testimonials_client_name()}</label>
						<input
							id="n-{item.id}"
							name="clientName"
							type="text"
							value={item.clientName}
							class={inputClass}
						/>
					</div>
					<div>
						<label for="r-{item.id}" class={labelClass}
							>{m.admin_testimonials_role_location()}</label
						>
						<input
							id="r-{item.id}"
							name="clientRole"
							type="text"
							value={item.clientRole ?? ''}
							class={inputClass}
						/>
					</div>
					<div class="sm:col-span-2">
						<label for="t-{item.id}" class={labelClass}>{m.admin_testimonials_quote()}</label>
						<textarea id="t-{item.id}" name="quote" rows="3" class={inputClass}
							>{item.quote}</textarea
						>
					</div>
					<div class="flex items-center gap-4">
						<label class="text-sm text-muted-foreground">
							{m.common_rating()}
							<input
								name="rating"
								type="number"
								min="1"
								max="5"
								value={item.rating}
								class="ml-2 w-16 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
							/>
						</label>
						<label class="text-sm text-muted-foreground">
							{m.common_order()}
							<input
								name="sortOrder"
								type="number"
								value={item.sortOrder}
								class="ml-2 w-16 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
							/>
						</label>
					</div>
					<div class="flex items-end justify-end">
						<button
							type="submit"
							class="rounded-brand bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
							>{m.common_save()}</button
						>
					</div>
				</form>

				<div class="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
					<form method="POST" action="?/togglePublish" use:enhance>
						<input type="hidden" name="id" value={item.id} />
						<input type="hidden" name="publish" value={item.isPublished ? 'false' : 'true'} />
						<button
							type="submit"
							class="rounded-pill px-3 py-1 text-xs font-medium {item.isPublished
								? 'bg-success/10 text-success'
								: 'bg-surface-muted text-muted-foreground'}"
						>
							{item.isPublished ? m.common_published() : m.common_draft()}
						</button>
					</form>
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							class="text-xs font-medium text-muted-foreground hover:text-danger"
							>{m.common_delete()}</button
						>
					</form>
				</div>
			</li>
		{/each}
	</ul>
</div>
