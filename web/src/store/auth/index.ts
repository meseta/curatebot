import router from '@/router'
import { RootState } from '@/store/types';
import { AuthState, UserData } from './types';
import { GetterTree, MutationTree, ActionTree, Module} from 'vuex';
import { firebase, firestore, auth as firebaseAuth } from '@/plugins/firebase'

const state: AuthState = {
  uid: null,
  userData: null,
}

const getters: GetterTree<AuthState, RootState> = {
  isAuthenticated (state): boolean {
    return state.uid !== null && state.userData !== null;
  },
  test(state): string {
    return "hello";
  }
}

const mutations: MutationTree<AuthState> = {
  setUid (state, uid: string) {
    state.uid = uid;
  },
  setUserData (state, userData: UserData) {
    state.userData = userData;
  },
}

const actions: ActionTree<AuthState, RootState>= {
  login({commit}) {
    const provider = new firebase.auth.TwitterAuthProvider();
    console.log("start login");
    firebaseAuth.signInWithPopup(provider)
    .then((firebaseUserCredential: firebase.auth.UserCredential) => {
      
      const uid = firebaseUserCredential?.user?.uid;
      const profile: any = firebaseUserCredential?.additionalUserInfo?.profile; // eslint-disable-line @typescript-eslint/no-explicit-any
      const credential: any = firebaseUserCredential?.credential; // eslint-disable-line @typescript-eslint/no-explicit-any

      if(!uid || !profile || !credential) {
        throw new Error();
      }

      const userData: UserData = {
        profileImage: profile.profile_image_url_https,
        name: profile.name,
        handle: profile.screen_name,
        id: profile.id_str,
        accessToken: credential.accessToken,
        secret: credential.secret
      }
      commit('setUid', uid);
      commit('setUserData', userData);

      return firestore.collection("users").doc(uid).set(userData, { merge: true });
    }).catch((error) => {
      console.error(error);
    });
  },
  autoLogin({commit}, firebaseUser: firebase.User) {
    commit('setUid', firebaseUser.uid);
  },
  logout({commit}) {
    firebase.auth().signOut()
    commit('setUid', null);
    router.push('/').catch(err => err);
  },
}

export const auth: Module<AuthState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
