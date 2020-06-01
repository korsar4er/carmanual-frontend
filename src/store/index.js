import Vue from 'vue'
import Vuex from 'vuex'
import shared from './shared'
import users from './users'
import auth from './auth'
import confirmer from './confirmer'
import cars from './cars'
import parts from './parts'
import docs from './docs'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    shared,
    users,
    auth,
    confirmer,
    cars,
    parts,
    docs
  }
})
