<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import PasswordInput from '$lib/components/ui/password-input.svelte';

	let { data, form }: PageProps = $props();

	const success = $derived(Boolean((form as { success?: boolean } | null)?.success));
	const accountSuccess = $derived(
		Boolean((form as { accountSuccess?: boolean } | null)?.accountSuccess)
	);
	const accountMessage = $derived((form as { accountMessage?: string } | null)?.accountMessage);
	const accountErrors = $derived(
		(form as { accountErrors?: Record<string, string> } | null)?.accountErrors ?? {}
	);

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

	<section class="space-y-4 rounded-brand border border-border bg-background p-6 shadow-card">
		<div>
			<h2 class="text-sm font-semibold text-foreground">Your login</h2>
			<p class="mt-1 text-xs text-muted-foreground">
				Change the email address and password you use to sign in. Your current password is required
				to confirm any change.
			</p>
		</div>

		{#if accountSuccess}
			<p class="rounded-brand border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
				{accountMessage}
			</p>
		{:else if accountMessage}
			<p
				class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
				role="alert"
			>
				{accountMessage}
			</p>
		{/if}

		<form method="POST" action="?/updateAccount" class="grid gap-4 sm:grid-cols-2" use:enhance>
			<div class="sm:col-span-2">
				<label for="accountEmail" class="block text-sm font-medium text-foreground">Email</label>
				<input
					id="accountEmail"
					name="email"
					type="email"
					autocomplete="email"
					required
					value={data.account.email}
					class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
				/>
				{#if accountErrors.email}<p class="mt-1 text-xs text-danger">{accountErrors.email}</p>{/if}
			</div>

			<PasswordInput
				id="currentPassword"
				name="currentPassword"
				label="Current password"
				autocomplete="current-password"
				required
				error={accountErrors.currentPassword}
			/>

			<PasswordInput
				id="newPassword"
				name="newPassword"
				label="New password"
				autocomplete="new-password"
				placeholder="Leave blank to keep current"
				error={accountErrors.newPassword}
			/>
			<PasswordInput
				id="confirmPassword"
				name="confirmPassword"
				label="Confirm new password"
				autocomplete="new-password"
				error={accountErrors.confirmPassword}
			/>

			<div class="sm:col-span-2">
				<button
					type="submit"
					class="rounded-brand bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
				>
					Save login details
				</button>
			</div>
		</form>
	</section>
</div>
