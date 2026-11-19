<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Phaser from 'phaser';
import { OfficeScene } from '../game/OfficeScene';

const emit = defineEmits(['canviZona' , 'aPropMonitor']); // Notificarà a App.vue quan entrem/sortim d'una sala
const contenidor = ref(null);
let game = null;

onMounted(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 640, height: 480,      // 40x30 rajoles de 16x16 px
    backgroundColor: '#0f172a',
    pixelArt: true,               // Mantenim el pixel art nítid
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 } } // IMPRESCINDIBLE: 0 gravetat en vista zenital!
    },
    parent: contenidor.value,
    scene: [OfficeScene]
  });
  game.events.on('canvi-zona', (zona) => emit('canviZona', zona));
  game.events.on('a-prop-monitor', (mon) => emit('aPropMonitor', mon));
});
onUnmounted(() => game?.destroy(true));
</script>
<template><div ref="contenidor"></div></template>
