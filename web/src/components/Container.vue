<template>
  <v-container class="mx-auto text-center" max-width="600">
    <slot></slot>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Section extends Vue {}
</script>