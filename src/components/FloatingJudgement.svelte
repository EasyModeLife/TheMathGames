<script lang="ts">
  export let label = '';
  export let color = '#ffffff';
  export let trigger = 0; // key to restart animation
  // generate small variations for each appearance
  $: variation = ((trigger*9301)%233280)/233280; // pseudo random 0-1
  $: rot = (variation*14 - 7).toFixed(2); // -7 to 7 degrees
  $: sc = (0.95 + variation*0.15).toFixed(3); // 0.95 - 1.10
</script>

{#key trigger}
  <div class="judge {color==='multi' ? 'multi' : ''}" style="--judge-color:{color}; --rot:{rot}deg; --sc:{sc}" aria-live="off">{label.toUpperCase()}</div>
{/key}

<style>
  .judge { position:fixed; top:50%; right:4%; transform:translateY(-50%); font-size:clamp(2.6rem,8vw,5.2rem); font-weight:800; letter-spacing:4px; color:var(--judge-color); text-shadow:0 3px 16px rgba(0,0,0,.65); opacity:.14; animation:popfade .95s ease-out forwards; pointer-events:none; mix-blend-mode:screen; z-index:5000; text-align:right; }
  .judge.multi { background:linear-gradient(90deg,#ff7e7e,#ffd966,#6df18b,#6fa8dc,#d58bff,#ff7e7e); -webkit-background-clip:text; background-clip:text; color:transparent; animation:popfade .9s ease-out forwards, hue 2s linear infinite; background-size:400% 100%; }
  @keyframes hue { 0% { background-position:0% 50%; } 100% { background-position:100% 50%; } }
  @keyframes popfade { 0% { transform:translateY(-50%) scale(.55) rotate(var(--rot)); opacity:.04; } 18% { transform:translateY(calc(-50% - 6%)) scale(var(--sc)) rotate(var(--rot)); opacity:.32; } 60% { opacity:.20; } 100% { transform:translateY(calc(-50% - 14%)) scale(.85) rotate(var(--rot)); opacity:0; } }
  @media (max-width:640px){ .judge { font-size:clamp(1.4rem,12vw,2.6rem); top:2vh; } }
</style>
