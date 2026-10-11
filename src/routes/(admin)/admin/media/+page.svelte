<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: PageProps = $props();

	let uploading = $state(false);
	let uploadError = $state('');
	let uploadNote = $state('');
	let fileInput: HTMLInputElement | undefined = $state();

	const galleryByMedia = $derived(new Map(data.gallery.map((item) => [item.mediaId, item])));

	async function handleUpload(event: SubmitEvent) {
		event.preventDefault();
		uploadError = '';
		uploadNote = '';

		const file = fileInput?.files?.[0];
		if (!file) {
			uploadError = m.admin_media_error_choose();
			return;
		}

		uploading = true;

		try {
			const presign = await fetch('/api/media/upload', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size })
			});

			if (!presign.ok) {
				const info = await presign.json().catch(() => null);
				throw new Error(info?.message ?? m.admin_media_error_start());
			}

			const { uploadUrl, key } = (await presign.json()) as {
				uploadUrl: string;
				key: string;
			};

			const put = await fetch(uploadUrl, {
				method: 'PUT',
				headers: { 'Content-Type': file.type },
				body: file
			});

			if (!put.ok) {
				throw new Error(m.admin_media_error_storage());
			}

			const altText = (document.getElementById('altText') as HTMLInputElement | null)?.value ?? '';
			const register = new FormData();
			register.set('key', key);
			register.set('mimeType', file.type);
			register.set('size', String(file.size));
			register.set('altText', altText);

			const response = await fetch('?/register', { method: 'POST', body: register });

			if (!response.ok) {
				throw new Error(m.admin_media_error_save());
			}

			if (fileInput) fileInput.value = '';
			const altField = document.getElementById('altText') as HTMLInputElement | null;
			if (altField) altField.value = '';

			uploadNote = m.admin_media_uploaded();
			await invalidateAll();
		} catch (error) {
			uploadError = error instanceof Error ? error.message : m.admin_media_error_failed();
		} finally {
			uploading = false;
		}
	}
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">{m.admin_media_title()}</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			{m.admin_media_intro()}
		</p>
	</div>

	{#if !data.r2Configured}
		<div class="rounded-brand border border-warning/30 bg-warning/5 p-5 text-sm text-foreground">
			<p class="font-semibold">{m.admin_media_not_configured()}</p>
			<p class="mt-1 text-muted-foreground">
				{m.admin_media_config_hint({
					a: 'R2_ACCOUNT_ID',
					b: 'R2_ACCESS_KEY_ID',
					c: 'R2_SECRET_ACCESS_KEY',
					d: 'R2_PUBLIC_URL'
				})}
			</p>
		</div>
	{:else}
		{#if !data.publicUrlConfigured}
			<div class="rounded-brand border border-warning/30 bg-warning/5 p-5 text-sm">
				<p class="font-semibold text-foreground">{m.admin_media_no_public_url()}</p>
				<p class="mt-1 text-muted-foreground">
					{m.admin_media_public_url_hint({ url: 'R2_PUBLIC_URL' })}
				</p>
			</div>
		{/if}

		<form
			class="space-y-4 rounded-brand border border-border bg-background p-6 shadow-card"
			onsubmit={handleUpload}
		>
			<p class="text-sm font-semibold text-foreground">{m.admin_media_upload_heading()}</p>

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="file" class="block text-sm font-medium text-foreground"
						>{m.admin_media_file()}</label
					>
					<input
						id="file"
						bind:this={fileInput}
						type="file"
						accept="image/jpeg,image/png,image/webp,image/avif"
						class="mt-1 block w-full text-sm"
					/>
				</div>
				<div>
					<label for="altText" class="block text-sm font-medium text-foreground"
						>{m.admin_media_alt()}
						<span class="text-muted-foreground">{m.admin_media_alt_hint()}</span></label
					>
					<input
						id="altText"
						type="text"
						placeholder={m.admin_media_alt_placeholder()}
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
			</div>

			{#if uploadError}
				<p class="text-sm text-danger" role="alert">{uploadError}</p>
			{/if}
			{#if uploadNote}
				<p class="text-sm text-success">{uploadNote}</p>
			{/if}

			<button
				type="submit"
				disabled={uploading}
				class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
			>
				{uploading ? m.admin_media_uploading() : m.admin_media_upload()}
			</button>
		</form>
	{/if}

	<div>
		<h2 class="text-lg font-semibold text-foreground">{m.admin_media_library()}</h2>

		{#if data.media.length === 0}
			<p class="mt-2 text-sm text-muted-foreground">{m.admin_media_empty()}</p>
		{:else}
			<ul class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.media as asset (asset.id)}
					{@const galleryItem = galleryByMedia.get(asset.id)}
					<li class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
						<img
							src={asset.url}
							alt={asset.altText ?? m.admin_media_image_alt()}
							class="aspect-4/3 w-full object-cover"
							loading="lazy"
						/>
						<div class="space-y-3 p-4">
							<p class="truncate text-xs text-muted-foreground" title={asset.r2Key}>
								{asset.r2Key}
							</p>

							<div class="flex flex-wrap gap-2">
								<form method="POST" action="?/toggleGallery" use:enhance>
									<input type="hidden" name="mediaId" value={asset.id} />
									<button
										type="submit"
										class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700"
									>
										{galleryItem ? m.admin_media_remove_gallery() : m.admin_media_add_gallery()}
									</button>
								</form>

								{#if galleryItem}
									<form method="POST" action="?/toggleGalleryPublish" use:enhance>
										<input type="hidden" name="mediaId" value={asset.id} />
										<input
											type="hidden"
											name="publish"
											value={galleryItem.isPublished ? 'false' : 'true'}
										/>
										<button
											type="submit"
											class="rounded-brand border px-3 py-1.5 text-xs font-medium transition {galleryItem.isPublished
												? 'border-success/40 text-success'
												: 'border-border text-muted-foreground hover:text-foreground'}"
										>
											{galleryItem.isPublished ? m.common_published() : m.common_draft()}
										</button>
									</form>
								{/if}

								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={asset.id} />
									<button
										type="submit"
										class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-danger hover:text-danger"
									>
										{m.common_delete()}
									</button>
								</form>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
