import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/User.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Categories from '../components/goods/Categories.vue'
// import Params from '../components/goods/Params.vue'
// import GoodsList from '../components/goods/List.vue'
// import GoodsAdd from '../components/goods/Add.vue'
// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'

const Login = () => import(/* webpackChunkName: "login_home_welcome */'../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome */'../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome */'../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "User_roles_rights */'../components/user/User.vue')
const Rights = () => import(/* webpackChunkName: "User_roles_rights */'../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "User_roles_rights */'../components/power/Roles.vue')

const Categories = () => import(/* webpackChunkName: "Categories_params */'../components/goods/Categories.vue')
const Params = () => import(/* webpackChunkName: "Categories_params */'../components/goods/Params.vue')

const GoodsList = () => import(/* webpackChunkName: "GoodsList_goodsAdd */'../components/goods/List.vue')
const GoodsAdd = () => import(/* webpackChunkName: "GoodsList_goodsAdd */'../components/goods/Add.vue')

const Order = () => import(/* webpackChunkName: "Order_report */'../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order_report */'../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }, {
    path: '/Home',
    name: 'Home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: Welcome
      }, {
        path: '/users',
        name: 'Users',
        component: Users
      }, {
        path: '/rights',
        name: 'Rights',
        component: Rights
      }, {
        path: '/roles',
        name: 'Roles',
        component: Roles
      }, {
        path: '/categories',
        name: 'Categories',
        component: Categories
      }, {
        path: '/params',
        name: 'Params',
        component: Params
      }, {
        path: '/goods',
        name: 'GoodsList',
        component: GoodsList
      }, {
        path: '/goods/add',
        name: 'GoodsAdd',
        component: GoodsAdd
      }, {
        path: '/orders',
        name: 'Order',
        component: Order
      }, {
        path: '/reports',
        name: 'Report',
        component: Report
      }
    ]
  }
]
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
// to将要访问的路径
// from 代表从那个路径跳转而来
// next 是一个函数，表示放行
// next() 放行 next('/login') 强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
