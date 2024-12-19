<script lang="ts">
    import { UploadCloudIcon } from 'lucide-svelte';
    import { onMount } from 'svelte';


    type DragEventWithTarget = DragEvent & {
        currentTarget: EventTarget & HTMLLabelElement;
        dataTransfer: DataTransfer | null;
    };

    let dragTarget: HTMLElement | null = $state(null);
    let wrapper: HTMLDivElement | null = $state(null);

    onMount(() => {
        window.addEventListener('dragenter', (ev) => {
            if ( wrapper == null ) return;
            wrapper.setAttribute('data-shown', 'true');
            dragTarget = ev.target as HTMLElement;
        });

        window.addEventListener('dragleave', (ev) => {
            if ( wrapper == null ) return;
            console.log(ev.target, dragTarget, ev.target === dragTarget, ev.target === document);
            if ( dragTarget === ev.target || ev.target === document ) {
                wrapper.removeAttribute('data-shown');
            }
        });

        window.addEventListener('dragover', (ev) => {
            ev.preventDefault();
        });

        window.addEventListener('drop', (ev) => {
            ev.preventDefault();
            if ( wrapper == null ) return;
            wrapper.removeAttribute('data-shown');
            // dropHandler(ev);
        });
    });

    function onUpload(event: Event & { currentTarget: HTMLInputElement }) {
        const elem = event.currentTarget;
        if ( elem.files == null ) return;

        console.log('File(s) selected', elem.files);

        for ( let i = 0; i < elem.files.length; i++ ) {
            const file = elem.files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if ( result instanceof ArrayBuffer ) {
                    // fileBuffer.push(result);
                }
            };
            reader.readAsArrayBuffer(file);
        }


        event.currentTarget.value = '';
    }

</script>

<div bind:this={wrapper}
     class="invisible fixed top-0 left-0 z-50 h-full w-full select-none text-center text-4xl opacity-0 backdrop-blur-xl leading-[100vh] text-foreground data-[shown]:visible data-[shown]:opacity-50">
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