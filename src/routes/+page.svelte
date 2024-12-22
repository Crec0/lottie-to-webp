<script lang="ts">
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { type LottiePlayer } from 'lottie-web';
    import { onMount } from 'svelte';
    import Dropzone from '$lib/components/custom/Dropzone.svelte';
    import { type LottieBlob } from '$lib';
    import UploadedBlob from '$lib/components/custom/UploadedBlob.svelte';


    let lottiePlayer: LottiePlayer | null = $state(null);

    let fileBuffer: LottieBlob[] = $state([]);

    onMount(async () => {
        lottiePlayer = ( await import('lottie-web') ).default;
    });
</script>

<Card class="w-full md:w-3/4 lg:w-1/2 border-none">
    <CardHeader class="px-2 ">
        <CardTitle>
            Upload Lottie Files
        </CardTitle>
    </CardHeader>
    <CardContent class="p-2 lg:p-4 space-y-2">
        <Dropzone bind:fileBuffer />

        <div class="flex h-96 select-none flex-col gap-2 border p-2 rounded">
            {#if fileBuffer.length > 0}
                {#each fileBuffer as {name, buf} (name)}
                    <UploadedBlob {lottiePlayer} {name} {buf} />
                {/each}
            {:else}
                <div class="text-center text-muted-foreground">No files uploaded</div>
            {/if}
        </div>

    </CardContent>
</Card>
