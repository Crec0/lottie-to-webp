import type { AnimationItem, LottiePlayer } from 'lottie-web';
import { encodeAnimation } from '$lib/webp/index';


export type LottieBlob = {
    name: string;
    buf: ArrayBuffer;
}


function createBaseElements(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const div = document.createElement('div');
    div.style.width = `${ width }px`;
    div.style.height = `${ height }px`;
    div.style.visibility = 'hidden';

    div.appendChild(canvas);

    return { canvas, div };
}

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export function yieldToMain() {
    // @ts-ignore
    if ( globalThis.scheduler?.yield ) {
        // @ts-ignore
        return scheduler.yield();
    }

    // Fall back to yielding with setTimeout.
    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
}

/**
 * Convert Lottie animation to WebP image. The animation is rendered on a hidden canvas element.
 * Returns a URL to the WebP image.
 */
export async function convertLottie(lottie: LottiePlayer, buf: ArrayBuffer, width: number, height: number): Promise<Blob> {
    const { canvas, div } = createBaseElements(width, height);
    document.body.appendChild(div);

    const ctx = canvas.getContext('2d');
    if ( ctx == null ) throw new Error('Failed to get 2D context');

    const animation: AnimationItem & { container: HTMLCanvasElement } = lottie.loadAnimation({
        container: div,
        renderer: 'canvas',
        loop: false,
        autoplay: false,
        animationData: JSON.parse(new TextDecoder().decode(buf)),
        rendererSettings: {
            context: ctx,
            clearCanvas: true,
        },
    }) as AnimationItem & { container: HTMLCanvasElement };

    const lottieCanvas = animation.container;
    const lottieCtx = lottieCanvas.getContext('2d', { willReadFrequently: true });
    if ( lottieCtx == null ) throw new Error('Failed to get 2D context for Lottie canvas');

    const frames: { data: Uint8Array<ArrayBuffer>, duration: number }[] = [];
    const duration = 1000 / animation.frameRate;

    for ( let i = 0; i < animation.totalFrames; i++ ) {
        animation.goToAndStop(i, true);
        const imageData = lottieCtx.getImageData(0, 0, width, height);
        frames.push({ data: new Uint8Array(imageData.data), duration });
        await yieldToMain();
    }

    div.remove();

    const webpBlob = await encodeAnimation(width, height, true, frames);
    if ( webpBlob == null ) {
        throw new Error('Failed to encode WebP image');
    }

    return new Blob([ webpBlob ], { type: 'image/webp' });
}