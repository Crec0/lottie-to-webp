import type { Nullable, WebPAnimationFrame } from './types';
// @ts-ignore
import Module from './webp-wasm';
import { yieldToMain } from '$lib';

export const encodeAnimation = async (
    width: number,
    height: number,
    hasAlpha: boolean,
    frames: WebPAnimationFrame[],
): Promise<Nullable<Uint8Array>> => {
    await yieldToMain();
    const moduleCC = await Module();
    await yieldToMain();
    const durations: number[] = [];
    const dataLength = frames.reduce((acc, frame) => {
        acc += frame.data.length;
        return acc;
    }, 0);
    const data: Uint8Array = new Uint8Array(dataLength);
    let offset = 0;
    frames.forEach((frame) => {
        data.set(frame.data, offset);
        offset += frame.data.length;
        durations.push(frame.duration);
    });
    await yieldToMain();
    return moduleCC.encodeAnimation(width, height, hasAlpha, durations, data);
};
