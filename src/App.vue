<script setup>
  import { ref, watch, onUnmounted } from 'vue';
  import PhaserCanvas from './components/PhaserCanvas.vue';

  const zonaActiva = ref(null);
  const monitorProper = ref(null);

  const segons = ref(0);
  let temporitzador = null;

  watch(zonaActiva, (zona) => {
    if (zona && !temporitzador) {
      // Entrem a una sala: comença a comptar
      temporitzador = setInterval(() => { segons.value++; }, 1000);
    } else if (!zona) {
      // Sortim al passadís: aturem i reiniciem
      clearInterval(temporitzador);
      temporitzador = null;
      segons.value = 0;
    }
  });

  // Neteja si el component es destrueix
  onUnmounted(() => clearInterval(temporitzador));
</script>

<template>
  <main style="display: flex; gap: 20px; padding: 20px; font-family: sans-serif;">
    <PhaserCanvas @canvi-zona="zonaActiva = $event" @a-prop-monitor="monitorProper = $event"/>

    <aside style="width: 280px; background: #1e293b; color: white; padding: 18px; border-radius: 12px;">
      <h3>Estat de Proximitat</h3>
      <div v-if="zonaActiva" style="background: #065f46; border: 2px solid #10b981; padding: 14px; border-radius: 8px;">
        <strong>Dins de: {{ zonaActiva.nom }}</strong>
        <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0;">Àudio de sala actiu (llest per Fase 4)</p>
        <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0;">Temps a la sala: {{ segons }} s</p>
      </div>
      <div v-else style="background: #334155; padding: 14px; border-radius: 8px;">
        <strong>Passadís / Zona comuna</strong>
        <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">Sense conversa activa</p>
      </div>
      <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">Controls: WASD o Fletxes per moure en George.</p>
      <div v-if="monitorProper" style="margin-top: 12px; background: #1e3a8a; border: 2px solid #3b82f6; padding: 14px; border-radius: 8px;">
        <strong>A prop de: {{ monitorProper.titol }}</strong>
      </div>
    </aside>
  </main>
</template>
