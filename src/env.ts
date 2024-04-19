import {createEnv} from '@t3-oss/env-core';
import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

export const env = createEnv({
  clientPrefix: '',
  server: {
    FASTIFY_PORT: z.coerce.number().default(3006),
    FASTIFY_ADDRESS: z.string().default('127.0.0.1'),
    LOG_LEVEL: z.string().default('debug'),
    CHAIN_NAME: z.coerce.string(),
    CONTRACT_NAME: z.coerce.string(),
    CONTRACT_ADDRESS: z.coerce.string(),
    INFURA_API_KEY: z.string().optional(),
  },
  client: {},
  runtimeEnv: process.env,
});
