<script lang="ts">
  import MathRenderer from '../../../components/Math.svelte';
  export let levelId: number;
  export let total: number;
  export let correct: number;
  export let showTimer: boolean;
  export let remainingSeconds: number;
  const palette = ['#2F52E0','#BCED09','#F9CB40','#FF715B','#4C5B5C'];
  function levelColor(l:number){ return palette[l % palette.length]; }
  $: levelExpr = `\\text{Level } ${levelId}`;
  $: timeExpr = `\\displaystyle ${remainingSeconds.toFixed(1)}\\,\\text{s}`;
  $: countExpr = `\\displaystyle \\frac{${Math.max(0, correct)}}{${total}}`;
</script>

<div class="level-progress">
  <div class="level-progress__label"><MathRenderer expr={levelExpr} /></div>
  <div class="level-progress__bar">
    <div class="level-progress__segments">
      {#each Array(total) as _, i}
        <div class="level-progress__segment" style="--seg-color:{i < correct ? levelColor(levelId) : 'transparent'}"></div>
      {/each}
    </div>
    {#if showTimer}
  <div class="level-progress__timer" aria-label="Remaining seconds"><MathRenderer expr={timeExpr} /></div>
    {/if}
  </div>
  <div class="level-progress__count"><MathRenderer expr={countExpr} /></div>
  
</div>

<style>
  .level-progress { display:flex;align-items:center;gap:1.2rem;flex-wrap:wrap; }
  .level-progress__label { font-size:1rem;opacity:.8;min-width:92px;font-weight:600;letter-spacing:.5px; }
  .level-progress__bar { flex:1;position:relative;height:32px;background:var(--bar-bg);border:2px solid var(--border);border-radius:14px;overflow:hidden; }
  .level-progress__segments { position:absolute;inset:0;display:flex; }
  .level-progress__segment { flex:1;margin:2px;background:var(--seg-color);transition:background .25s,border-radius .25s; border-radius:10px; }
  .level-progress__timer { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:700;color:#fff;opacity:.6;pointer-events:none;letter-spacing:1px; }
  .level-progress__count { font-size:.85rem;opacity:.7;font-weight:600; }
  @media (max-width:820px){ .level-progress__bar { height:26px; } .level-progress__label { font-size:.9rem; } .level-progress__timer { font-size:.75rem; } }
  @media (max-width:560px){ .level-progress { gap:.8rem; } .level-progress__bar { height:22px; } .level-progress__segment { margin:1px; } .level-progress__label { font-size:.78rem; } .level-progress__count { font-size:.7rem; } }
  @media (max-width:600px){
    .level-progress__label { font-size:.7rem; }
    .level-progress__count { font-size:.6rem; }
    .level-progress__timer { font-size:.58rem; }
  }
</style>
