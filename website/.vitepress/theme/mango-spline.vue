<template>
  <div class="hero-image">
    <component is="script" type="module" src="https://unpkg.com/@splinetool/viewer@1.0.26/build/spline-viewer.js">
    </component>
    <spline-viewer url="https://prod.spline.design/Euxdcvrq-ckcfbgc/scene.splinecode"></spline-viewer>
  </div>
</template>

<style>
.hero-image {
  max-height: 400px;
  height: 400px;
}
</style>

<script>
let interval = setInterval(() => {
  const splineView = document.querySelector('spline-viewer');

  if (splineView.shadowRoot.querySelector('#logo')) {
    splineView.shadowRoot.querySelector('#logo').style.display = 'none';
    clearInterval(interval);
  }
}, 300);
</script>
