import { AuthState } from './types';
import { RootState } from '@/store/types';
import { GetterTree, MutationTree, ActionTree, Module} from 'vuex';
import { firebase, auth as firebaseAuth } from '@/plugins/firebase'

const state: AuthState = {
  user: null
}

const getters: GetterTree<AuthState, RootState> = {
  isAuthenticated (state): boolean {
    return state.user !== null && state.user !== undefined
  }
}

const mutations: MutationTree<AuthState> = {
  setUser (state, user: firebase.User) {
    state.user = user
  }
}

const actions: ActionTree<AuthState, RootState>= {
  login({commit}) {
    const provider = new firebase.auth.TwitterAuthProvider();
    console.log("start login");
    firebaseAuth.signInWithPopup(provider)
    .then((result: firebase.auth.UserCredential) => {
      console.log("logged in", result)
      commit('setUser', result.user)
    })
  },
}

export const auth: Module<AuthState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
