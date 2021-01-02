<template>
  <v-app-bar app color="primary" dark>
    <v-btn text>Link</v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class AppBar extends Vue {}
</script>