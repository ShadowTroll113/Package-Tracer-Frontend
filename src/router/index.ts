// src/router/index.ts
import {
  createRouter,
  createWebHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router"
import { useUsersStore } from "../store/user.store"

import Login from "../views/Login.vue"
import MainWindow from "../views/MainWindow.vue"
import CreateOrder from "../views/CreateOrder.vue"
import OrderList from "../views/OrderList.vue"
import CreateProduct from "../views/CreateProduct.vue"
import ProductList from "../views/ProductList.vue"
import CreateBranch from "../views/CreateBranch.vue"
import BranchList from "../views/BranchList.vue"
import CreateRoute from "../views/CreateRoute.vue"
import AssignRoute from "../views/AssignRoute.vue"
import CreateTruck from "../views/CreateTruck.vue"
import RouteList from "../views/RouteList.vue"
import TruckList from "../views/TruckList.vue"
import UserList from "../views/UserList.vue"
import Map from "../views/Map.vue"

function requireAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const userStore = useUsersStore()
  if (!userStore.user) {
    return next({ path: "/" })
  }
  return next()
}


function requireRole(allowedRoles: string[], redirectPath = "/main") {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const userStore = useUsersStore()
    const user = userStore.user
    if (!user) {

      return next({ path: "/" })
    }
    if (allowedRoles.includes(user.role)) {
      return next()
    }

    return next({ path: redirectPath })
  }
}

const routes = [
  { path: "/", component: Login },

  { path: "/main", component: MainWindow, beforeEnter: requireAuth },
  { path: "/order/creation", component: CreateOrder, beforeEnter: requireAuth },
  { path: "/order/list", component: OrderList, beforeEnter: requireAuth },
  { path: "/truck/list", component: TruckList, beforeEnter: requireAuth },
    { path: "/user/list", component: UserList, beforeEnter: requireAuth },
  { path: "/product/creation", component: CreateProduct, beforeEnter: requireAuth },
  { path: "/product/list", component: ProductList, beforeEnter: requireAuth },

  { path: "/map", component: Map, beforeEnter: requireAuth },

  // SOLO Admin
  {
    path: "/branch/creation",
    component: CreateBranch,
    beforeEnter: requireRole(["Admin"]),
  },
  {
    path: "/branch/list",
    component: BranchList,
    beforeEnter: requireRole(["Admin"]),
  },
  {
    path: "/truck/creation",
    component: CreateTruck,
    beforeEnter: requireRole(["Admin"]),
  },
  {
    path: "/user/list",
    component: CreateTruck,
    beforeEnter: requireRole(["Admin"]),
  },
  // ALMACÉN y Admin
  {
    path: "/assign-route",
    component: AssignRoute,
    beforeEnter: requireRole(["Almacen", "Admin"]),
  },
  {
    path: "/route/list",
    component: RouteList,
    beforeEnter: requireRole(["Almacen", "Admin"]),
  },
    {
    path: "/truck/list",
    component: TruckList,
    beforeEnter: requireRole(["Admin"]),
  },
  {
    path: "/route/creation",
    component: CreateRoute,
    beforeEnter: requireRole(["Almacen", "Admin"]),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
