<template>
  <v-app>
    <AppBar />

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <Alerts />
    <!-- <v-footer app>
    </v-footer> -->
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import AppBar from '@/components/AppBar.vue'
import Alerts from '@/components/Alerts.vue'

@Component({ components: { AppBar, Alerts } })
export default class AppView extends Vue {}
</script>
