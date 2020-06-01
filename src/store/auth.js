import { tokenExpireDate } from "../helpers/jwt.js";
import { User } from "./users";

if (
  localStorage.getItem("currentUser") &&
  new Date(localStorage.getItem("accessTokenExp")) < new Date() &&
  new Date(localStorage.getItem("refreshTokenExp")) < new Date()
) {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("accessTokenExp");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("refreshTokenExp");
}

export default {
  state: {
    currentUser: JSON.parse(localStorage.getItem("currentUser")),
    accessToken: localStorage.getItem("accessToken"),
    accessTokenExp: new Date(localStorage.getItem("accessTokenExp")),
    refreshToken: localStorage.getItem("refreshToken"),
    refreshTokenExp: new Date(localStorage.getItem("refreshTokenExp")),
    sessionIsOver: false,
  },
  mutations: {
    setCurrentUser(state, payload) {
      state.currentUser = payload;
      localStorage.setItem("currentUser", JSON.stringify(payload));
    },
    setAccessToken(state, payload) {
      state.accessToken = payload;
      state.accessTokenExp = payload ? tokenExpireDate(payload) : null;
      localStorage.setItem("accessToken", payload);
      localStorage.setItem("accessTokenExp", state.accessTokenExp);
    },
    setRefreshToken(state, payload) {
      state.refreshToken = payload;
      state.refreshTokenExp = payload ? tokenExpireDate(payload) : null;
      localStorage.setItem("refreshToken", payload);
      localStorage.setItem("refreshTokenExp", state.refreshTokenExp);
    },
    setSessionIsOver(state, payload) {
      state.sessionIsOver = payload;
    },
  },
  actions: {
    async registerUser({ commit }, { name, email, password }) {
      commit("clearError");
      commit("setLoading", true);
      try {
        const response = await fetch(
          process.env.VUE_APP_API_URL + "/registration",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: "",
              user: { name: name, email: email, password: password },
            }),
          }
        );
        if (response.ok) {
          const json = await response.json();
          return { confirmRequired: !json.user.confirmed };
        } else if (response.status === 400 || response.status === 422) {
          const json = await response.json();
          throw new Error(json.message);
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
    async loginUser({ commit }, { name, password }) {
      commit("clearError");
      commit("setLoading", true);
      try {
        const response = await fetch(process.env.VUE_APP_API_URL + "/login", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ login: name, password: password }),
        });
        if (response.ok) {
          const json = await response.json();
          commit("setCurrentUser", new User(json.user));
          commit("setAccessToken", json.access_token);
          commit("setRefreshToken", json.refresh_token);
          commit("setSessionIsOver", false);
        } else if (response.status === 401) {
          const json = await response.json();
          throw new Error(json.message);
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
    async UpdateAccessToken({ commit, state }) {
      if (state.accessTokenExp < new Date()) {
        if (state.refreshTokenExp < new Date()) {
          commit("setSessionIsOver", true);
          throw new Error("Время сессии истекло");
        } else {
          //get new access token
          try {
            const response = await fetch(
              process.env.VUE_APP_API_URL + "/tokenrefresh",
              {
                method: "POST",
                headers: {
                  Authorization: "Bearer " + state.refreshToken,
                },
              }
            );
            if (response.ok) {
              const json = await response.json();
              commit("setAccessToken", json.access_token);
            } else {
              throw new Error(
                "Неизвестная ошибка: " +
                  response.status +
                  " " +
                  response.statusText
              );
            }
          } catch (error) {
            //commit('setSessionIsOver', true)
            commit("setError", process.env.VUE_APP_ERROR_MSG);
            throw error;
          }
        }
      }
    },
    logoutUser({ commit }) {
      commit("setCurrentUser", null);
      commit("setAccessToken", null);
      commit("setRefreshToken", null);
    },
  },
  getters: {
    currentUser(state) {
      return state.currentUser;
    },
    sessionIsOver(state) {
      return state.sessionIsOver;
    },
    accessToken(state) {
      return state.accessToken;
    },
  },
};
