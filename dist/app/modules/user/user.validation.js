"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const signUpUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Name is required')
            .max(50, 'Name cannot be more than 50 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z
            .string({
            invalid_type_error: 'Password must be string',
        })
            .max(20, { message: 'Password can not be more than 20 characters' }),
        role: zod_1.z
            .enum(['user', 'admin'], {
            errorMap: () => ({ message: 'Role must be either user or admin' }),
        })
            .default('user'),
        address: zod_1.z.string(),
    }),
});
const signInUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string({ required_error: 'Password is required' }),
    }),
});
exports.UserValidation = {
    signUpUserValidationSchema,
    signInUserValidationSchema,
};
