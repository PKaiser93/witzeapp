import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Datenbank
  DATABASE_URL: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  // Server
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3001'),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Mail (Resend)
  RESEND_API_KEY: Joi.string().required(),
  MAIL_FROM: Joi.string().default('noreply@witzeapp.de'),

  // App
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
});
