import router from '@/router'
import { RootState } from '@/store/types';
import { AuthState, UserData } from './types';
import { GetterTree, MutationTree, ActionTree, Module} from 'vuex';
import { firebase, firestore, auth as firebaseAuth } from '@/plugins/firebase'

const state: AuthState = {
  uid: null,
  userData: null,
  isActive: false,
}

const getters: GetterTree<AuthState, RootState> = {
  isAuthenticated (state): boolean {
    return state.uid !== null && state.userData !== null;
  }
}

const mutations: MutationTree<AuthState> = {
  setUid (state, uid: string) {
    state.uid = uid;
  },

  setUserData (state, userData: UserData) {
    state.userData = userData;
  },
  
  setActive (state, active: boolean) {
    state.isActive = active;
  },
}

const actions: ActionTree<AuthState, RootState>= {
  login({commit}) {
    const provider = new firebase.auth.TwitterAuthProvider();

    return firebaseAuth.signInWithPopup(provider)
    .then((firebaseUserCredential: firebase.auth.UserCredential) => {
      
      const uid = firebaseUserCredential?.user?.uid;
      const profile: any = firebaseUserCredential?.additionalUserInfo?.profile; // eslint-disable-line @typescript-eslint/no-explicit-any
      const credential: any = firebaseUserCredential?.credential; // eslint-disable-line @typescript-eslint/no-explicit-any

      if(!uid || !profile || !credential) {
        throw new Error('Empty credentials');
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

      return firestore.collection('users').doc(uid).set(userData, { merge: true });
    }).finally(() => {
      commit('alert/showSuccess', 'Successfully logged in', {root: true})
    }).catch((error) => {
      console.error(error);
      commit('alert/showError', 'Could not log in!', {root: true})
    });
  },

  autoLogin({commit}, firebaseUser: firebase.User) {

    const uid = firebaseUser.uid;

    return firestore.collection('users').doc(uid).get()
    .then(doc => {
      if (doc.exists) {
        commit('setUserData', doc.data());
        commit('setActive', doc.get('isActive'));
        commit('setUid', uid);
        commit('alert/showSuccess', 'Automatically logged in', {root: true})
      }
    })
  },

  logout({commit}) {
    firebaseAuth.signOut()
    commit('setUid', null);
    commit('setActive', false);
    commit('alert/showSuccess', 'Logged out', {root: true})
    router.push('/').catch(err => err);
  },

  markActive({state, commit}) {
    console.log("setting active");
    // mechanism to mark active when needed
    if (!state.isActive && state.uid) {
      return firestore.collection('users').doc(state.uid).update({
        isActive: true
      })
      .then(() => {
        commit('setActive', true);
      }).catch((error) => {
        console.error(error);
        commit('alert/showError', 'Could not set schedule active!', {root: true})
      });
    }
  }
}

export const auth: Module<AuthState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
