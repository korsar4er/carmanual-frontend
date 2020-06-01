class Doc {
  constructor({
    id = null,
    name = "",
    slug = null,
    text = "",
    approved = null,
    creator_id = null,
    creator = { name: "" },
    car_id = null,
    car = null,
    part_id = null,
    part = null,
  }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.text = text;
    this.approved = approved;
    this.creator_id = creator_id;
    this.creator = creator;
    this.car_id = car_id;
    this.car = car;
    this.part_id = part_id;
    this.part = part;
  }
}

export default {
  namespaced: true,
  state: {
    list: [],
    page: [],
    doc: null,
    editDialog: false,
  },
  mutations: {
    setList(state, payload) {
      state.list = payload;
    },
    setPage(state, payload) {
      state.page = payload;
    },
    setTotal(state, payload) {
      state.total = payload;
    },
    setDoc(state, payload) {
      state.doc = payload;
    },
    setEditDialog(state, payload) {
      state.editDialog = payload;
    },
  },
  actions: {
    async openEditDialog({ commit, dispatch }, payload) {
      if (payload) {
        await dispatch("fetchDocById", payload);
      }
      commit("setEditDialog", true);
    },
    closeEditDialog({ commit }) {
      commit("setEditDialog", false);
      commit("setDoc", null);
    },
    async fetchList({ commit }, payload) {
      commit("clearError", null, { root: true });
      commit("setLoading", true, { root: true });
      try {
        const response = await fetch(
          process.env.VUE_APP_API_URL +
            `/docs?approved=true&car_slug=${payload}`,
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const json = await response.json();
          const docs = json.data.map((d) => new Doc(d));
          // .sort((a, b) => (a.name > b.name ? 1 : -1)
          commit("setList", docs);
        } else {
          throw new Error(response.status + " " + response.statusText);
        }
      } catch (error) {
        commit("setError", process.env.VUE_APP_ERROR_MSG, { root: true });
        throw error;
      } finally {
        commit("setLoading", false, { root: true });
      }
    },
    async fetchPage(
      { commit },
      { page, perPage, approved = null, creatorId = null }
    ) {
      // by page, perPage, creatorId, approved, car.slug
      commit("clearError", null, { root: true });
      commit("setLoading", true, { root: true });
      let url =
        process.env.VUE_APP_API_URL + `/docs?page=${page}&per_page=${perPage}`;
      if (approved !== null) {
        url += `&approved=${approved}`;
      }
      if (creatorId) {
        url += `&creator_id=${creatorId}`;
      }
      try {
        const response = await fetch(url, { method: "GET" });
        if (response.ok) {
          const json = await response.json();
          const docs = json.data.map((d) => new Doc(d));
          // .sort((a, b) => (a.name > b.name ? 1 : -1)
          commit("setPage", docs);
          return json.total;
        } else {
          throw new Error(response.status + " " + response.statusText);
        }
      } catch (error) {
        commit("setError", process.env.VUE_APP_ERROR_MSG, { root: true });
        throw error;
      } finally {
        commit("setLoading", false, { root: true });
      }
    },
    async fetchDocById({ commit }, payload) {
      commit("clearError", null, { root: true });
      commit("setLoading", true, { root: true });
      try {
        const response = await fetch(
          process.env.VUE_APP_API_URL + "/doc/" + payload,
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const json = await response.json();
          const doc = new Doc(json.data);
          commit("setDoc", doc);
        } else {
          throw new Error(response.status + " " + response.statusText);
        }
      } catch (error) {
        commit("setError", process.env.VUE_APP_ERROR_MSG, { root: true });
        throw error;
      } finally {
        commit("setLoading", false, { root: true });
      }
    },
    async edit({ commit, dispatch, rootGetters }, { doc, isCreate }) {
      commit("clearError", null, { root: true });
      commit("setLoading", true, { root: true });
      try {
        await dispatch("UpdateAccessToken", null, { root: true });
        const response = await fetch(process.env.VUE_APP_API_URL + "/doc", {
          method: isCreate ? "POST" : "PUT",
          headers: {
            Authorization: "Bearer " + rootGetters["accessToken"],
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(doc),
        });
        if (response.ok) {
          //
        } else if (response.status === 409) {
          const json = await response.json();
          throw new Error(json.message);
        } else {
          console.log(response.status + " " + response.statusText);
          throw new Error(process.env.VUE_APP_ERROR_MSG);
        }
      } catch (error) {
        commit("setError", error.message, { root: true });
        throw error;
      } finally {
        commit("setLoading", false, { root: true });
      }
    },
    async delete({ commit, dispatch, rootGetters }, payload) {
      commit("clearError", null, { root: true });
      commit("setLoading", true, { root: true });
      try {
        await dispatch("UpdateAccessToken", null, { root: true });
        const response = await fetch(
          process.env.VUE_APP_API_URL + "/doc/" + payload,
          {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + rootGetters["accessToken"],
            },
          }
        );
        if (response.ok) {
          //
        } else {
          console.log(response.status + " " + response.statusText);
          throw new Error(process.env.VUE_APP_ERROR_MSG);
        }
      } catch (error) {
        commit("setError", error.message, { root: true });
        throw error;
      } finally {
        commit("setLoading", false, { root: true });
      }
    },
    async approve({ commit, dispatch, rootGetters }, payload) {
      commit("clearError", null, { root: true });
      commit("setLoading", true, { root: true });
      try {
        await dispatch("UpdateAccessToken", null, { root: true });
        const response = await fetch(
          process.env.VUE_APP_API_URL + "/docapprove/" + payload,
          {
            method: "PUT",
            headers: {
              Authorization: "Bearer " + rootGetters["accessToken"],
            },
          }
        );
        if (response.ok) {
          //
        } else {
          console.log(response.status + " " + response.statusText);
          throw new Error(process.env.VUE_APP_ERROR_MSG);
        }
      } catch (error) {
        commit("setError", error.message, { root: true });
        throw error;
      } finally {
        commit("setLoading", false, { root: true });
      }
    },
    async fetchDocBySlug({ commit }, { docSlug, carSlug, partSlug }) {
      commit("clearError", null, { root: true });
      commit("setLoading", true, { root: true });
      try {
        const args = `doc_slug=${docSlug}&car_slug=${carSlug}&part_slug=${partSlug}`;
        const response = await fetch(
          process.env.VUE_APP_API_URL + "/doc?" + args,
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const json = await response.json();
          const doc = new Doc(json.data);
          commit("setDoc", doc);
        } else {
          throw new Error(response.status + " " + response.statusText);
        }
      } catch (error) {
        commit("setError", process.env.VUE_APP_ERROR_MSG, { root: true });
        throw error;
      } finally {
        commit("setLoading", false, { root: true });
      }
    },
  },
  getters: {
    list(state) {
      return state.list;
    },
    page(state) {
      return state.page;
    },
    doc(state) {
      return state.doc;
    },
    editDialog(state) {
      return state.editDialog;
    },
    docId(state) {
      return state.docId;
    },
  },
};
