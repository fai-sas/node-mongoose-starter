import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { UserServices } from './user.service'
import config from '../../config'
import AppError from '../../errors/AppError'

const signUpUser = catchAsync(async (req, res) => {
  const result = await UserServices.signUpUserIntoDb(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registered successfully',
    data: result,
  })
})

const signInUser = catchAsync(async (req, res) => {
  const result = await UserServices.signInUserIntoDb(req.body)
  const { refreshToken, accessToken } = result

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: {
      accessToken,
    },
  })
})

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body

  const result = await UserServices.changePassword(req.user, passwordData)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password is updated successfully!',
    data: result,
  })
})

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies
  const result = await UserServices.refreshToken(refreshToken)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  })
})

const forgetPassword = catchAsync(async (req, res) => {
  const userEmail = req.body.email

  const result = await UserServices.forgetPassword(userEmail)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reset link is generated successfully!',
    data: result,
  })
})

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong !')
  }

  const result = await UserServices.resetPassword(req.body, token)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully!',
    data: result,
  })
})

export const UserControllers = {
  signUpUser,
  signInUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
}
