<template>
  <v-app id="main">
    <AppBar />

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <Alerts />
    <v-footer app dark padless>
      <v-col class="text-center py-1 grey--text body-2">
      &copy; {{year}} CurateBot by Yuan Gao
      <a href="https://twitter.com/mesetatron" class="grey--text text--lighten-1">@mesetatron</a> - 
      <a href="https://github.com/meseta/curatebot" class="grey--text text--lighten-1">visit on GitHub</a>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import AppBar from '@/components/AppBar.vue'
import Alerts from '@/components/Alerts.vue'

@Component({ components: { AppBar, Alerts } })
export default class AppView extends Vue {
  year = new Date().getFullYear();
}
</script>

<style scoped>
#main {
  background-color: #333;
}
</style>