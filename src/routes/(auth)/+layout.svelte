<script lang="ts">
	let { children } = $props();
</script>

<div class="flex min-h-dvh items-center justify-center bg-surface px-4 py-12">
	<div class="w-full max-w-md">
		{@render children()}
	</div>
</div>
