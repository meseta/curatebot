import { firebase } from '@/plugins/firebase'

export interface AuthState {
  user: firebase.User | null
}
