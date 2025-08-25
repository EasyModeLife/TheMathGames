<script lang="ts">
  export let averageMs = 0;
  export let averageLabel = '';
  export let averageColor = '';
  export let lastResponseMs = 0;
  export let lastLabel = '';
  export let lastColor = '';
  export let answered = 0;
</script>

<div class="speed-stats">
  <div class="speed-stats__group">
    <span class="speed-stats__avg">Promedio: {(averageMs/1000).toFixed(2)}s</span>
    <span class="badge" style="--badge-color:{averageColor}">{averageLabel}</span>
    <span class="speed-stats__last-label">Última: { lastResponseMs ? (lastResponseMs/1000).toFixed(2)+'s' : '—' }</span>
    {#if lastResponseMs}
      <span class="badge" style="--badge-color:{lastColor}">{lastLabel}</span>
    {/if}
  </div>
  <div class="speed-stats__meta">
    <span><strong>{answered}</strong> correctos</span>
  </div>
</div>

<style>
  .speed-stats { display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;padding:.65rem 1rem;border:1px solid var(--border);background:var(--surface);border-radius:12px;font-size:.8rem; }
  .speed-stats__group { display:flex;flex-wrap:wrap;align-items:center;gap:.85rem; }
  .speed-stats__avg { opacity:.75; }
  .speed-stats__last-label { opacity:.55; }
  .speed-stats__meta { display:flex;gap:.75rem;font-size:.65rem;opacity:.6; }
  .badge { background:var(--badge-color);color:#fff;padding:.28rem .7rem;border-radius:999px;font-weight:600;font-size:.65rem;letter-spacing:.5px;line-height:1; }
  @media (max-width:600px){ .speed-stats { font-size:.72rem; } .badge { font-size:.6rem;padding:.25rem .55rem; } }
</style>
