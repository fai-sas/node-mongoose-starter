"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post('/register', (0, validateRequest_1.default)(user_validation_1.UserValidation.signUpUserValidationSchema), user_controller_1.UserControllers.signUpUser);
router.post('/login', (0, validateRequest_1.default)(user_validation_1.UserValidation.signInUserValidationSchema), user_controller_1.UserControllers.signInUser);
router.post('/change-password', (0, auth_1.default)('admin', 'user'), (0, validateRequest_1.default)(user_validation_1.UserValidation.changePasswordValidationSchema), user_controller_1.UserControllers.changePassword);
router.post('/refresh-token', (0, validateRequest_1.default)(user_validation_1.UserValidation.refreshTokenValidationSchema), user_controller_1.UserControllers.refreshToken);
router.post('/forget-password', (0, validateRequest_1.default)(user_validation_1.UserValidation.forgetPasswordValidationSchema), user_controller_1.UserControllers.forgetPassword);
router.post('/reset-password', (0, validateRequest_1.default)(user_validation_1.UserValidation.forgetPasswordValidationSchema), user_controller_1.UserControllers.resetPassword);
exports.UserRoutes = router;
