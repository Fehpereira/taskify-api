import { knex } from '../database/knex';
import { AppError } from '../utils/AppError';
import { Response, Request, NextFunction } from 'express';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import 'dotenv/config';
import z from 'zod';

class UserController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await knex('users').select(
        'id',
        'name',
        'email',
        'created_at',
      );

      if (users) {
        return res.json(users);
      } else {
        return res.status(404);
      }
    } catch (error) {
      next(error);
    }
  }

  async indexById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('ID is required', 400);
      }

      const user = await knex('users')
        .select('id', 'name', 'email', 'created_at')
        .where({ id: String(id).trim() })
        .first();

      if (user) {
        return res.json(user);
      } else {
        return res.status(404).json();
      }
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        name: z
          .string()
          .trim()
          .min(3, 'O nome deve conter no minímo 3 caracteres')
          .max(15, 'O nome não pode ultrapassar 15 caracteres'),
        email: z
          .string()
          .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido!'),
        password: z
          .string()
          .min(8, 'A senha deve ter no minímo 8 caracteres')
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/,
            'A senha deve conter pelo menos um número, um caracter especial, uma letra maiúscula e uma minúscula',
          ),
      });

      const { name, email, password } = bodySchema.parse(req.body);

      const existingUser = await knex<UserRepository>('users')
        .select()
        .where({ email })
        .first();

      if (existingUser) {
        throw new AppError('Esse e-mail já foi cadastrado!');
      }

      const SALT_ROUNDS = 10;

      const passwordHash = await hash(password, SALT_ROUNDS);

      await knex<UserRepository>('users').insert({
        name,
        email,
        password: passwordHash,
      });

      const ok = true;

      return res.status(201).json({ name, email, ok });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        email: z
          .string()
          .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido!'),
        password: z.string().min(8, 'Senha incorreta'),
      });

      const { email, password } = bodySchema.parse(req.body);

      const existingUser: UserRepository = await knex<UserRepository>('users')
        .select()
        .where({ email })
        .first();

      if (!existingUser) {
        throw new AppError('Usuário inexistente!');
      }

      const passwordMatch = await compare(password, existingUser.password);

      if (!passwordMatch) {
        throw new AppError('Senha incorreta!');
      }

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido nas variáveis de ambiente');
      }

      const token = sign(
        {
          name: existingUser.name,
          email: existingUser.email,
        },
        process.env.JWT_SECRET,
        {
          subject: existingUser.id,
          expiresIn: '30d',
        },
      );

      const userData: Omit<UserRepository, 'password' | 'created_at'> & {
        token: string;
      } = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        token,
      };

      const ok = true;

      return res.json({ ...userData, ok });
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
