/* eslint-disable no-unused-vars */
import { Model } from 'mongoose'
import { USER_ROLE } from './user.constant'

export interface TUser {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  address?: string
}

export interface UserModel extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExists(id: string): Promise<TUser>

  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean>
}

export type TUserRole = keyof typeof USER_ROLE
