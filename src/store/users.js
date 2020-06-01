export class User {
  constructor({ id, name, email, roles, creation_date, disabled, confirmed }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.roles = roles.split(",");
    this.isAdmin = this.roles.includes("admin");
    this.creationDate = new Date(creation_date);
    this.disabled = disabled;
    this.confirmed = confirmed;
  }
}

export default {
  state: {
    users: [],
    roles: ["admin"],
  },
  mutations: {
    setUsers(state, payload) {
      state.users = payload;
    },
    deleteUser(state, payload) {
      state.users = state.users.filter((u) => u.id !== payload);
    },
    putUser(state, payload) {
      state.users = state.users.map((u) =>
        u.id === payload.id ? { ...u, payload } : u
      );
    },
  },
  actions: {
    async fetchUsers({ dispatch, commit, getters }) {
      commit("clearError");
      commit("setLoading", true);
      try {
        await dispatch("UpdateAccessToken");
        const response = await fetch(process.env.VUE_APP_API_URL + "/users", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + getters.accessToken,
          },
        });
        if (response.ok) {
          const json = await response.json();
          const users = json.data.map((u) => new User(u));
          commit("setUsers", users);
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
    users(state) {
      return state.users;
    },
    roles(state) {
      return state.roles;
    },
  },
};
