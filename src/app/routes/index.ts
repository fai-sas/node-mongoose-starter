import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.route'

const router = Router()

const moduleRoutes = [
  {
    path: '/auth',
    routes: UserRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.routes))

export default router
