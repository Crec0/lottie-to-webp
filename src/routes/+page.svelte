<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { UploadCloudIcon } from 'lucide-svelte';
    import { type AnimationItem, type LottiePlayer } from 'lottie-web';
    import { onMount } from 'svelte';
    import { encodeAnimation } from '$lib/webp';
    import Dropzone from '$lib/components/custom/Dropzone.svelte';



    let lottiePlayer: LottiePlayer | null = $state(null);
    let canvasRef: HTMLCanvasElement | null = $state(null);

    const fileBuffer: ArrayBuffer[] = $state([]);

    onMount(async () => {
        lottiePlayer = ( await import('lottie-web') ).default;
    });

    $effect(() => {
        convertLottie(fileBuffer[0]);
    });

    function convertLottie(buf: ArrayBuffer | undefined) {
        if ( buf == null || canvasRef == null || lottiePlayer == null ) return;
        const ctx = canvasRef.getContext('2d');
        if ( ctx == null ) return;

        const animation: AnimationItem & { container: HTMLCanvasElement } = lottiePlayer.loadAnimation({
            container: canvasRef.parentElement!,
            renderer: 'canvas',
            loop: false,
            autoplay: false,
            animationData: JSON.parse(new TextDecoder().decode(buf)),
            rendererSettings: {
                context: ctx,
                clearCanvas: true,
                className: 'hidden',
            },
        }) as AnimationItem & { container: HTMLCanvasElement };

        console.log(animation);

        const nCanvas = animation.container;
        const ctx2 = nCanvas.getContext('2d', { willReadFrequently: true });
        if ( ctx2 == null || encodeAnimation == null ) return;

        const frames = [];
        for ( let i = 0; i < animation.totalFrames; i++ ) {
            animation.goToAndStop(i, true);
            const imageData = ctx2.getImageData(0, 0, 400, 400);
            frames.push({
                data: new Uint8Array(imageData.data),
                duration: 1000 / animation.frameRate,
            });
        }

        console.log(animation.totalFrames, frames);

        encodeAnimation(400, 400, true, frames).then(webp => {
            const blob = new Blob([ webp! ], { type: 'image/webp' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = 'animation.webp';
            a.href = url;
            a.click();
            a.remove();
        });
    }

</script>

<Card class="w-1/2">
    <CardHeader>
        <CardTitle>
            Upload Lottie Files
        </CardTitle>
    </CardHeader>
    <CardContent class="space-y-2">
        <Dropzone />
        <div class="p-2 border h-96 select-none flex flex-col justify-center">
            {#if fileBuffer.length > 0}
                <div class="text-center text-muted-foreground">Files uploaded</div>
            {:else}
                <div class="text-center text-muted-foreground">No files uploaded</div>
            {/if}
        </div>
    </CardContent>
    <CardFooter>
        <Button variant="secondary">Download All</Button>
    </CardFooter>
</Card>

<div class="w-[400px] h-[400px] hidden" id="K6BJ6iXAqCqW7bS9fpUZbKPWxC4kVVkjs8q7d4nkeN5GSvXG">
    <canvas bind:this={canvasRef} height="400" width="400"></canvas>
</div>
