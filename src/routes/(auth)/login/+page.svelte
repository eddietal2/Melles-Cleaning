<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		data,
		form
	}: {
		data: { redirectTo: string };
		form: { error?: string; email?: string } | null;
	} = $props();

	let submitting = $state(false);
	let showPassword = $state(false);
</script>

<svelte:head>
	<title>Sign in · Melles Cleaning Services</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="text-center">
	<h1 class="text-2xl font-semibold text-foreground">Melles Cleaning Services</h1>
	<p class="mt-1 text-sm text-muted-foreground">Staff and admin sign in</p>
</div>

<form
	method="POST"
	class="mt-8 space-y-5 rounded-brand border border-border bg-background p-6 shadow-card"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}
>
	<input type="hidden" name="redirectTo" value={data.redirectTo} />

	{#if form?.error}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{form.error}
		</p>
	{/if}

	<div>
		<label for="email" class="block text-sm font-medium text-foreground">Email</label>
		<input
			id="email"
			name="email"
			type="email"
			autocomplete="email"
			required
			value={form?.email ?? ''}
			class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
		/>
	</div>

	<div>
		<label for="password" class="block text-sm font-medium text-foreground">Password</label>
		<div class="relative mt-1">
			<input
				id="password"
				name="password"
				type={showPassword ? 'text' : 'password'}
				autocomplete="current-password"
				required
				class="block w-full rounded-brand border-border pr-10 shadow-sm focus:border-brand-600 focus:ring-brand-600"
			/>
			<button
				type="button"
				onclick={() => (showPassword = !showPassword)}
				class="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-brand text-muted-foreground transition hover:text-foreground"
				aria-label={showPassword ? 'Hide password' : 'Show password'}
				aria-pressed={showPassword}
			>
				{#if showPassword}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-4 w-4"
						aria-hidden="true"
					>
						<path d="m3 3 18 18" />
						<path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
						<path d="M9.4 5.6A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9 7a11.8 11.8 0 0 1-2.4 3.3" />
						<path d="M6.1 6.1C3.9 7.6 3 9.7 3 12c0 2.5 4 7 9 7a9.7 9.7 0 0 0 3.5-.6" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-4 w-4"
						aria-hidden="true"
					>
						<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<button
		type="submit"
		disabled={submitting}
		class="w-full rounded-brand bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
	>
		{submitting ? 'Signing in…' : 'Sign in'}
	</button>
</form>

<p class="mt-6 text-center text-xs text-muted-foreground">
	Melles Cleaning Services · Dodoma, Tanzania
</p>
