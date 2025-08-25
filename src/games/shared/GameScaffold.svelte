<script lang="ts">
  import LevelProgress from '../arithmetic/components/LevelProgress.svelte';
  import ProblemDisplay from '../arithmetic/components/ProblemDisplay.svelte';

  export let title: string = '';
  export let levelId: number;
  export let total: number;
  export let correct: number;
  export let showTimer: boolean = true;
  export let remainingSeconds: number = 0;

  // Props para la caja de pregunta y overlay
  export let question: string = '';
  export let flash: boolean = false;
  export let penalty: boolean = false;
  export let overlayLabel: string = '';
  export let overlayColor: string = '';
  export let overlayTrigger: number = 0;
</script>

<div class="trainer-layout">
  <div class="app-frame">
    <header class="app-header">
      <slot name="headerExtras"></slot>
      <h1 class="main-title">{title}</h1>
      <LevelProgress
        levelId={levelId}
        total={total}
        correct={correct}
        showTimer={showTimer}
        remainingSeconds={remainingSeconds}
      />
    </header>
    <main class="app-main">
      <div class="trainer-grid">
        <ProblemDisplay
          question={question}
          flash={flash}
          penalty={penalty}
          overlayLabel={overlayLabel}
          overlayColor={overlayColor}
          overlayTrigger={overlayTrigger}
        />
        <slot name="answer"></slot>
        <slot name="footer"></slot>
      </div>
    </main>
  </div>
  </div>

<!--
  Nota: Los estilos provienen de games/arithmetic/styles/trainer.css
  y se importan en cada Trainer. Este scaffold solo estructura.
-->
