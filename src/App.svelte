<script lang="ts">
  import { onMount } from 'svelte';
  import Trainer from './Trainer.svelte';
  import About from './About.svelte';

  let currentView: 'trainer' | 'about' = 'trainer';
  let flashColor = 'transparent';

  function handleHashChange() {
    const hash = window.location.hash;
    if (hash === '#/about') {
      currentView = 'about';
    } else {
      currentView = 'trainer';
    }
  }

  function handleAnswer(event: CustomEvent) {
    if (event.detail.correct) {
      flashColor = 'rgba(188, 237, 9, 0.15)'; // lime with alpha
    } else {
      flashColor = 'rgba(255, 113, 91, 0.15)'; // bittersweet with alpha
    }
    setTimeout(() => {
      flashColor = 'transparent';
    }, 250);
  }

  onMount(() => {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial route
  });
</script>

<div class="app-container">
  <main>
    <div class="flash-overlay" style="background-color: {flashColor};"></div>
    {#if currentView === 'trainer'}
      <Trainer on:answer={handleAnswer} />
    {:else if currentView === 'about'}
      <About />
    {/if}
  </main>

  <footer class="app-footer">
    <span>Ad-free and privacy-first training.</span> &bull; <a href="/#/about">About this project</a>
  </footer>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    position: relative; /* Needed for overlay stacking context */
  }
  .flash-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Allows clicking through */
    transition: background-color 0.1s ease-in-out;
    z-index: 10;
  }
  main {
    flex-grow: 1;
  position: relative; /* Overlay should cover only main, not footer */
    z-index: 1; /* Ensure main content is above default background but below overlay */
  }
  .app-footer {
    background: transparent;
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
    text-align: center;
    opacity: 0.8;
    font-size: 0.85rem;
    z-index: 1;
  }

  .app-footer a {
    color: var(--light-blue);
    text-decoration: none;
    font-weight: 500;
  }

  .app-footer a:visited {
    color: var(--off-white);
  }

  .app-footer a:hover {
    text-decoration: underline;
  }
</style>
