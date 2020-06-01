import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store/auth.js";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../components/Home.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/auth/Login.vue"),
  },
  {
    path: "/registration",
    name: "Registration",
    component: () => import("../components/auth/Registration.vue"),
  },
  {
    path: "/docs/:car",
    name: "DocsList",
    component: () => import("../components/doc/DocsList.vue"),
  },
  {
    path: "/docs/:car/:part",
    name: "DocsListPart",
    component: () => import("../components/doc/DocsList.vue"),
  },
  {
    path: "/alldocs",
    name: "allDocs",
    component: () => import("../components/doc/AllDocs.vue"),
    meta: {
      requiresAdmin: true,
    },
  },
  {
    path: "/mydocs",
    name: "myDocs",
    component: () => import("../components/doc/MyDocs.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/docs/:car/:part/:doc",
    name: "Doc",
    component: () => import("../components/doc/Doc.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
  },
  {
    path: "/allcars",
    name: "AllCars",
    component: () => import("../components/car/AllCars.vue"),
    meta: {
      requiresAdmin: true,
    },
  },
  {
    path: "/mycars",
    name: "MyCars",
    component: () => import("../components/car/MyCars.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/approve",
    name: "Approve",
    component: () => import("../components/Approve.vue"),
    meta: {
      requiresAdmin: true,
    },
  },
  {
    path: "/parts",
    name: "Parts",
    component: () => import("../components/part/Parts.vue"),
    meta: {
      requiresAdmin: true,
    },
  },
  {
    path: "/403",
    name: "Error403",
    component: () => import("../components/error/Error403.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((x) => x.meta.requiresAuth);
  const requiresAdmin = to.matched.some((x) => x.meta.requiresAdmin);
  const currentUser = store.state.currentUser;

  if ((requiresAuth || requiresAdmin) && !currentUser) {
    next("/login");
  } else if (requiresAdmin && !currentUser.isAdmin) {
    next("/403");
  } else {
    next();
  }
});

export default router;
