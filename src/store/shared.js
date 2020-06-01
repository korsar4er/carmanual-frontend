export default {
  state: {
    loading: false,
    error: null,
  },
  mutations: {
    setLoading(state, payload) {
      state.loading = payload;
    },
    setError(state, payload) {
      state.error = payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  actions: {
    setLoading({ commit }, payload) {
      commit("setLoading", payload);
    },
    setError({ commit }, payload) {
      commit("setError", payload);
    },
    clearError({ commit }) {
      commit("clearError");
    },
    async uploadImage(
      { commit, dispatch, getters },
      { objectType, objectId, image }
    ) {
      commit("clearError");
      commit("setLoading", true);
      try {
        await dispatch("UpdateAccessToken");
        const formData = new FormData();
        formData.append("object_type", objectType);
        formData.append("object_id", objectId);
        formData.append("image", image, image.name);
        const response = await fetch(
          process.env.VUE_APP_API_URL + "/uploadimage",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + getters.accessToken,
            },
            body: formData,
          }
        );
        if (response.ok) {
          const json = await response.json();
          if (process.env.NODE_ENV === "development") {
            return "http://localhost:5000/static/upload" + json.data;
          } else {
            return json.data;
          }
        } else {
          throw new Error(response.status + " " + response.statusText);
        }
      } catch (error) {
        commit("setError", process.env.VUE_APP_ERROR_MSG);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
  },
  getters: {
    loading(state) {
      return state.loading;
    },
    error(state) {
      return state.error;
    },
  },
};
