<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { getCalcLevel, nextCalcLevel, type CalcLevel, type CalcTopic } from './levels';
  import GameFrame from '../../components/GameFrame.svelte';
  import MathRenderer from '../../components/Math.svelte';
  import '../arithmetic/styles/trainer.css';

  const dispatch = createEventDispatcher();

  interface Exercise { id:string; question:string; answer:string; topic:CalcTopic; timeMs:number }

  let level: CalcLevel = getCalcLevel(1)!;
  let current: Exercise;
  let input = '';
  let inputEl: HTMLInputElement | null = null;
  let correct = 0;
  let flash = false;
  let penaltyFlash = false;
  let firstProblemOfLevel = true;
  const BASE_QUESTION_TIME = 12000;
  let questionDeadline = 0;
  let remainingMs = BASE_QUESTION_TIME;
  let raf: number; let timedOutHandled = false;
  let questionShownAt = performance.now();
  let judgementLabel = '';
  let judgementColor = '';
  let judgementId = 0;
  let start = performance.now();

  $: displayCorrect = Math.max(0, correct);

  function rand(min:number,max:number){ return Math.floor(Math.random()*(max-min+1))+min; }

  function timeFor(topic: CalcTopic){
    if(topic==='derivative-trig') return BASE_QUESTION_TIME - 2000;
    if(topic==='differential-poly') return BASE_QUESTION_TIME + 2000;
    return BASE_QUESTION_TIME;
  }

  // Generadores básicos didácticos (no CAS)
  function polyToString(coeffs:number[]):string {
    // coeffs for descending powers, e.g., [3,0,-2] -> 3x^2 - 2
    // Devuelve expresión LaTeX sin espacios superfluos
    const parts: string[] = [];
    coeffs.forEach((c,i)=>{
      const pow = coeffs.length-1-i;
      if(c===0) return;
      const sign = c>0?'+':'-';
      const abs = Math.abs(c);
      let term = '';
      if(pow===0) term = `${abs}`;
      else if(abs===1) term = `x${pow===1?'':`^{${pow}}`}`;
      else term = `${abs}x${pow===1?'':`^{${pow}}`}`;
      parts.push(`${sign} ${term}`);
    });
    let s = parts.join(' ');
    s = s.replace(/^\+\s?/,'').trim();
    return s || '0';
  }

  function derivativePoly(coeffs:number[]):number[]{
    const res: number[] = [];
    for(let i=0;i<coeffs.length-1;i++){
      const pow = coeffs.length-1-i;
      res.push(coeffs[i]*pow);
    }
    return res.length?res:[0];
  }
  function integralPoly(coeffs:number[]):string{
    const parts: string[] = [];
    for(let i=0;i<coeffs.length;i++){
      const pow = coeffs.length-1-i;
      const np = pow+1;
      const c = coeffs[i]/np;
      if(c===0) continue;
      const sign = c>0?'+':'-';
      const abs = Math.abs(c);
      parts.push(`${sign} ${abs===1? '':abs}${np===0?'':'x'}${np>1?`^{${np}}`:''}`);
    }
    const s = parts.join(' ').replace(/^\+\s/,'').trim();
    return s ? `${s} + C` : 'C';
  }

  function gen(): Exercise {
    const topic = level.topics[rand(0, level.topics.length-1)];
    if(topic==='derivative-poly'){
      const deg = rand(1,3);
      const coeffs = Array.from({length:deg+1},()=>rand(-6,6));
      if(coeffs[0]===0) coeffs[0]=rand(1,6);
      const q = `\\displaystyle \\frac{d}{dx}\left[ ${polyToString(coeffs)} \right]`;
      const ans = polyToString(derivativePoly(coeffs));
    const id = (globalThis.crypto?.randomUUID?.()) ?? Math.random().toString(36).slice(2);
    return { id, question:q, answer:ans.replace(/^\+\s?/,'').trim(), topic, timeMs: timeFor(topic) };
    }
    if(topic==='integral-poly'){
      const deg = rand(0,3);
      const coeffs = Array.from({length:deg+1},()=>rand(-5,5));
      const sumAbs = coeffs.reduce((a,c)=>a+Math.abs(c),0);
      if(sumAbs===0) coeffs[deg]=1;
      const q = `\\displaystyle \\int \! ( ${polyToString(coeffs)} ) \\; dx`;
      const ans = integralPoly(coeffs);
      return { id:Math.random().toString(36).slice(2), question:q, answer:ans, topic, timeMs: timeFor(topic) };
    }
    if(topic==='derivative-trig'){
      const opts = ['sin x','cos x','tan x'];
      const pick = opts[rand(0,opts.length-1)];
      const q = `\\displaystyle \\frac{d}{dx}\\left[ ${pick} \right]`;
      const ans = pick==='sin x' ? '\\cos x' : pick==='cos x' ? '- \\sin x' : '\\sec^{2} x';
      return { id:Math.random().toString(36).slice(2), question:q, answer:ans, topic, timeMs: timeFor(topic) };
    }
    // differential-poly
    const deg = rand(1,3);
    const coeffs = Array.from({length:deg+1},()=>rand(-5,5));
    if(coeffs[0]===0) coeffs[0]=rand(1,5);
    const fprime = derivativePoly(coeffs);
    const x0 = rand(-4,4);
    const q = `\\text{Si } y = ${polyToString(coeffs)},\\ \text{ encontrar } dy \\text{ en } x=${x0}\\ (dy = y'(x)\\,dx)`;
    const yprime = polyToString(fprime).replace(/^\+\s?/,'');
    const ans = `dy = ( ${yprime} ) \\, dx,\\ \quad y'(${x0}) = ${evalPoly(fprime, x0)}`;
  return { id:Math.random().toString(36).slice(2), question:q, answer:ans, topic:'differential-poly', timeMs: timeFor('differential-poly') };
  }

  function evalPoly(coeffs:number[], x:number){
    return coeffs.reduce((acc,c)=> acc*x + c, 0);
  }

  function next(){
    current = gen();
  if(firstProblemOfLevel){ questionDeadline = 0; remainingMs = current.timeMs; }
  else { questionDeadline = performance.now() + current.timeMs; remainingMs = current.timeMs; }
    timedOutHandled = false;
    questionShownAt = performance.now();
  }
  function init(){
    correct=0; input=''; flash=false; firstProblemOfLevel=true; start=performance.now();
    if (import.meta.env?.DEV) console.log('[calc] init level', level.id);
    next();
  }
  init();

  function applyAndValidate(raw:string){
    let val = raw.trim();
    input = val;
    if(!val) return;
    // Normalización básica para coincidencias simples
    const norm = (s:string)=> s.replace(/\s+/g,' ').replace(/\s([+\-])/g,' $1').replace(/^\+\s?/,'').trim().toLowerCase();
    if(norm(val) === norm(current.answer)){
      judgementLabel = 'correct'; judgementColor = '#BCED09'; judgementId+=1; flash=true; correct+=1; dispatch('answer',{correct:true});
      const levelComplete = correct >= level.total;
      setTimeout(()=>{
        if(levelComplete){ const nxt = nextCalcLevel(level.id); if(nxt){ level = nxt; correct = 0; firstProblemOfLevel = true; } }
        else { firstProblemOfLevel = false; }
        input=''; flash=false; next();
      }, 200);
    }
  }
  function handleChange(e:Event){ applyAndValidate((e.target as HTMLInputElement).value); }
  function handleInputKey(e:KeyboardEvent){ if(e.key==='Enter'){ applyAndValidate(input); } }

  onMount(()=>{
    setTimeout(()=>inputEl?.focus(),0);
    const tick = () => {
      if(questionDeadline>0){
        remainingMs = Math.max(0, questionDeadline - performance.now());
        if(!timedOutHandled && remainingMs<=0){
          dispatch('answer', { correct: false });
          timedOutHandled = true; correct = Math.max(0, correct-1); judgementLabel='miss'; judgementColor='#FF715B'; judgementId+=1; penaltyFlash=true; setTimeout(()=>penaltyFlash=false,250);
          firstProblemOfLevel=false; input=''; flash=false; next();
        }
  } else { remainingMs = current?.timeMs ?? BASE_QUESTION_TIME; }
      raf = requestAnimationFrame(tick);
    };
    questionDeadline = 0; raf = requestAnimationFrame(tick);
  });
  onDestroy(()=> cancelAnimationFrame(raf));
</script>

<GameFrame
  title="Cálculo"
  levelId={level.id}
  total={level.total}
  correct={displayCorrect}
  showTimer={!firstProblemOfLevel}
  remainingSeconds={remainingMs/1000}
  question={current.question}
  flash={flash}
  penalty={penaltyFlash}
  overlayLabel={judgementLabel}
  overlayColor={judgementColor}
  overlayTrigger={judgementId}
  bind:inputEl
  bind:input
  handleInput={handleChange}
  handleInputKey={handleInputKey}
>
  <span slot="footer-left"><MathRenderer expr={`\\displaystyle \\text{Time: } ${((performance.now()-start)/1000).toFixed(1)}\\,\\text{s}`}/></span>
  <span slot="footer-right">Nivel: {level.id} • Tópicos: {level.topics.length}</span>
</GameFrame>
