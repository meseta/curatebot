<template>
  <v-card
    class="my-4 mx-auto"
    max-width="860"
  >
    <v-card-title class="primary white--text mb-5">
      <slot name="title"></slot>
    </v-card-title>

    <v-card-text>
      <slot></slot>
    </v-card-text>

  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Section extends Vue {}
</script>