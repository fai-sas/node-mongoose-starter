import httpStatus from 'http-status'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'
import { TUserRole } from '../modules/user/user.interface'
import AppError from '../errors/AppError'
import config from '../config'
import { User } from '../modules/user/user.model'

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization

    // check if the authorization header is missing
    if (!authorizationHeader) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!')
    }

    // check if the authorization header starts with "Bearer"
    if (!authorizationHeader.startsWith('Bearer ')) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Token must start with "Bearer"'
      )
    }

    // extract the token
    const token = authorizationHeader.split(' ')[1]

    // check if the given token is valid
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as JwtPayload

    const { userId, email, role } = decoded

    // check if the user is exist
    const user = await User.findOne({ email })

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found !')
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, `You are not authorized !`)
    }

    req.user = decoded as JwtPayload

    next()
  })
}

export default auth
