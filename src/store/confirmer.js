const initialState = {
  active: false,
  title: "Подтвердить действие",
  body: "",
  resolve: null,
  reject: null,
};

export default {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    activate(state, { body, resolve, reject }) {
      state.active = true;
      state.body = body;
      state.resolve = resolve;
      state.reject = reject;
    },
    deactivate(state) {
      state.active = false;
      state.body = "";
      state.resolve = null;
      state.reject = null;
    },
  },
  actions: {
    ask({ commit }, body) {
      return new Promise((resolve, reject) => {
        commit("activate", {
          body,
          resolve,
          reject,
        });
      });
    },
  },
};
