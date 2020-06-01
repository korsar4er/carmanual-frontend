class Part {
  constructor({ name, slug, id = null }) {
    this.name = name;
    this.slug = slug;
    this.id = id;
  }
}

export default {
  state: {
    parts: [],
  },
  mutations: {
    addPart(state, payload) {
      state.parts.push(payload);
    },
    updatePart(state, payload) {
      state.parts.forEach((p) => {
        if (p.id === payload.id) {
          Object.keys(payload).forEach((key) => {
            p[key] = payload[key];
          });
        }
      });
    },
    deletePart(state, payload) {
      state.parts = state.parts.filter((p) => p.id !== payload);
    },
    setParts(state, payload) {
      state.parts = payload;
    },
  },
  actions: {
    async fetchParts({ commit }) {
      try {
        const response = await fetch(process.env.VUE_APP_API_URL + "/parts", {
          method: "GET",
        });
        if (response.ok) {
          const json = await response.json();
          const parts = json.data.map((p) => new Part(p));
          // .sort((a, b) => (a.name > b.name ? 1 : -1)
          commit("setParts", parts);
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
    async createPart({ commit, dispatch, getters }, payload) {
      try {
        await dispatch("UpdateAccessToken");
        const response = await fetch(process.env.VUE_APP_API_URL + "/part", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + getters.accessToken,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const json = await response.json();
          const newPart = new Part(json.data);
          commit("addPart", newPart);
        } else if (response.status === 409) {
          const json = await response.json();
          throw new Error(json.message);
        } else {
          console.log(response.status + " " + response.statusText);
          throw new Error(process.env.VUE_APP_ERROR_MSG);
        }
      } catch (error) {
        commit("setError", error.message);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    async updatePart({ commit, dispatch, getters }, payload) {
      try {
        await dispatch("UpdateAccessToken");
        const response = await fetch(process.env.VUE_APP_API_URL + "/part", {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + getters.accessToken,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          commit("updatePart", payload);
        } else {
          console.log(response.status + " " + response.statusText);
          throw new Error(process.env.VUE_APP_ERROR_MSG);
        }
      } catch (error) {
        commit("setError", error.message);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    async deletePart({ commit, dispatch, getters }, payload) {
      try {
        await dispatch("UpdateAccessToken");
        const response = await fetch(process.env.VUE_APP_API_URL + "/part", {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + getters.accessToken,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: payload }),
        });
        if (response.ok) {
          commit("deletePart", payload);
        } else {
          console.log(response.status + " " + response.statusText);
          throw new Error(process.env.VUE_APP_ERROR_MSG);
        }
      } catch (error) {
        commit("setError", error.message);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
  },
  getters: {
    parts(state) {
      return state.parts;
    },
    partBySlug(state) {
      return (slug) => {
        return state.parts.find((p) => p.slug === slug);
      };
    },
  },
};
