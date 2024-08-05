import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { UserValidation } from './user.validation'
import { UserControllers } from './user.controller'

const router = express.Router()

router.post(
  '/register',
  validateRequest(UserValidation.signUpUserValidationSchema),
  UserControllers.signUpUser
)

router.post(
  '/login',
  validateRequest(UserValidation.signInUserValidationSchema),
  UserControllers.signInUser
)

export const UserRoutes = router
