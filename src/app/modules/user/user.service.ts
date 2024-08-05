import httpStatus from 'http-status'
import { TUser } from './user.interface'
import { User } from './user.model'
import AppError from '../../errors/AppError'
import { createToken } from './user.utils'
import config from '../../config'

const signUpUserIntoDb = async (payload: TUser) => {
  const existingUser = await User.findOne({ email: payload.email })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  const result = await User.create(payload)

  const userObj = result?.toObject()
  delete userObj?.password

  return userObj
}

const signInUserIntoDb = async (payload: Partial<TUser>) => {
  const user = await User.findOne({ email: payload.email }).select('+password')

  // check if user exists
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  // check if password is correct
  if (
    !(await User.isPasswordMatched(payload?.password as string, user?.password))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match')
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  }

  const token = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  )

  user.password = undefined

  return { user, token }
}

export const UserServices = {
  signUpUserIntoDb,
  signInUserIntoDb,
}
