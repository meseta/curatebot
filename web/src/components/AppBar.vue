<template>
  <v-app-bar app flat color="primary">

    
    <v-toolbar-items v-if="isAuthenticated">
      <v-btn text to="/">
        <v-icon :left="!collapse">mdi-home</v-icon>
        <span v-if="!collapse">Home</span>
      </v-btn>
      <v-btn
        v-for="item in menu"
        :key="item.text"
        :to="item.to"
        text
      >
        <v-icon :left="!collapse">{{ item.icon }}</v-icon>
        <span v-if="!collapse">{{ item.text }}</span>
      </v-btn>
      <v-btn text @click="logout()">
        <v-icon :left="!collapse">mdi-exit-to-app</v-icon>
        <span v-if="!collapse">Logout</span>
      </v-btn>
    </v-toolbar-items>
    <v-toolbar-items v-else>
      <v-btn text to="/">
        <v-icon left>mdi-home</v-icon>
        Home
      </v-btn>
      <v-btn text @click="login()">
        <v-icon left>mdi-account</v-icon>
        Log in with Twitter
      </v-btn>
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
import { namespace } from 'vuex-class';
import { UserData } from '@/store/auth/types';

const authModule = namespace('auth');

@Component
export default class AppBar extends Vue {
  @authModule.State userData!: UserData;
  @authModule.Action login!: Function;
  @authModule.Action logout!: Function;
  @authModule.Getter isAuthenticated!: boolean;

  menu = [
    {text: "Load", to: "/load", icon:"mdi-upload"},
    {text: "Curate", to: "/curate", icon:"mdi-hand-heart"},
    {text: "Tweets", to: "/tweets", icon:"mdi-view-list"},
    {text: "Schedule", to: "/schedule", icon:"mdi-av-timer"},
  ]

  get collapse() {
    return this.$vuetify.breakpoint.smAndDown;
  }
}
</script>