<script lang="ts">

    import { Button } from '$lib/components/ui/button';
    import type { LottiePlayer } from 'lottie-web';
    import { Input } from '$lib/components/ui/input';
    import { Link2, LoaderCircle } from 'lucide-svelte';
    import { cn } from '$lib/utils';
    import { convertLottie, yieldToMain } from '$lib';

    interface Props {
        name: string;
        lottiePlayer: LottiePlayer | null;
        buf: ArrayBuffer;
    }

    const Status = {
        'Idle': 'idle',
        'Converting': 'converting',
        'Done': 'done',
        'Error': 'error',
    };

    const { name, buf, lottiePlayer }: Props = $props();

    let width = $state(400);
    let height = $state(400);
    let linked = $state(true);
    let status = $state(Status.Idle);
    let linkNodeRef: HTMLAnchorElement | null = $state(null);

    let blobUrl = '';

    const handleLinkClick = () => {
        linked = !linked;
        if ( linked ) {
            height = +width;
        }
    };

    const handleWidthChange = (e: Event) => {
        if ( !linked ) return;
        const target = e.target as HTMLInputElement;
        height = parseInt(target.value);
    };

    const convert = async () => {
        await yieldToMain();

        if ( lottiePlayer == null ) {
            status = Status.Error;
            console.error('Lottie player not initialized');
            return;
        }

        convertLottie(lottiePlayer, buf, width, height)
            .then(async (blob) => {
                status = Status.Done;

                await yieldToMain();

                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${ name }.webp`;
                a.style.visibility = 'hidden';
                a.classList.add('trash-to-be-cleaned-up');
                document.body.appendChild(a);
                linkNodeRef = a;
            })
            .catch((error) => {
                status = Status.Error;
                console.error(error);
            });
    };

    const handleConvertClick = async () => {
        if ( status === Status.Converting ) return;

        if ( status === Status.Done ) {
            await yieldToMain();
            linkNodeRef?.click();
            return;
        }

        await yieldToMain();

        URL.revokeObjectURL(blobUrl);
        status = Status.Converting;

        await convert();
    };
</script>

<div class="flex items-center gap-2 rounded border px-3 py-2 border-muted flex-row flex-wrap w-full">
    <span class="grow truncate">{name}</span>

    <div class="flex flex-wrap flex-row gap-2">
        <Input bind:value={width} class="w-16 yeet" disabled={status === Status.Converting} minvalue="20"
               onchange={handleWidthChange}
               type="number"/>

        <Link2 class={cn("cursor-pointer rounded p-2 hover:bg-muted", linked ? "bg-muted" : "")} onclick={handleLinkClick}
               size={36}/>

        <Input bind:value={height} class="w-16" disabled={linked || status === Status.Converting} minvalue="20"
               type="number"/>

        <Button class="min-w-28" disabled={status === Status.Converting} onclick={handleConvertClick} variant="default">
            {#if status === Status.Idle}
                Convert
            {:else if status === Status.Converting}
                <LoaderCircle size={24} class="animate-spin"/>
            {:else if status === Status.Done}
                Download
            {:else}
                Error
            {/if}
        </Button>
    </div>

</div>
