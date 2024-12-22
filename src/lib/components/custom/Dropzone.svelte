<script lang="ts">
    import { UploadCloudIcon } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import type { LottieBlob } from '$lib';


    let dragTarget: HTMLElement | null = $state(null);
    let wrapper: HTMLDivElement | null = $state(null);


    interface Props {
        fileBuffer: LottieBlob[];
    }

    const { fileBuffer = $bindable() }: Props = $props();

    function handleFiles(files: FileList) {
        fileBuffer.length = 0;

        for ( let i = 0; i < files.length; i++ ) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if ( result instanceof ArrayBuffer ) {
                    fileBuffer.push({ name: file.name, buf: result });
                }
            };
            reader.readAsArrayBuffer(file);
        }
    }

    function onUpload(event: Event & { currentTarget: HTMLInputElement }) {
        const elem = event.currentTarget;
        if ( elem.files == null ) return;

        handleFiles(elem.files);
        event.currentTarget.value = '';
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        if ( files == null ) return;
        handleFiles(files);
    }

    onMount(() => {
        window.addEventListener('dragenter', (ev) => {
            if ( wrapper == null ) return;
            wrapper.setAttribute('data-shown', 'true');
            dragTarget = ev.target as HTMLElement;
        });

        window.addEventListener('dragleave', (ev) => {
            if ( wrapper == null ) return;
            if ( dragTarget === ev.target || ev.target === document ) {
                wrapper.removeAttribute('data-shown');
            }
        });

        window.addEventListener('dragover', (ev) => ev.preventDefault());

        window.addEventListener('drop', (ev) => {
            ev.preventDefault();
            if ( wrapper == null ) return;
            wrapper.removeAttribute('data-shown');
            handleDrop(ev);
        });
    });
</script>

<div bind:this={wrapper}
     class="fixed invisible top-0 left-0 z-50 h-full w-full select-none text-center text-4xl opacity-0 backdrop-blur-sm transition-opacity duration-100 bg-background/50 leading-[100vh] text-foreground data-[shown]:opacity-100 data-[shown]:visible">
    Drop files anywhere in this window ;D
</div>

<label
    class='flex h-16 w-full cursor-pointer items-center justify-center rounded border-2 border-dashed text-xl transition-colors border-accent hover:bg-accent hover:text-accent-foreground hover:border-primary/50'
    for="lottie-input"
>
    <UploadCloudIcon class='h-8 w-8 text-muted-foreground'/>
    <span class='pl-2 text-base text-muted-foreground'>Drag and drop or Click me to browse</span>
</label>
<input
    accept=".json,.lottie"
    class='hidden'
    id="lottie-input"
    multiple
    name="lottie-input"
    onchange={onUpload}
    type='file'
/>