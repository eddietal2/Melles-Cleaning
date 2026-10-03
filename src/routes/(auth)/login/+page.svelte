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
		<input
			id="password"
			name="password"
			type="password"
			autocomplete="current-password"
			required
			class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
		/>
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
