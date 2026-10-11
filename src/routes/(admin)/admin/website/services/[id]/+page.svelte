<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { data, form }: PageProps = $props();

	const service = $derived(data.service);
	const message = $derived((form as { message?: string } | null)?.message);

	const inputClass =
		'mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600';
	const labelClass = 'block text-sm font-medium text-foreground';
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/website/services"
			>{m.admin_services_back()}</a
		>
		<h1 class="mt-1 text-2xl font-semibold tracking-tight text-foreground">{service.name}</h1>
		<p class="mt-1 text-sm text-muted-foreground">/services/{service.slug}</p>
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
		action="?/update"
		class="space-y-5 rounded-brand border border-border bg-background p-6 shadow-card"
		use:enhance
	>
		<p class="text-sm font-semibold text-foreground">{m.admin_services_details()}</p>

		<div class="grid gap-5 sm:grid-cols-2">
			<div>
				<label for="name" class={labelClass}>{m.common_name()}</label>
				<input id="name" name="name" type="text" required value={service.name} class={inputClass} />
			</div>
			<div>
				<label for="slug" class={labelClass}>{m.admin_services_slug()}</label>
				<input id="slug" name="slug" type="text" value={service.slug} class={inputClass} />
			</div>
		</div>

		<div>
			<label for="shortDescription" class={labelClass}>{m.admin_services_short_description()}</label
			>
			<input
				id="shortDescription"
				name="shortDescription"
				type="text"
				value={service.shortDescription ?? ''}
				class={inputClass}
			/>
		</div>

		<div>
			<label for="bodyMarkdown" class={labelClass}>{m.admin_services_full_description()}</label>
			<textarea id="bodyMarkdown" name="bodyMarkdown" rows="6" class={inputClass}
				>{service.bodyMarkdown ?? ''}</textarea
			>
			<p class="mt-1 text-xs text-muted-foreground">{m.admin_services_body_hint()}</p>
		</div>

		<div class="grid gap-5 sm:grid-cols-2">
			<div>
				<label for="sortOrder" class={labelClass}>{m.admin_services_display_order()}</label>
				<input
					id="sortOrder"
					name="sortOrder"
					type="number"
					value={service.sortOrder}
					class={inputClass}
				/>
			</div>
			<label class="flex items-center gap-2 pt-6 text-sm font-medium text-foreground">
				<input
					type="checkbox"
					name="isActive"
					checked={service.isActive}
					class="rounded border-border text-brand-600 focus:ring-brand-600"
				/>
				{m.admin_services_visible_label()}
			</label>
		</div>

		<button
			type="submit"
			class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
		>
			{m.admin_services_save()}
		</button>
	</form>

	<div class="space-y-4">
		<h2 class="text-lg font-semibold text-foreground">{m.admin_services_pricing_packages()}</h2>

		{#each service.pricingPackages as pkg (pkg.id)}
			<form
				method="POST"
				action="?/updatePackage"
				class="grid gap-4 rounded-brand border border-border bg-background p-5 shadow-card sm:grid-cols-2 lg:grid-cols-3"
				use:enhance
			>
				<input type="hidden" name="id" value={pkg.id} />

				<div class="sm:col-span-2 lg:col-span-1">
					<label class={labelClass} for="pkg-name-{pkg.id}">{m.admin_services_package_name()}</label
					>
					<input
						id="pkg-name-{pkg.id}"
						name="name"
						type="text"
						value={pkg.name}
						class={inputClass}
					/>
				</div>
				<div class="sm:col-span-2 lg:col-span-2">
					<label class={labelClass} for="pkg-scope-{pkg.id}"
						>{m.admin_services_package_scope()}</label
					>
					<input
						id="pkg-scope-{pkg.id}"
						name="scope"
						type="text"
						value={pkg.scope ?? ''}
						class={inputClass}
					/>
				</div>
				<div>
					<label class={labelClass} for="pkg-min-{pkg.id}">{m.admin_services_package_min()}</label>
					<input
						id="pkg-min-{pkg.id}"
						name="priceMinTzs"
						type="number"
						value={pkg.priceMinTzs}
						class={inputClass}
					/>
				</div>
				<div>
					<label class={labelClass} for="pkg-max-{pkg.id}">{m.admin_services_package_max()}</label>
					<input
						id="pkg-max-{pkg.id}"
						name="priceMaxTzs"
						type="number"
						value={pkg.priceMaxTzs}
						class={inputClass}
					/>
				</div>
				<div>
					<label class={labelClass} for="pkg-unit-{pkg.id}">{m.admin_services_package_unit()}</label
					>
					<input
						id="pkg-unit-{pkg.id}"
						name="unit"
						type="text"
						placeholder={m.admin_services_package_unit_placeholder()}
						value={pkg.unit ?? ''}
						class={inputClass}
					/>
				</div>
				<div class="flex items-center gap-4">
					<label class="flex items-center gap-2 text-sm font-medium text-foreground">
						<input
							type="checkbox"
							name="isActive"
							checked={pkg.isActive}
							class="rounded border-border text-brand-600 focus:ring-brand-600"
						/>
						{m.common_active()}
					</label>
					<input
						name="sortOrder"
						type="number"
						value={pkg.sortOrder}
						aria-label={m.admin_services_display_order()}
						class="w-20 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div class="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
					<button
						type="submit"
						class="rounded-brand bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
						>{m.common_save()}</button
					>
				</div>
			</form>

			<form method="POST" action="?/deletePackage" use:enhance class="-mt-2 text-right">
				<input type="hidden" name="id" value={pkg.id} />
				<button type="submit" class="text-xs font-medium text-muted-foreground hover:text-danger"
					>{m.admin_services_delete_package()}</button
				>
			</form>
		{/each}

		<form
			method="POST"
			action="?/createPackage"
			class="grid gap-4 rounded-brand border border-dashed border-border-strong bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3"
			use:enhance
		>
			<p class="text-sm font-semibold text-foreground sm:col-span-2 lg:col-span-3">
				{m.admin_services_add_package_heading()}
			</p>
			<div class="sm:col-span-2 lg:col-span-1">
				<label class={labelClass} for="new-name">{m.admin_services_package_name()}</label>
				<input id="new-name" name="name" type="text" required class={inputClass} />
			</div>
			<div class="sm:col-span-2 lg:col-span-2">
				<label class={labelClass} for="new-scope">{m.admin_services_package_scope()}</label>
				<input id="new-scope" name="scope" type="text" class={inputClass} />
			</div>
			<div>
				<label class={labelClass} for="new-min">{m.admin_services_package_min()}</label>
				<input id="new-min" name="priceMinTzs" type="number" value="0" class={inputClass} />
			</div>
			<div>
				<label class={labelClass} for="new-max">{m.admin_services_package_max()}</label>
				<input id="new-max" name="priceMaxTzs" type="number" value="0" class={inputClass} />
			</div>
			<div>
				<label class={labelClass} for="new-unit">{m.admin_services_package_unit()}</label>
				<input
					id="new-unit"
					name="unit"
					type="text"
					placeholder={m.admin_services_package_unit_placeholder()}
					class={inputClass}
				/>
			</div>
			<div class="sm:col-span-2 lg:col-span-3">
				<button
					type="submit"
					class="rounded-brand border border-border-strong px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand-500 hover:text-brand-700"
				>
					{m.admin_services_add_package()}
				</button>
			</div>
		</form>
	</div>

	<form method="POST" action="?/deleteService" use:enhance class="border-t border-border pt-6">
		<button type="submit" class="text-sm font-medium text-muted-foreground hover:text-danger">
			{m.admin_services_delete_service()}
		</button>
	</form>
</div>
