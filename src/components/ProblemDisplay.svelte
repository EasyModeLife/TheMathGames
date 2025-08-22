<script lang="ts">
  export let question = '';
  export let flash = false;
  export let penalty = false;
  // Overlay (juicio)
  export let overlayLabel: string = '';
  export let overlayColor: string = '';
  export let overlayTrigger: number = 0; // to restart animation
</script>

<div class="problem-wrapper">
  {#if overlayLabel}
    {#key overlayTrigger}
      <div class="judgement {overlayColor==='multi' ? 'multi' : ''}" data-label={overlayLabel}>
        {overlayLabel.toUpperCase()}
      </div>
    {/key}
  {/if}
  <div class="problem-display {flash ? 'is-correct' : ''} {penalty ? 'is-penalty' : ''}" aria-live="polite" role="heading" aria-level="1">
    {question}
  </div>
</div>

<style>
  .problem-wrapper { position:relative; height:33vh; display:flex; align-items:center; justify-content:center; }
  .problem-display { font-size:clamp(3.2rem,12vh,10rem);font-weight:700;padding:1rem 1.8rem;border-radius:28px;display:flex;align-items:center;justify-content:center;min-height:100%;text-align:center;letter-spacing:3px;background:transparent;transition:background .25s,transform .25s; text-shadow:0 4px 18px rgba(0,0,0,.55); }
  
  .judgement { position:absolute; top:.55rem; left:.8rem; font-size:clamp(1.4rem,4.4vw,3.2rem); font-weight:800; letter-spacing:3px; color:var(--judge-color, var(--text)); opacity:.18; pointer-events:none; text-shadow:0 2px 12px rgba(0,0,0,.55); animation:judgeburst .95s ease-out forwards; mix-blend-mode:screen; }
  .judgement.multi { background:linear-gradient(90deg,#FF715B,#F9CB40,#BCED09,#2F52E0,#FF715B); -webkit-background-clip:text; background-clip:text; color:transparent; background-size:400% 100%; animation:judgeburst .95s ease-out forwards, hue 2.2s linear infinite; }
  @keyframes judgeburst { 0% { transform:translateY(6px) scale(.6); opacity:.05; } 18% { transform:translateY(0) scale(1); opacity:.32; } 60% { opacity:.22; } 100% { transform:translateY(-10px) scale(.9); opacity:0; } }
  @keyframes hue { 0% { background-position:0% 50%; } 100% { background-position:100% 50%; } }
  @media (max-width:900px){ .problem-display { font-size:clamp(2.8rem,11vh,7rem); } }
  @media (max-width:600px){ .problem-wrapper { height:30vh; } .problem-display { font-size:clamp(2.2rem,12vw,5rem); letter-spacing:2px; } }
  @media (max-height:640px){ .problem-wrapper { height:30vh; } }
</style>
