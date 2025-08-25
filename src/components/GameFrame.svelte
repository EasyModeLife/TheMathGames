<script lang="ts">
  import LevelProgress from '../games/arithmetic/components/LevelProgress.svelte';
  import ProblemDisplay from '../games/arithmetic/components/ProblemDisplay.svelte';
  import '../games/arithmetic/styles/trainer.css';

  // Props comunes
  export let title: string = '';
  export let levelId: number;
  export let total: number;
  export let correct: number;
  export let showTimer: boolean = false;
  export let remainingSeconds: number = 0;

  export let question: string = '';
  export let flash: boolean = false;
  export let penalty: boolean = false;
  export let overlayLabel: string = '';
  export let overlayColor: string = '';
  export let overlayTrigger: number = 0;

  // Control del input desde el padre
  export let input: string = '';
  export let inputEl: HTMLInputElement | null = null;
  export let handleInput: (e: Event) => void;
  export let handleInputKey: (e: KeyboardEvent) => void;
</script>

<div class="trainer-layout">
  <div class="app-frame">
    <header class="app-header">
      <div class="header-left">
        <slot name="header-left"></slot>
        <h1 class="main-title">{title}</h1>
      </div>
      <LevelProgress
        {levelId}
        {total}
        {correct}
        {showTimer}
        remainingSeconds={remainingSeconds}
      />
    </header>
    <main class="app-main">
      <div class="trainer-grid">
        <ProblemDisplay
          {question}
          {flash}
          penalty={penalty}
          overlayLabel={overlayLabel}
          overlayColor={overlayColor}
          overlayTrigger={overlayTrigger}
        />
        <input
          class="answer-input"
          bind:this={inputEl}
          bind:value={input}
          on:input={handleInput}
          on:keydown={handleInputKey}
          autocomplete="off"
          inputmode="text"
          aria-label="Answer"
        />
        <div class="footer-stats">
          <slot name="footer-left"></slot>
          <slot name="footer-right"></slot>
        </div>
      </div>
    </main>
  </div>
  
</div>

<style>
  .header-left { display:flex; align-items:center; gap:.5rem; }
</style>
