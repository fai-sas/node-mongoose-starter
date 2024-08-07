import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { UserValidation } from './user.validation'
import { UserControllers } from './user.controller'
import auth from '../../middlewares/auth'

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

router.post(
  '/change-password',
  auth('admin', 'user'),
  validateRequest(UserValidation.changePasswordValidationSchema),
  UserControllers.changePassword
)

router.post(
  '/refresh-token',
  validateRequest(UserValidation.refreshTokenValidationSchema),
  UserControllers.refreshToken
)

router.post(
  '/forget-password',
  validateRequest(UserValidation.forgetPasswordValidationSchema),
  UserControllers.forgetPassword
)

router.post(
  '/reset-password',
  validateRequest(UserValidation.forgetPasswordValidationSchema),
  UserControllers.resetPassword
)

export const UserRoutes = router
