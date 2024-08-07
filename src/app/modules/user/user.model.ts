import bcrypt from 'bcrypt'
import { Schema, model } from 'mongoose'
import { TUser, UserModel } from './user.interface'
import config from '../../config'

const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    // password: {
    //   type: String,
    //   required: [true, 'Password is required'],
    //   select: false,
    // },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    role: {
      type: String,
      default: 'user',
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role',
      },
    },
    address: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre('save', async function (next) {
  const user = this
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  )
  next()
})

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = ''
  next()
})

userSchema.statics.isUserExists = async function (email: string) {
  return await User.findOne({ email })
}

userSchema.statics.isPasswordMatched = async function (
  plainPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000
  return passwordChangedTime > jwtIssuedTimestamp
}

export const User = model<TUser, UserModel>('User', userSchema)
