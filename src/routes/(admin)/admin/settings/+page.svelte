<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const success = $derived(Boolean((form as { success?: boolean } | null)?.success));

	const groups = $derived(
		['general', 'contact', 'promotions'].map((group) => ({
			group,
			title:
				group === 'general' ? 'Business details' : group === 'contact' ? 'Contact' : 'Promotions',
			fields: data.fields.filter((field) => field.group === group)
		}))
	);

	const inputClass =
		'mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600';
	const labelClass = 'block text-sm font-medium text-foreground';
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Business settings</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			These values feed the website header, footer, contact page and promotions.
		</p>
	</div>

	{#if success}
		<p class="rounded-brand border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
			Settings saved.
		</p>
	{/if}

	<form method="POST" action="?/update" class="space-y-6" use:enhance>
		{#each groups as group (group.group)}
			<section class="space-y-4 rounded-brand border border-border bg-background p-6 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">{group.title}</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each group.fields as field (field.key)}
						<div>
							<label for={field.key} class={labelClass}>{field.label}</label>
							<input
								id={field.key}
								name={field.key}
								type={field.type}
								value={data.values[field.key] ?? ''}
								class={inputClass}
							/>
							{#if field.hint}
								<p class="mt-1 text-xs text-muted-foreground">{field.hint}</p>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/each}

		<button
			type="submit"
			class="rounded-brand bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
		>
			Save settings
		</button>
	</form>
</div>
