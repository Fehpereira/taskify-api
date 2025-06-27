import { UserController } from '@/controllers/user-controller';
import { Router } from 'express';

const userRoutes = Router();
const userController = new UserController();

userRoutes.post('/', userController.create.bind(userController));

userRoutes.post('/session', userController.login.bind(userController));

export { userRoutes };
