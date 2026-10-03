<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);
</script>

<div class="space-y-8">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/content"
				>← Website content</a
			>
			<h1 class="mt-1 text-2xl font-semibold tracking-tight text-foreground">Services & pricing</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Only active services appear on the public website.
			</p>
		</div>
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
		class="flex flex-wrap items-end gap-3 rounded-brand border border-border bg-background p-5 shadow-card"
		use:enhance
	>
		<div class="min-w-56 flex-1">
			<label for="name" class="block text-sm font-medium text-foreground">New service name</label>
			<input
				id="name"
				name="name"
				type="text"
				required
				placeholder="e.g. Post-Construction Cleaning"
				class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
			/>
		</div>
		<button
			type="submit"
			class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
		>
			Add service
		</button>
	</form>

	<ul class="space-y-3">
		{#each data.services as service (service.id)}
			<li
				class="flex flex-wrap items-center justify-between gap-4 rounded-brand border border-border bg-background p-5 shadow-card"
			>
				<div class="min-w-0">
					<div class="flex items-center gap-2">
						<p class="truncate text-sm font-semibold text-foreground">{service.name}</p>
						<span
							class="rounded-pill px-2 py-0.5 text-xs font-medium {service.isActive
								? 'bg-success/10 text-success'
								: 'bg-surface-muted text-muted-foreground'}"
						>
							{service.isActive ? 'Visible' : 'Hidden'}
						</span>
					</div>
					<p class="mt-0.5 truncate text-xs text-muted-foreground">
						/{service.slug} · {service._count.pricingPackages} pricing package{service._count
							.pricingPackages === 1
							? ''
							: 's'}
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<a
						href="/admin/content/services/{service.id}"
						class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700"
						>Edit</a
					>

					<form method="POST" action="?/toggleActive" use:enhance>
						<input type="hidden" name="id" value={service.id} />
						<input type="hidden" name="active" value={service.isActive ? 'false' : 'true'} />
						<button
							type="submit"
							class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700"
						>
							{service.isActive ? 'Hide' : 'Publish'}
						</button>
					</form>

					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={service.id} />
						<button
							type="submit"
							class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-danger hover:text-danger"
						>
							Delete
						</button>
					</form>
				</div>
			</li>
		{/each}
	</ul>
</div>
