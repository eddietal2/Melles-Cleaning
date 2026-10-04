<script lang="ts">
	import Skeleton from './skeleton.svelte';

	/** A skeleton shaped like an admin data table, shown while streamed rows load. */
	interface Props {
		rows?: number;
		columns?: number;
	}

	let { rows = 5, columns = 4 }: Props = $props();

	const rowIndexes = $derived(Array.from({ length: rows }, (_value, index) => index));
	const columnIndexes = $derived(Array.from({ length: columns }, (_value, index) => index));
</script>

<div
	class="overflow-hidden rounded-brand border border-border bg-background shadow-card"
	role="status"
	aria-label="Loading"
>
	<div class="border-b border-border bg-surface-muted px-5 py-3">
		<Skeleton class="h-3 w-40" />
	</div>
	<div class="divide-y divide-border">
		{#each rowIndexes as rowIndex (rowIndex)}
			<div
				class="grid gap-4 px-5 py-4"
				style={`grid-template-columns: repeat(${columns}, minmax(0, 1fr))`}
			>
				{#each columnIndexes as columnIndex (columnIndex)}
					<Skeleton class="h-4 {columnIndex === 0 ? 'w-3/4' : 'w-1/2'}" />
				{/each}
			</div>
		{/each}
	</div>
</div>
