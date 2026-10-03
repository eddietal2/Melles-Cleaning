<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		services?: { id: string; name: string }[];
		values?: Record<string, string>;
		errors?: Record<string, string>;
		success?: boolean;
		showSchedule?: boolean;
		submitLabel?: string;
	}

	let {
		services = [],
		values = {},
		errors = {},
		success = false,
		showSchedule = false,
		submitLabel = 'Send request'
	}: Props = $props();

	let submitting = $state(false);

	const inputClass =
		'mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600';
	const labelClass = 'block text-sm font-medium text-foreground';
	const errorClass = 'mt-1 text-xs text-danger';
</script>

{#if success}
	<div class="rounded-brand border border-success/30 bg-success/5 p-6 text-center">
		<p class="text-base font-semibold text-foreground">Thank you — your request is in</p>
		<p class="mt-2 text-sm text-muted-foreground">
			A member of the Melles team will contact you shortly, usually within one business day.
		</p>
	</div>
{:else}
	<form
		method="POST"
		class="space-y-5 rounded-brand border border-border bg-background p-6 shadow-card"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		{#if errors._form}
			<p
				class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
				role="alert"
			>
				{errors._form}
			</p>
		{/if}

		<div class="grid gap-5 sm:grid-cols-2">
			<div>
				<label for="fullName" class={labelClass}>Full name</label>
				<input
					id="fullName"
					name="fullName"
					type="text"
					autocomplete="name"
					required
					value={values.fullName ?? ''}
					class={inputClass}
				/>
				{#if errors.fullName}<p class={errorClass}>{errors.fullName}</p>{/if}
			</div>

			<div>
				<label for="phone" class={labelClass}>Phone / WhatsApp</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					autocomplete="tel"
					required
					placeholder="+255 …"
					value={values.phone ?? ''}
					class={inputClass}
				/>
				{#if errors.phone}<p class={errorClass}>{errors.phone}</p>{/if}
			</div>

			<div>
				<label for="email" class={labelClass}
					>Email <span class="text-muted-foreground">(optional)</span></label
				>
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					value={values.email ?? ''}
					class={inputClass}
				/>
				{#if errors.email}<p class={errorClass}>{errors.email}</p>{/if}
			</div>

			<div>
				<label for="segment" class={labelClass}>Property type</label>
				<select id="segment" name="segment" class={inputClass}>
					<option value="">Select…</option>
					<option value="RESIDENTIAL" selected={values.segment === 'RESIDENTIAL'}
						>Residential</option
					>
					<option value="COMMERCIAL" selected={values.segment === 'COMMERCIAL'}>Commercial</option>
				</select>
			</div>

			{#if services.length}
				<div class="sm:col-span-2">
					<label for="serviceInterestId" class={labelClass}>Service of interest</label>
					<select id="serviceInterestId" name="serviceInterestId" class={inputClass}>
						<option value="">Not sure yet</option>
						{#each services as service (service.id)}
							<option value={service.id} selected={values.serviceInterestId === service.id}>
								{service.name}
							</option>
						{/each}
					</select>
				</div>
			{/if}

			{#if showSchedule}
				<div>
					<label for="preferredDate" class={labelClass}>Preferred date</label>
					<input
						id="preferredDate"
						name="preferredDate"
						type="date"
						value={values.preferredDate ?? ''}
						class={inputClass}
					/>
				</div>
				<div>
					<label for="preferredTime" class={labelClass}>Preferred time</label>
					<select id="preferredTime" name="preferredTime" class={inputClass}>
						<option value="">Any time</option>
						<option value="Morning" selected={values.preferredTime === 'Morning'}>Morning</option>
						<option value="Afternoon" selected={values.preferredTime === 'Afternoon'}
							>Afternoon</option
						>
						<option value="Evening" selected={values.preferredTime === 'Evening'}>Evening</option>
					</select>
				</div>
			{/if}
		</div>

		<div>
			<label for="notes" class={labelClass}>Details</label>
			<textarea
				id="notes"
				name="notes"
				rows="4"
				placeholder="Number of rooms, condition, access notes…"
				class={inputClass}>{values.notes ?? ''}</textarea
			>
			{#if errors.message}<p class={errorClass}>{errors.message}</p>{/if}
		</div>

		<button
			type="submit"
			disabled={submitting}
			class="w-full rounded-brand bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
		>
			{submitting ? 'Sending…' : submitLabel}
		</button>

		<p class="text-center text-xs text-muted-foreground">
			We usually reply within one business day. Your details are never shared.
		</p>
	</form>
{/if}
