<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import PasswordInput from '$lib/components/ui/password-input.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data, form }: PageProps = $props();

	const success = $derived(Boolean((form as { success?: boolean } | null)?.success));
	const accountSuccess = $derived(
		Boolean((form as { accountSuccess?: boolean } | null)?.accountSuccess)
	);
	const accountMessage = $derived((form as { accountMessage?: string } | null)?.accountMessage);
	const accountErrors = $derived(
		(form as { accountErrors?: Record<string, string> } | null)?.accountErrors ?? {}
	);

	const groupTitles: Record<string, (() => string) | undefined> = {
		general: m.admin_settings_group_general,
		contact: m.admin_settings_group_contact,
		promotions: m.admin_settings_group_promotions
	};

	const fieldLabels: Record<string, (() => string) | undefined> = {
		business_name: m.admin_settings_field_business_name,
		business_city: m.admin_settings_field_business_city,
		business_country: m.admin_settings_field_business_country,
		business_hours: m.admin_settings_field_business_hours,
		business_address: m.admin_settings_field_business_address,
		business_phone: m.admin_settings_field_business_phone,
		business_whatsapp: m.admin_settings_field_business_whatsapp,
		business_email: m.admin_settings_field_business_email,
		notification_email: m.admin_settings_field_notification_email,
		referral_credit_tzs: m.admin_settings_field_referral_credit,
		first_clean_discount_percent: m.admin_settings_field_first_clean
	};

	const fieldHints: Record<string, (() => string) | undefined> = {
		business_phone: m.admin_settings_hint_business_phone,
		business_whatsapp: m.admin_settings_hint_business_whatsapp,
		notification_email: m.admin_settings_hint_notification_email
	};

	const groups = $derived(
		['general', 'contact', 'promotions'].map((group) => ({
			group,
			title: groupTitles[group],
			fields: data.fields.filter((field) => field.group === group)
		}))
	);

	const inputClass =
		'mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600';
	const labelClass = 'block text-sm font-medium text-foreground';
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">
			{m.admin_website_settings_title()}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			{m.admin_settings_intro()}
		</p>
	</div>

	{#if success}
		<p class="rounded-brand border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
			{m.admin_settings_saved()}
		</p>
	{/if}

	<form method="POST" action="?/update" class="space-y-6" use:enhance>
		{#each groups as group (group.group)}
			<section class="space-y-4 rounded-brand border border-border bg-background p-6 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">{group.title?.()}</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each group.fields as field (field.key)}
						<div>
							<label for={field.key} class={labelClass}
								>{fieldLabels[field.key]?.() ?? field.label}</label
							>
							<input
								id={field.key}
								name={field.key}
								type={field.type}
								value={data.values[field.key] ?? ''}
								class={inputClass}
							/>
							{#if field.hint}
								<p class="mt-1 text-xs text-muted-foreground">
									{fieldHints[field.key]?.() ?? field.hint}
								</p>
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
			{m.admin_settings_save()}
		</button>
	</form>

	<section class="space-y-4 rounded-brand border border-border bg-background p-6 shadow-card">
		<div>
			<h2 class="text-sm font-semibold text-foreground">{m.admin_settings_login_heading()}</h2>
			<p class="mt-1 text-xs text-muted-foreground">
				{m.admin_settings_login_intro()}
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
				<label for="accountEmail" class="block text-sm font-medium text-foreground"
					>{m.common_email()}</label
				>
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
				label={m.admin_settings_current_password()}
				autocomplete="current-password"
				required
				error={accountErrors.currentPassword}
			/>

			<PasswordInput
				id="newPassword"
				name="newPassword"
				label={m.admin_settings_new_password()}
				autocomplete="new-password"
				placeholder={m.admin_settings_new_password_placeholder()}
				error={accountErrors.newPassword}
			/>
			<PasswordInput
				id="confirmPassword"
				name="confirmPassword"
				label={m.admin_settings_confirm_password()}
				autocomplete="new-password"
				error={accountErrors.confirmPassword}
			/>

			<div class="sm:col-span-2">
				<button
					type="submit"
					class="rounded-brand bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
				>
					{m.admin_settings_save_login()}
				</button>
			</div>
		</form>
	</section>
</div>
