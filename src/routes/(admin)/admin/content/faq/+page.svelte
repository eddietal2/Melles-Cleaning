<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);
	const inputClass =
		'mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600';
	const labelClass = 'block text-sm font-medium text-foreground';
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/content"
			>← Website content</a
		>
		<h1 class="mt-1 text-2xl font-semibold tracking-tight text-foreground">FAQ</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Published questions appear on service pages and the site.
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
		class="space-y-4 rounded-brand border border-border bg-background p-5 shadow-card"
		use:enhance
	>
		<p class="text-sm font-semibold text-foreground">Add a question</p>
		<div>
			<label for="question" class={labelClass}>Question</label>
			<input id="question" name="question" type="text" required class={inputClass} />
		</div>
		<div>
			<label for="answer" class={labelClass}>Answer</label>
			<textarea id="answer" name="answer" rows="3" required class={inputClass}></textarea>
		</div>
		<button
			type="submit"
			class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
		>
			Add question
		</button>
	</form>

	<ul class="space-y-4">
		{#each data.items as item (item.id)}
			<li class="rounded-brand border border-border bg-background p-5 shadow-card">
				<form method="POST" action="?/update" class="space-y-3" use:enhance>
					<input type="hidden" name="id" value={item.id} />
					<div>
						<label for="q-{item.id}" class={labelClass}>Question</label>
						<input
							id="q-{item.id}"
							name="question"
							type="text"
							value={item.question}
							class={inputClass}
						/>
					</div>
					<div>
						<label for="a-{item.id}" class={labelClass}>Answer</label>
						<textarea id="a-{item.id}" name="answer" rows="3" class={inputClass}
							>{item.answer}</textarea
						>
					</div>
					<div class="flex flex-wrap items-center justify-between gap-3">
						<label class="flex items-center gap-2 text-sm text-muted-foreground">
							Order
							<input
								name="sortOrder"
								type="number"
								value={item.sortOrder}
								class="w-20 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
							/>
						</label>
						<button
							type="submit"
							class="rounded-brand bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
							>Save</button
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
							{item.isPublished ? 'Published' : 'Draft'}
						</button>
					</form>
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							class="text-xs font-medium text-muted-foreground hover:text-danger">Delete</button
						>
					</form>
				</div>
			</li>
		{/each}
	</ul>
</div>
