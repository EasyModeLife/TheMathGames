<script lang="ts">
  import { onMount } from 'svelte';
  // Hidratación inteligente: carga diferida por ruta
  let TrainerComp: any = null;
  let CalcTrainerComp: any = null;
  let AboutComp: any = null;
  let arithLoadError: string | null = null;
  let calcLoadError: string | null = null;
  import MathRenderer from './components/Math.svelte';
  import { path, navigate } from './router';
  const MathComp: any = MathRenderer as any; // alias corto solo para tarjetas de Home

   // Estado de ruta derivado del pathname
  let currentPath = '/';
  const unsubscribe = path.subscribe(async (p) => {
    currentPath = p;
    if (import.meta.env?.DEV) console.log('[router] path', p);
    // Precarga ligera del componente según ruta
    if (p.startsWith('/arithmetic') && !TrainerComp) {
      try {
        const m = await import('./games/arithmetic/Trainer.svelte');
        TrainerComp = m.default;
        arithLoadError = null;
        if (import.meta.env?.DEV) console.log('[router] loaded arithmetic trainer');
      } catch (e:any) {
        arithLoadError = e?.message || String(e);
        console.error('[router] failed to load arithmetic trainer', e);
      }
    } else if (p.startsWith('/calculus') && !CalcTrainerComp) {
      try {
        const m = await import('./games/calculus/Trainer.svelte');
        CalcTrainerComp = m.default;
        calcLoadError = null;
        if (import.meta.env?.DEV) console.log('[router] loaded calculus trainer');
      } catch (e:any) {
        calcLoadError = e?.message || String(e);
        console.error('[router] failed to load calculus trainer', e);
      }
    } else if (p === '/about' && !AboutComp) {
      try {
        const m = await import('./About.svelte');
        AboutComp = m.default;
        if (import.meta.env?.DEV) console.log('[router] loaded about');
      } catch (e) {
        console.error('[router] failed to load about', e);
      }
    }
  });

  // Efecto de flash cuando hay respuesta correcta/incorrecta en el juego
  let flashColor = 'transparent';
  function handleAnswer(event: CustomEvent) {
    flashColor = event.detail?.correct
      ? 'rgba(188, 237, 9, 0.15)'
      : 'rgba(255, 113, 91, 0.15)';
    setTimeout(() => (flashColor = 'transparent'), 250);
  }

  // Permite volver con tecla Escape
  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', onKey);
    // Prefetch en idle para evitar estados prolongados de "Cargando…"
    const prefetch = () => {
      // Cálculo
      import('./games/calculus/Trainer.svelte')
        .then((m) => { if (!CalcTrainerComp) CalcTrainerComp = m.default; calcLoadError = null; })
        .catch((e) => { calcLoadError = e?.message || String(e); console.error('[router] prefetch calculus failed', e); });
      // Aritmética
      import('./games/arithmetic/Trainer.svelte')
        .then((m) => { if (!TrainerComp) TrainerComp = m.default; arithLoadError = null; })
        .catch((e) => { arithLoadError = e?.message || String(e); console.error('[router] prefetch arithmetic failed', e); });
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch, { timeout: 1500 });
    } else {
      setTimeout(prefetch, 400);
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      unsubscribe();
    };
  });
  function openArithmetic() { navigate('/arithmetic/game'); }
  function openCalculus() { navigate('/calculus/game'); }
  function goHome() { navigate('/'); }
  function openAbout() { navigate('/about'); }
  
   // Tamaños porcentuales para header/main/footer
  const HEADER_PCT = 12; // % de la página
  const FOOTER_PCT = 8;  // % de la página
</script>

<div class="page" style={`--header:${HEADER_PCT}%;--footer:${FOOTER_PCT}%`}>
  <header class="page-header">
    <div class="header-box">
      <div class="brand">
        {#if currentPath !== '/'}
          <button class="back" on:click={goHome} aria-label="Volver">⟵</button>
        {/if}
        <h1 class="title">The Math Games</h1>
  <small class="view-indicator" aria-live="polite">{currentPath}</small>
      </div>
      <nav class="nav">
        <a class="action" href="https://github.com/sponsors/EasyModeLife" target="_blank" rel="noopener noreferrer" title="Donar">Donar</a>
        <a class="action" href="https://github.com/EasyModeLife/RainingMath" target="_blank" rel="noopener noreferrer" title="GitHub">GitHub</a>
        <a class="action" href="/about" title="Acerca de">About</a>
      </nav>
    </div>
  </header>

  <main class="page-main">
  <div class="flash-overlay {flashColor !== 'transparent' ? 'is-visible' : ''}" style="background-color:{flashColor}"></div>
  {#if currentPath === '/'}
      <section class="games-grid" aria-label="Juegos disponibles">
        <button class="game-card" type="button" on:click={openArithmetic} on:keydown={(e)=> (e.key==='Enter'||e.key===' ') && openArithmetic()} aria-label="Entrar a Aritmética">
            <div class="game-card__media" aria-hidden="true"><MathComp expr={'\\times\\ \\div\\ +\\ -'} display={true} /></div>
          <div class="game-card__body">
            <h2 class="game-card__title">Aritmética</h2>
            <p class="game-card__desc">Practica sumas, restas, multiplicación y división con límite de tiempo y niveles crecientes.</p>
          </div>
    </button>
    <button class="game-card" type="button" on:click={openCalculus} on:keydown={(e)=> (e.key==='Enter'||e.key===' ') && openCalculus()} aria-label="Entrar a Cálculo">
          <div class="game-card__media" aria-hidden="true"><MathComp expr={'\\int \\; \\frac{d}{dx}'} display={true} /></div>
          <div class="game-card__body">
            <h2 class="game-card__title">Cálculo</h2>
            <p class="game-card__desc">Derivadas, integrales y diferenciales intro con verificación de texto.</p>
          </div>
        </button>
      </section>
    {:else if currentPath.startsWith('/arithmetic')}
      <section class="game-host" aria-label="Aritmética">
        <div class="game-section">
          <nav class="subnav" aria-label="Secciones de Aritmética">
            <div class="subnav-container">
              <ul class="subnav-list" role="list">
                <li class="subnav-item">
                  <a class="subnav-link" href="/arithmetic/game" aria-current={currentPath==='/arithmetic' || currentPath==='/arithmetic/game' ? 'page' : undefined} on:click|preventDefault={() => navigate('/arithmetic/game')}>Game</a>
                </li>
                <li class="subnav-item">
                  <a class="subnav-link" href="/arithmetic/practice" aria-current={currentPath==='/arithmetic/practice' ? 'page' : undefined} on:click|preventDefault={() => navigate('/arithmetic/practice')}>Practice</a>
                </li>
                <li class="subnav-item">
                  <a class="subnav-link" href="/arithmetic/learning" aria-current={currentPath==='/arithmetic/learning' ? 'page' : undefined} on:click|preventDefault={() => navigate('/arithmetic/learning')}>Learning</a>
                </li>
              </ul>
            </div>
          </nav>
          <div class="game-content" role="region" aria-live="polite">
            {#if currentPath === '/arithmetic' || currentPath === '/arithmetic/game'}
              {#if TrainerComp}
                <svelte:component this={TrainerComp} on:answer={handleAnswer} />
              {:else}
                {#if arithLoadError}
                  <div class="loading" role="alert">Error cargando Aritmética: {arithLoadError}</div>
                {:else}
                  <div class="loading">Cargando…</div>
                {/if}
              {/if}
            {:else if currentPath === '/arithmetic/practice'}
              {#if TrainerComp}
                <svelte:component this={TrainerComp} on:answer={handleAnswer} />
              {:else}
                {#if arithLoadError}
                  <div class="loading" role="alert">Error cargando Aritmética: {arithLoadError}</div>
                {:else}
                  <div class="loading">Cargando…</div>
                {/if}
              {/if}
            {:else}
              <div class="learning-box">
                <h2>Aprendizaje de Aritmética</h2>
                <p>Repasa conceptos clave: operaciones básicas, jerarquía de operaciones, trucos mentales.</p>
              </div>
            {/if}
          </div>
        </div>
      </section>
    {:else if currentPath.startsWith('/calculus')}
      <section class="game-host" aria-label="Cálculo">
        <div class="game-section">
          <nav class="subnav" aria-label="Secciones de Cálculo">
            <div class="subnav-container">
              <ul class="subnav-list" role="list">
                <li class="subnav-item">
                  <a class="subnav-link" href="/calculus/game" aria-current={currentPath==='/calculus' || currentPath==='/calculus/game' ? 'page' : undefined} on:click|preventDefault={() => navigate('/calculus/game')}>Game</a>
                </li>
                <li class="subnav-item">
                  <a class="subnav-link" href="/calculus/practice" aria-current={currentPath==='/calculus/practice' ? 'page' : undefined} on:click|preventDefault={() => navigate('/calculus/practice')}>Practice</a>
                </li>
                <li class="subnav-item">
                  <a class="subnav-link" href="/calculus/learning" aria-current={currentPath==='/calculus/learning' ? 'page' : undefined} on:click|preventDefault={() => navigate('/calculus/learning')}>Learning</a>
                </li>
              </ul>
            </div>
          </nav>
          <div class="game-content" role="region" aria-live="polite">
            {#if currentPath === '/calculus' || currentPath === '/calculus/game'}
              {#if CalcTrainerComp}
                <svelte:component this={CalcTrainerComp} on:answer={handleAnswer} />
              {:else}
                {#if calcLoadError}
                  <div class="loading" role="alert">Error cargando Cálculo: {calcLoadError}</div>
                {:else}
                  <div class="loading">Cargando…</div>
                {/if}
              {/if}
            {:else if currentPath === '/calculus/practice'}
              {#if CalcTrainerComp}
                <svelte:component this={CalcTrainerComp} on:answer={handleAnswer} />
              {:else}
                {#if calcLoadError}
                  <div class="loading" role="alert">Error cargando Cálculo: {calcLoadError}</div>
                {:else}
                  <div class="loading">Cargando…</div>
                {/if}
              {/if}
            {:else}
              <div class="learning-box">
                <h2>Aprendizaje de Cálculo</h2>
                <p>Derivadas básicas, reglas de integración y funciones trigonométricas.</p>
              </div>
            {/if}
          </div>
        </div>
      </section>
    {:else if currentPath === '/about'}
      <section class="game-host" aria-label="Acerca de">
  {#if AboutComp}
    <svelte:component this={AboutComp} />
  {:else}
    <div class="loading">Cargando…</div>
  {/if}
      </section>
    {:else}
      <section class="game-host" aria-label="No encontrado">
        <div class="not-found">
          <h2>404</h2>
          <p>Ruta no encontrada. <a href="/">Volver al inicio</a>.</p>
        </div>
      </section>
    {/if}
  </main>

  <footer class="page-footer">
    <p class="foot-text">Entrenamiento sin anuncios y respetuoso con tu privacidad.</p>
  </footer>
</div>

<style>
  /* Caja principal que nunca supera el viewport */
  .page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden; /* No exceder el tamaño de la caja */
    position: relative;
    background: var(--bg);
    color: var(--text);
  }

  .page-header,
  .page-footer {
    flex: 0 0 auto;
  }
  /* Header con altura máxima para móviles y mínima razonable */
  .page-header { height: clamp(56px, var(--header, 12%), 84px); }
  .page-footer { height: var(--footer, 8%); }

  /* Distribución: header (%) + main (resto) + footer (%) */
  .page-main {
    position: relative;
    flex: 1 1 auto;
    min-height: 0; /* Importante para que 100% hijos no desborden */
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr; /* contenido ocupa todo */
  }

  .header-box {
    height: 100%;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: .75rem;
    box-sizing: border-box;
    padding: .5rem .75rem;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    backdrop-filter: blur(4px);
  }
  .brand { height: 100%; display:flex; align-items:center; gap:.75rem; padding: 0 .25rem; }
  .title { font-size: clamp(1.1rem, 2.5vw, 1.6rem); margin: 0; letter-spacing: .4px; }
  .back { border:1px solid var(--border); background: var(--surface-alt); color: var(--text); border-radius: 10px; padding:.4rem .6rem; cursor: pointer; }
  .nav { display:flex; align-items:center; gap:.5rem; }
  .action {
    border:1px solid var(--border);
    background: var(--surface-alt);
    color: var(--text);
    border-radius: 10px;
    padding:.45rem .8rem;
    cursor: pointer;
    font-size:.9rem;
    text-decoration: none;
    display:inline-flex; align-items:center; gap:.4rem;
  }
  .action:hover { filter: brightness(1.1); }

  /* Overlay de feedback, limitado a main */
  .flash-overlay {
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
    transition: background-color .12s ease-in-out, opacity .12s ease-in-out;
    opacity: 0;
  }
  .flash-overlay.is-visible { opacity: 1; }

  /* Vista Home: grilla de tarjetas dentro del 100% de main */
  .games-grid {
    display: grid;
    /* Columnas de ancho fijo responsivo y centrado en desktop */
    grid-template-columns: repeat(auto-fit, minmax(240px, 320px));
    gap: clamp(.75rem, 2vw, 1rem);
    padding: clamp(.5rem, 2vw, 1rem);
    height: 100%;
    width: 100%;
    max-width: 1200px; /* centra el contenedor de tarjetas */
    margin: 0 auto;
    box-sizing: border-box;
    place-items: stretch;
    justify-content: center;
    align-content: start;
  }
  .game-card {
    display: grid;
    grid-template-rows: 1fr auto;
    width: 100%;
    max-width: 520px;
    /* Altura acotada y responsiva */
    min-height: clamp(180px, 28vh, 320px);
    max-height: clamp(220px, 36vh, 420px);
    border: 1px solid var(--border);
    border-radius: 16px;
    background: linear-gradient(155deg, var(--surface) 0%, var(--surface-alt) 80%);
    color: var(--text);
    box-shadow: 0 10px 40px -12px rgba(0,0,0,.4);
    cursor: pointer;
    overflow: hidden;
    transition: transform .15s ease, box-shadow .2s ease;
    appearance: none;
    outline: none;
    padding: 0;
    text-align: left;
  }
  .game-card:focus-visible { outline: 3px solid var(--accent-cool); outline-offset: 2px; }
  .game-card:hover { transform: translateY(-2px); box-shadow: 0 14px 60px -20px rgba(0,0,0,.55); }
  .game-card__media { display:grid; place-items:center; font-weight:800; font-size: clamp(2rem, 6vw, 4.5rem); opacity:.25; letter-spacing: .3rem; min-height: clamp(84px, 18vh, 180px); }
  .game-card__body { padding: 1rem; display:grid; gap:.25rem; align-content:start; }
  .game-card__title { margin:0; font-size: clamp(1.1rem, 2.5vw, 1.4rem); }
  .game-card__desc { margin:.25rem 0 0 0; font-size: clamp(.9rem, 2vw, 1rem); opacity:.85; }

  /* Host del juego: ocupa 100% del main sin desbordar */
  .game-host { height: 100%; width: 100%; overflow: hidden; display: grid; position: relative; z-index: 1; }
  .game-host :global(.trainer-layout) { height: 100%; }
  .game-host :global(.app-frame) { height: 100%; }

  /* Sección de juego con submenú centrado y responsivo */
  .game-section { display: grid; grid-template-rows: auto 1fr; min-height: 0; }
  .subnav { border-bottom: 1px solid var(--border); background: var(--surface); position: sticky; top: 0; z-index: 2; }
  .subnav-container { max-width: 1100px; margin: 0 auto; padding: .5rem .75rem; }
  .subnav-list { list-style: none; margin: 0; padding: 0; display: grid; grid-auto-flow: column; gap: .5rem; justify-content: center; }
  .subnav-item { display: flex; }
  .subnav-link { text-decoration:none; color: var(--text); border:1px solid var(--border); background: var(--surface-alt); padding:.5rem 1rem; border-radius: 10px; font-size: .95rem; display:inline-flex; align-items:center; gap:.4rem; }
  .subnav-link[aria-current="page"] { outline: 2px solid var(--accent-cool); font-weight: 700; }
  @media (max-width: 640px) {
    .subnav-list { grid-auto-flow: row; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .subnav-link { justify-content: center; font-size: .9rem; padding:.45rem .75rem; }
  }
  .game-content { min-height: 0; }

  .learning-box { padding: 1rem; overflow: auto; }
  .not-found { padding: 1rem; display:grid; place-content:center; text-align:center; }
  .loading { padding: 1rem; opacity: .7; }

  /* Footer */
  .page-footer { display:grid; place-items:center; }
  .foot-text { margin:0; font-size: clamp(.78rem, 1.6vw, .9rem); opacity:.85; text-align:center; padding: 0 .75rem; }

  /* Header backdrop opcional */
  .page-header { background: linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,0)); border-bottom: 1px solid rgba(255,255,255,.05); display:flex; align-items:center; padding: .4rem .5rem; box-sizing:border-box; position: relative; z-index: 10; }
  .view-indicator { margin-left:.5rem; opacity:.5; font-size:.75rem; }
</style>
