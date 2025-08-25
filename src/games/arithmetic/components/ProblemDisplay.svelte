<script lang="ts">
  import MathRenderer from '../../../components/Math.svelte';
  import { onMount, tick } from 'svelte';
  export let question = '';
  export let flash = false;
  export let penalty = false;
  // Overlay (juicio)
  export let overlayLabel: string = '';
  export let overlayColor: string = '';
  export let overlayTrigger: number = 0; // to restart animation

  // Ajuste automático de tamaño para que la expresión quepa en la caja
  let containerEl: HTMLDivElement;
  let fitboxEl: HTMLDivElement;
  let scale = 1; // escala aplicada a la expresión
  let renderExpr = '';
  let usedMultiline = false;
  let lastQuestion = '';
  let fitQueued = false;
  let isFitting = false;

  // Intenta partir una expresión en 2 líneas, insertando \\ en un punto razonable
  function breakIntoTwoLines(latex: string): string | null {
    // Heurística simple: si hay varios términos separados por + o -, partir cerca de la mitad
    // Nota: mantenemos el latex intacto, solo insertamos " \\ " entre términos
    // Tokenizamos por espacios para identificar + y - como tokens independientes
    const tokens = latex.split(/\s+/);
    const operatorIdxs: number[] = [];
    for (let i = 1; i < tokens.length - 1; i++) {
      const t = tokens[i];
      if (t === '+' || t === '-' || t === '\\pm') operatorIdxs.push(i);
    }
    if (operatorIdxs.length === 0) return null;
    // Elegimos operador alrededor de la mitad
    const breakOpIndex = operatorIdxs[Math.floor(operatorIdxs.length / 2)];
    // Insertamos salto de línea ANTES del operador elegido si hay contexto suficiente
    const out: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (i === breakOpIndex) out.push('\\\\');
      out.push(tokens[i]);
    }
    // Envolver en aligned para alinear lineas múltiples cuando use displayMode
    return `\\begin{aligned} ${out.join(' ')} \\end{aligned}`;
  }

  async function fit() {
    if (isFitting) return; // evita reentradas
    isFitting = true;
    if (question !== lastQuestion) {
      renderExpr = question;
      usedMultiline = false;
      lastQuestion = question;
    }
    await tick(); // esperar a que KaTeX renderice
    if (!containerEl || !fitboxEl) return;

    const maxWidth = containerEl.clientWidth - 16; // padding margen
    const maxHeight = containerEl.clientHeight - 12;
    const measure = () => fitboxEl.getBoundingClientRect();
    let rect = measure();
    if (rect.width === 0 || rect.height === 0) return;
    // Medir dimensiones no escaladas (rect ya incluye la escala actual)
    const unscaledW = rect.width / (scale || 1);
    const unscaledH = rect.height / (scale || 1);
    let s = Math.min(maxWidth / unscaledW, maxHeight / unscaledH, 1);

    // Si la escala requerida es demasiado pequeña, probamos dos líneas
  if (s < 0.78) {
      const broken = breakIntoTwoLines(question);
      if (broken) {
        renderExpr = broken;
        usedMultiline = true;
        await tick();
        rect = measure();
        const unW2 = rect.width / (scale || 1);
        const unH2 = rect.height / (scale || 1);
        s = Math.min(maxWidth / unW2, maxHeight / unH2, 1);
      }
    }
    // Redondeo suave para evitar jitter
    const nextScale = Math.max(0.55, Math.min(1, Number(s.toFixed(3))));
    if (Math.abs(nextScale - scale) > 0.001) {
      scale = nextScale;
    }
    isFitting = false;
  }

  function scheduleFit(){
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(async ()=>{ fitQueued = false; await fit(); });
  }

  onMount(() => {
    scheduleFit();
    const onResize = () => scheduleFit();
    window.addEventListener('resize', onResize);
    let ro: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => scheduleFit());
      if (containerEl) ro.observe(containerEl);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  });

  // Reajustar cuando cambie la pregunta
  $: if (question !== lastQuestion) { scheduleFit(); }
</script>

<div class="problem-wrapper">
  {#if overlayLabel}
    {#key overlayTrigger}
      <div class="judgement {overlayColor==='multi' ? 'multi' : ''}" data-label={overlayLabel}>
        {overlayLabel.toUpperCase()}
      </div>
    {/key}
  {/if}
  <div
    class="problem-display {flash ? 'is-correct' : ''} {penalty ? 'is-penalty' : ''}"
    bind:this={containerEl}
    aria-live="polite" role="heading" aria-level="1"
  >
    <div class="fitbox" bind:this={fitboxEl} style={`--scale:${scale}`}> 
      <MathRenderer expr={renderExpr || question} display={true} />
    </div>
  </div>
  
</div>

<style>
  .problem-wrapper { position:relative; height:33vh; display:flex; align-items:center; justify-content:center; }
  .problem-display { 
    font-weight:700;
    /* Base grande pero controlada por escala */
    font-size: 10rem; 
    padding:1rem 1.2rem;
    border-radius:28px;
    display:flex; align-items:center; justify-content:center;
    min-height:100%; width:100%;
    text-align:center; letter-spacing:2px; background:transparent;
    transition:background .25s, transform .25s;
    text-shadow:0 4px 18px rgba(0,0,0,.55);
    overflow: visible;
    box-sizing: border-box;
  }
  .fitbox { 
    transform: scale(var(--scale, 1));
    transform-origin: center center;
    /* Evitar cortes de KaTeX al escalar */
    will-change: transform;
  }
  
  .judgement { position:absolute; top:.55rem; left:.8rem; font-size:clamp(1.4rem,4.4vw,3.2rem); font-weight:800; letter-spacing:3px; color:var(--judge-color, var(--text)); opacity:.18; pointer-events:none; text-shadow:0 2px 12px rgba(0,0,0,.55); animation:judgeburst .95s ease-out forwards; mix-blend-mode:screen; }
  .judgement.multi { background:linear-gradient(90deg,#FF715B,#F9CB40,#BCED09,#2F52E0,#FF715B); -webkit-background-clip:text; background-clip:text; color:transparent; background-size:400% 100%; animation:judgeburst .95s ease-out forwards, hue 2.2s linear infinite; }
  @keyframes judgeburst { 0% { transform:translateY(6px) scale(.6); opacity:.05; } 18% { transform:translateY(0) scale(1); opacity:.32; } 60% { opacity:.22; } 100% { transform:translateY(-10px) scale(.9); opacity:0; } }
  @keyframes hue { 0% { background-position:0% 50%; } 100% { background-position:100% 50%; } }
  @media (max-width:900px){ .problem-display { font-size: 7rem; } }
  @media (max-width:600px){ .problem-wrapper { height:30vh; } .problem-display { font-size: 5rem; letter-spacing:1.5px; } }
  @media (max-height:640px){ .problem-wrapper { height:30vh; } }
</style>
