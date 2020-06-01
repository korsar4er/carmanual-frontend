class Car {
  constructor({
    name,
    slug,
    img_src = null,
    approved,
    creator_id,
    creator,
    id = null,
  }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.img_src =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000/static/upload" + img_src
        : img_src;
    this.approved = approved;
    this.creator_id = creator_id;
    this.creator = creator;
  }
}

export default {
  state: {
    cars: [],
    car: { name: "", img_src: "" },
  },
  mutations: {
    addCar(state, payload) {
      state.cars.push(payload);
    },
    updateCar(state, payload) {
      state.cars = state.cars.map((c) => (c.id === payload.id ? payload : c));
    },
    deleteCar(state, payload) {
      state.cars = state.cars.filter((c) => c.id !== payload);
    },
    approveCar(state, payload) {
      state.cars.forEach((c) => {
        if (c.id === payload) {
          c.approved = !c.approved;
        }
      });
    },
    setCars(state, payload) {
      state.cars = payload;
    },
    setCar(state, payload) {
      state.car = payload;
    },
  },
  actions: {
    async createCar({ commit, dispatch, getters }, { name, slug, image }) {
      try {
        await dispatch("UpdateAccessToken");
        const formData = new FormData();
        formData.append("name", name);
        formData.append("slug", slug);
        if (image) {
          formData.append("image", image, image.name);
        }
        const response = await fetch(process.env.VUE_APP_API_URL + "/car", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + getters.accessToken,
          },
          body: formData,
        });
        if (response.ok) {
          const json = await response.json();
          const newCar = new Car(json.data);
          commit("addCar", newCar);
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
    async updateCar({ commit, dispatch, getters }, { id, name, slug, image }) {
      try {
        await dispatch("UpdateAccessToken");
        const formData = new FormData();
        formData.append("id", id);
        formData.append("name", name);
        formData.append("slug", slug);
        if (image) {
          formData.append("image", image, image.name);
        }
        const response = await fetch(process.env.VUE_APP_API_URL + "/car", {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + getters.accessToken,
          },
          body: formData,
        });
        if (response.ok) {
          const json = await response.json();
          const car = new Car(json.data);
          commit("updateCar", car);
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
    async deleteCar({ commit, dispatch, getters }, payload) {
      try {
        await dispatch("UpdateAccessToken");
        const response = await fetch(
          process.env.VUE_APP_API_URL + "/car?id=" + payload,
          {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + getters.accessToken,
            },
          }
        );
        if (response.ok) {
          commit("deleteCar", payload);
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
    async approveCar({ commit, dispatch, getters }, payload) {
      try {
        await dispatch("UpdateAccessToken");
        const response = await fetch(
          process.env.VUE_APP_API_URL + "/carapprove/" + payload,
          {
            method: "PUT",
            headers: {
              Authorization: "Bearer " + getters.accessToken,
            },
          }
        );
        if (response.ok) {
          commit("approveCar", payload);
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
    async fetchCars({ commit }) {
      commit("clearError");
      commit("setLoading", true);
      try {
        const response = await fetch(process.env.VUE_APP_API_URL + "/cars", {
          method: "GET",
        });
        if (response.ok) {
          const json = await response.json();
          const cars = json.data.map((c) => new Car(c));
          // .sort((a, b) => (a.name > b.name ? 1 : -1)
          commit("setCars", cars);
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
    async fetchCarBySlug({ commit }, payload) {
      commit("clearError");
      commit("setLoading", true);
      try {
        const response = await fetch(
          process.env.VUE_APP_API_URL + `/car?slug=${payload}`,
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const json = await response.json();
          const car = new Car(json.data);
          commit("setCar", car);
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
    cars(state) {
      return state.cars.filter((c) => c.approved);
    },
    myCars(state, getters) {
      return state.cars.filter((c) => c.creator_id === getters.currentUser.id);
    },
    unaprrovedCars(state) {
      return state.cars.filter((c) => !c.approved);
    },
    carBySlug(state) {
      return (slug) => {
        const car = state.cars.find((c) => c.slug === slug);
        return car ? car : { name: "", img_src: "" };
      };
    },
    allCars(state) {
      return state.cars;
    },
    car(state) {
      return state.car;
    },
  },
};
