<template>
  <v-card
    class="my-4 mx-auto"
    max-width="600"
  >
    <v-card-title v-if="hasTitle()" class="primary white--text mb-5">
      <slot name="title"></slot>
    </v-card-title>

    <v-card-text>
      <slot></slot>
    </v-card-text>

    <v-card-actions v-if="hasActions()">
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Section extends Vue {
  hasTitle() {
    return !!this.$slots.title;
  }
  hasActions() {
    return !!this.$slots.actions;
  }
}
</script>