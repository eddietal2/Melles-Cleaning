<script lang="ts">
	export interface GalleryImage {
		src: string;
		alt: string;
	}

	interface Props {
		/** Images to show; defaults to a set of Unsplash photos for now. */
		images?: GalleryImage[];
		/** Seconds for one full pass. Lower is faster. */
		durationSeconds?: number;
		title?: string;
		subtitle?: string;
		/** Accessible label for the gallery region. */
		label?: string;
	}

	/** Placeholder imagery until the owner uploads real photos to the media library. */
	const DEFAULT_IMAGES: GalleryImage[] = [
		{
			src: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&h=500&q=70',
			alt: 'Cleaning supplies arranged on a surface'
		},
		{
			src: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&h=500&q=70',
			alt: 'Person cleaning a home interior'
		},
		{
			src: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&h=500&q=70',
			alt: 'Spray bottle and cloths for surface cleaning'
		},
		{
			src: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&h=500&q=70',
			alt: 'Freshly cleaned kitchen counter'
		},
		{
			src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&h=500&q=70',
			alt: 'Bright, tidy living room'
		},
		{
			src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&h=500&q=70',
			alt: 'Clean modern interior with natural light'
		},
		{
			src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&h=500&q=70',
			alt: 'Spotless dining area'
		},
		{
			src: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&h=500&q=70',
			alt: 'Well-kept lounge with sofa'
		}
	];

	let {
		images = DEFAULT_IMAGES,
		durationSeconds = 45,
		title,
		subtitle,
		label = 'Cleaning gallery'
	}: Props = $props();
</script>

<section class="overflow-hidden bg-background py-16 lg:py-20" aria-label={label}>
	{#if title || subtitle}
		<div class="container-page mb-8">
			{#if title}
				<h2 class="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
			{/if}
			{#if subtitle}
				<p class="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
			{/if}
		</div>
	{/if}

	<div class="gallery-viewport relative overflow-hidden">
		<div class="gallery-track flex w-max" style={`--gallery-duration: ${durationSeconds}s`}>
			{#each [0, 1] as pass (pass)}
				<div class="flex shrink-0 gap-4 pr-4" aria-hidden={pass === 1 ? 'true' : undefined}>
					{#each images as image (image.src)}
						<img
							src={image.src}
							alt={pass === 0 ? image.alt : ''}
							width="288"
							height="180"
							loading="lazy"
							decoding="async"
							class="h-40 w-64 shrink-0 rounded-brand object-cover shadow-card sm:h-48 sm:w-72"
						/>
					{/each}
				</div>
			{/each}
		</div>

		<div class="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent"></div>
		<div class="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent"></div>
	</div>
</section>

<style>
	.gallery-track {
		animation: gallery-pan var(--gallery-duration, 45s) linear infinite;
	}

	/* Pause while the visitor inspects an image. */
	.gallery-viewport:hover .gallery-track {
		animation-play-state: paused;
	}

	@keyframes gallery-pan {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gallery-track {
			animation: none;
		}

		.gallery-viewport {
			overflow-x: auto;
		}
	}
</style>
