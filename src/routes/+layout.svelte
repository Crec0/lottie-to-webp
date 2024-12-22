<script lang="ts">
    import '../app.css';

    let { children } = $props();
</script>

<div class="bg-background">
    <div class="sticky z-50 flex w-full flex-col gap-1 border-b px-4 py-3 shadow-sm border-border/40">
        <div class="text-2xl lg:text-4xl">Lottie to Webp</div>
        <div class="text-xs lg:text-sm text-muted-foreground">Convert Lottie animation to Webp</div>
    </div>

    <div class="p-4 flex flex-col items-center justify-center">
        {@render children()}
    </div>
</div>
