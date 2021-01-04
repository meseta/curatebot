<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-items>
    <v-btn text icon to="/"><v-icon>mdi-hand-heart</v-icon></v-btn>

    <v-btn text v-if="isAuthenticated" to="/load">Load</v-btn>
    <v-btn text v-if="isAuthenticated" to="/curate">Curate</v-btn>
    <v-btn text v-if="isAuthenticated" to="/tweets">Tweets</v-btn>
    <v-btn text v-if="isAuthenticated" to="/schedule">Schedule</v-btn>
    <v-btn text v-if="isAuthenticated" @click="logout()">Log out</v-btn>
    <v-btn v-else text @click="login()">Log in with Twitter</v-btn>
    
    </v-toolbar-items>
    <v-spacer></v-spacer>

    <v-sheet v-if="isAuthenticated" color="rgba(0,0,0,0)">
    <v-list-item
      dense 
      two-line
    >
      <v-list-item-content>
        <v-list-item-title class="text-right">{{userData.name}}</v-list-item-title>
        <v-list-item-subtitle class="text-right">@{{userData.handle}}</v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-avatar>
        <v-avatar>
          <img :src="userData.profileImage" :alt="userData.name">
        </v-avatar>
      </v-list-item-avatar>
    </v-list-item>
    </v-sheet>

  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { UserData } from '@/store/auth/types';

@Component
export default class AppBar extends Vue {
  @State('userData', { namespace: 'auth'}) userData!: UserData;
  @Action('login', { namespace: 'auth' }) login!: Function;
  @Action('logout', { namespace: 'auth' }) logout!: Function;
  @Getter('isAuthenticated', { namespace: 'auth' }) isAuthenticated!: boolean;
}
</script>