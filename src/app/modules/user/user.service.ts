import httpStatus from 'http-status'
import { TUser } from './user.interface'
import { User } from './user.model'
import AppError from '../../errors/AppError'
import { createToken, verifyToken } from './user.utils'
import config from '../../config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { sendEmail } from '../../utils/sendEmail'

const signUpUserIntoDb = async (payload: TUser) => {
  const existingUser = await User.isUserExists(payload.email)

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  const result = await User.create(payload)

  return result
}

const signInUserIntoDb = async (payload: Partial<TUser>) => {
  const user = await User.findOne({ email: payload.email }).select('+password')
  // const user = await User.findOne({ email: payload.email })

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

  //create token and sent to the  client

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  )

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  )

  // user.password = undefined

  return { user, accessToken, refreshToken }
}

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  // checking if the user is exist
  const user = await User.findOne({ email: userData.email }).select('+password')

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !')
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload?.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched')

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  )

  await User.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  )

  return null
}

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string)

  const { email, iat } = decoded

  // checking if the user is exist
  const user = await User.isUserExists(email)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !')
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !')
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  )

  return {
    accessToken,
  }
}

const forgetPassword = async (email: string) => {
  // checking if the user is exist
  const user = await User.isUserExists(email)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !')
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  }

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m'
  )

  const resetUILink = `${config.reset_password_ui_link}?email=${user.email}&token=${resetToken} `

  sendEmail(user.email, resetUILink)

  console.log(resetUILink)
}

const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string
) => {
  // checking if the user is exist
  const user = await User.isUserExists(payload?.email)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !')
  }

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string
  ) as JwtPayload

  //localhost:3000?id=A-0001&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBLTAwMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDI4NTA2MTcsImV4cCI6MTcwMjg1MTIxN30.-T90nRaz8-KouKki1DkCSMAbsHyb9yDi0djZU3D6QO4

  if (payload.email !== decoded.email) {
    console.log(payload.email, decoded.email)
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!')
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  )

  await User.findOneAndUpdate(
    {
      email: decoded.email,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    }
  )
}

export const UserServices = {
  signUpUserIntoDb,
  signInUserIntoDb,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
}
