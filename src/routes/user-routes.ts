import { UserController } from '@/controllers/user-controller';
import { errorHandling } from '@/middlewares/error-handling';
import { Router } from 'express';

const userRoutes = Router();
const userController = new UserController();

userRoutes.post('/', userController.create);

userRoutes.post('/session', userController.login);

export { userRoutes };
