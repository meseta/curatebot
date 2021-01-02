<template>
  <v-app-bar app color="primary" dark>
    <v-btn text v-if="isAuthenticated">Logged in</v-btn>
    <v-btn text v-else v-on:click="login()">Log in with Twitter</v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

@Component
export default class AppBar extends Vue {
  @Action('login', { namespace: 'auth' }) login!: Function;
  @Getter('isAuthenticated', { namespace: 'auth' }) isAuthenticated!: boolean;
}
</script>