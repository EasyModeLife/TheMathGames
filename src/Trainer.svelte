<script lang="ts">
  import { getLevel, nextLevel, type LevelConfig } from './levels';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import LevelProgress from './components/LevelProgress.svelte';
  import ProblemDisplay from './components/ProblemDisplay.svelte';
  import './styles/trainer.css';

  const dispatch = createEventDispatcher();

  interface Exercise { id:string; a:number; b:number; op:string; answer:number; question:string; }

  let level: LevelConfig = getLevel(1)!;
  let current: Exercise;
  let input = '';
  let inputEl: HTMLInputElement | null = null;
  let correct = 0;
  let flash = false;
  let penaltyFlash = false;
  let firstProblemOfLevel = true;
  let finished = false;
  const QUESTION_TIME = 8000;
  let questionDeadline = 0;
  let remainingMs = QUESTION_TIME;
  let raf: number; let timedOutHandled = false;
  let questionShownAt = performance.now();
  let lastResponseMs = 0;
  let judgementLabel = '';
  let judgementColor = '';
  let judgementId = 0;
  let start = performance.now();
  let showShortcuts = false;

  $: displayCorrect = correct < 0 ? 0 : correct;

  function classify(ms:number){
    if(ms===0) return {label:'—', color:'#4C5B5C'};
    if(ms<2000) return {label:'perfect', color:'multi'};
    if(ms<4000) return {label:'great', color:'#2F52E0'};
    if(ms<6000) return {label:'good', color:'#BCED09'};
    if(ms<8000) return {label:'bad', color:'#F9CB40'};
    return {label:'miss', color:'#FF715B'};
  }
  function rand(min:number,max:number){ return Math.floor(Math.random()*(max-min+1))+min; }
  function randMultiple(min:number, max:number, factor:number){
    if(factor<=1) return rand(Math.max(1, min), max);
    const start = Math.max(1, Math.ceil(min / factor));
    const end = Math.floor(max / factor);
    if(end < start) return rand(Math.max(1, min), max);
    return factor * rand(start, end);
  }
  function randNonZero(min:number, max:number){
    return rand(Math.max(1, min), max);
  }
  function gen():Exercise {
    const op: import('./levels').Op = level.ops[Math.floor(Math.random()*level.ops.length)];
    const hasMultiples = Array.isArray(level.multiples) && level.multiples!.length>0;
    const m = hasMultiples ? level.multiples![Math.floor(Math.random()*level.multiples!.length)] : 1;

    let a:number = level.min, b:number = level.min;
    if(op === '+'){
      a = hasMultiples ? randMultiple(level.min, level.max, m) : randNonZero(level.min, level.max);
      b = hasMultiples ? randMultiple(level.min, level.max, m) : randNonZero(level.min, level.max);
    } else if(op === '-'){
      a = hasMultiples ? randMultiple(level.min, level.max, m) : randNonZero(level.min, level.max);
      b = hasMultiples ? randMultiple(level.min, level.max, m) : randNonZero(level.min, level.max);
    } else if(op === 'x'){
      a = hasMultiples ? randMultiple(level.min, level.max, m) : randNonZero(level.min, level.max);
      b = hasMultiples ? randMultiple(level.min, level.max, m) : randNonZero(level.min, level.max);
    } else { // '/'
      // Ensure exact division with operands within range and a <= max, and avoid zeros
      let attempts = 0; let found=false; let r:number = 1;
      while(attempts++ < 20 && !found){
        // Prefer result r >= 1
        r = hasMultiples ? Math.max(1, randMultiple(1, Math.max(1, level.max), m)) : Math.max(1, randNonZero(1, Math.max(1, level.max)));
        const maxB = Math.min(level.max, Math.floor(level.max / r));
        if(maxB < 1){ continue; }
        b = hasMultiples ? Math.max(1, randMultiple(1, maxB, m)) : randNonZero(1, maxB);
        a = r * b;
        if(a >= 1 && a <= level.max){ found = true; }
      }
      if(!found){ // fallback simple exact division similar to previous
        b = Math.max(1, randNonZero(level.min, level.max));
        r = Math.max(1, randNonZero(level.min, level.max));
        a = r * b;
      }
    }
    const answer = op==='+'?a+b: op==='-'?a-b: op==='x'?a*b: a/b;
    return { id: (Math.random().toString(36).slice(2))+Date.now().toString(36), a,b, op, answer, question:`${a} ${op} ${b}` };
  }
  function next(){
    current = gen();
    if(firstProblemOfLevel){ questionDeadline = 0; remainingMs = QUESTION_TIME; }
    else { questionDeadline = performance.now() + QUESTION_TIME; remainingMs = QUESTION_TIME; }
    timedOutHandled = false;
    questionShownAt = performance.now();
  }
  function init(){ correct=0; input=''; flash=false; firstProblemOfLevel=true; start=performance.now(); next(); }
  init();

  function applyAndValidate(raw:string){
    if(finished) return;
    let val = raw.replace(/[^0-9\-]/g,'');
    if(val.indexOf('-')>0) val = val.replace(/-/g,'');
    input = val;
    if(!val) return;
    const num = Number(val);
    if(num === current.answer){
      lastResponseMs = performance.now() - questionShownAt;
      const cls = classify(lastResponseMs);
      judgementLabel = cls.label; judgementColor = cls.color; judgementId += 1;
      flash = true; correct += 1;
      dispatch('answer', { correct: true });
      const levelComplete = correct >= level.total;
      setTimeout(()=>{
        if(levelComplete){ const nxt = nextLevel(level.id); if(nxt){ level = nxt; correct = 0; firstProblemOfLevel = true; } }
        else { firstProblemOfLevel = false; }
        input=''; flash=false; next();
      },160);
    }
  }
  function handleChange(e:Event){ applyAndValidate((e.target as HTMLInputElement).value); }
  function handleGlobalKey(e:KeyboardEvent){
    const tag = (e.target as HTMLElement).tagName;
    if(['INPUT','TEXTAREA','SELECT'].includes(tag)){ if(e.target === inputEl) return; else return; }
    if(finished) return;
    if(e.key==='Backspace'){ input = input.slice(0,-1); applyAndValidate(input); e.preventDefault(); return; }
    if((e.key==='-'||e.key===' ') && input.length===0){ input='-'; applyAndValidate(input); e.preventDefault(); return; }
    if(/^[0-9]$/.test(e.key)){ input += e.key; applyAndValidate(input); e.preventDefault(); return; }
    if(e.key==='Escape'){ input=''; e.preventDefault(); }
  }
  function handleInputKey(e:KeyboardEvent){
  // Shift clears the input; ignore other modifier-only keys
  if (e.key === 'Shift') { e.preventDefault(); input = ''; return; }
  if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') { return; }
    if(e.key===' ' && input.length===0){ e.preventDefault(); input='-'; applyAndValidate(input);}
  }

  onMount(()=>{
    window.addEventListener('keydown', handleGlobalKey);
    setTimeout(()=>inputEl?.focus(),0);
    const tick = () => {
      if(questionDeadline>0){
        remainingMs = Math.max(0, questionDeadline - performance.now());
        if(!timedOutHandled && remainingMs<=0){
          dispatch('answer', { correct: false });
          timedOutHandled = true;
          correct -= 2;
          judgementLabel = 'miss'; judgementColor = '#FF715B'; judgementId += 1;
          penaltyFlash = true; setTimeout(()=> penaltyFlash = false, 300);
          firstProblemOfLevel = false; input=''; flash=false; next();
        }
      } else {
        remainingMs = QUESTION_TIME;
      }
      raf = requestAnimationFrame(tick);
    };
    questionDeadline = 0; raf = requestAnimationFrame(tick);
  });
  onDestroy(()=>{ window.removeEventListener('keydown', handleGlobalKey); cancelAnimationFrame(raf); });
</script>

<div class="trainer-layout">
  <div class="app-frame">
    <header class="app-header">
      <button
        class="kbd-menu-btn"
        aria-label="Keyboard shortcuts"
        aria-haspopup="dialog"
        aria-expanded={showShortcuts}
        on:click={() => showShortcuts = !showShortcuts}
        title="Keyboard shortcuts"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.8"/>
          <rect x="6" y="9" width="2" height="2" rx=".3" fill="currentColor"/>
          <rect x="9" y="9" width="2" height="2" rx=".3" fill="currentColor"/>
          <rect x="12" y="9" width="2" height="2" rx=".3" fill="currentColor"/>
          <rect x="15" y="9" width="2" height="2" rx=".3" fill="currentColor"/>
          <rect x="6" y="12" width="10" height="2" rx=".4" fill="currentColor"/>
          <rect x="17.5" y="12" width="2.5" height="2" rx=".4" fill="currentColor"/>
        </svg>
      </button>
      {#if showShortcuts}
        <div class="kbd-popover" role="dialog" aria-label="Keyboard shortcuts">
          <div class="kbd-popover__header">
            <strong>Keyboard shortcuts</strong>
            <button class="kbd-close" aria-label="Close" on:click={() => showShortcuts=false}>✕</button>
          </div>
          <ul class="kbd-list">
            <li><span class="key">0–9</span><span class="desc">Type digits to answer</span></li>
            <li><span class="key">Space</span>/<span class="key">-</span><span class="desc">Insert minus sign at start</span></li>
            <li><span class="key">Backspace</span><span class="desc">Delete last digit</span></li>
            <li><span class="key">Esc</span><span class="desc">Clear input</span></li>
            <li><span class="key">Shift</span><span class="desc">Clear input</span></li>
            <li><span class="key">Timer</span><span class="desc">First question has no timer; then 8s each</span></li>
            <li><span class="key">Penalty</span><span class="desc">Timeout subtracts 2 from progress</span></li>
          </ul>
        </div>
      {/if}
      <h1 class="main-title">The Math Games</h1>
      <LevelProgress
        levelId={level.id}
        total={level.total}
        correct={displayCorrect}
        showTimer={!firstProblemOfLevel}
        remainingSeconds={remainingMs/1000}
      />
    </header>
    <main class="app-main">
      <div class="trainer-grid">
        <ProblemDisplay
          question={current.question}
          flash={flash}
          penalty={penaltyFlash}
          overlayLabel={judgementLabel}
          overlayColor={judgementColor}
          overlayTrigger={judgementId}
        />
        <input
          class="answer-input"
          bind:this={inputEl}
          bind:value={input}
          on:input={handleChange}
          on:keydown={handleInputKey}
          autocomplete="off"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder=""
          aria-label="Answer"
        />
        <div class="footer-stats">
          <span>Time: {((performance.now()-start)/1000).toFixed(1)}s</span>
          <span>Range: {level.min}-{level.max} • Ops: {level.ops.join(' ')} </span>
        </div>
      </div>
    </main>
  </div>
</div>
 
