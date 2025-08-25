<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import katex from 'katex';
  export let expr: string = '';
  export let display: boolean = false;
  export let throwOnError: boolean = false;
  let el: HTMLSpanElement;

  function render() {
    if (!el) return;
    try {
      katex.render(expr || '', el, { displayMode: display, throwOnError });
    } catch (e) {
      // Fallback to text if render fails
      el.textContent = expr;
    }
  }

  onMount(render);
  afterUpdate(render);
</script>

<span bind:this={el} class="math-render"></span>

<style>
  .math-render { display: inline-block; color: var(--text); }
  :global(.katex) { color: var(--text); }
  :global(.katex-display) { margin: 0; color: var(--text); }
</style>
