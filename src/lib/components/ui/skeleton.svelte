<script lang="ts">
	/**
	 * Primitive loading placeholder. Compose with utility classes for size/shape:
	 *   <Skeleton class="h-4 w-32" />
	 */
	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div class="skeleton {className}" aria-hidden="true"></div>
