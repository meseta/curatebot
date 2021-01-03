import { RootState } from '@/store/types';
import { AlertState } from './types';
import { GetterTree, MutationTree, ActionTree, Module} from 'vuex';

const defaultTimeout = 6000;
const errorTimeout = 20000;

const state: AlertState = {
  message: '',
  color: 'info',
  isOpen: false,
  timeout: defaultTimeout,
}

const getters: GetterTree<AlertState, RootState> = {}

const mutations: MutationTree<AlertState> = {
  close(state) {
    state.isOpen = false;
  },
  showError(state, message: string) {
    state.isOpen = false;
    state.color = 'error';
    state.message = message;
    state.timeout = errorTimeout;
    state.isOpen = true;
  },
  showWarning(state, message: string) {
    state.isOpen = false;
    state.color = 'warning';
    state.message = message;
    state.timeout = defaultTimeout;
    state.isOpen = true;
  },
  showSuccess(state, message: string) {
    state.isOpen = false;
    state.color = 'success';
    state.message = message;
    state.timeout = defaultTimeout;
    state.isOpen = true;
  },
  showInfo(state, message: string) {
    state.isOpen = false;
    state.color = 'info';
    state.message = message;
    state.timeout = defaultTimeout;
    state.isOpen = true;
  },
}

const actions: ActionTree<AlertState, RootState>= {}

export const alert: Module<AlertState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
