import { UserController } from '../controllers/user-controller';
import { Router } from 'express';

const userRoutes = Router();
const userController = new UserController();

userRoutes.get('/', userController.index.bind(userController));
userRoutes.get('/:id', userController.indexById.bind(userController));
userRoutes.post('/', userController.create.bind(userController));
userRoutes.post('/session', userController.login.bind(userController));

export { userRoutes };
