import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastify, {FastifyInstance} from 'fastify';
import {env} from '../env';
import {API_INFO} from './constant';
import {health} from './controller/actions/health';
import {buildRoutes} from './controller/route';
import {Controller} from './type';

const predefinedCtls: Controller[] = [
  {
    prefix: '/health',
    actions: [{path: '/', method: 'get', handler: health}],
  },
];

export class Application {
  private server?: FastifyInstance;
  private ctls: Controller[] = [];

  controllers(value: Controller[]) {
    this.ctls = value;
    return this;
  }

  build() {
    this.server = fastify({
      logger: {level: env.LOG_LEVEL},
      trustProxy: true,
      bodyLimit: 10485760, // 10 MiB
    });

    this.server
      .register(fastifySwagger, {
        openapi: {
          info: API_INFO,
          servers: [],
        },
      })
      .register(fastifySwaggerUI, {
        routePrefix: '/documentation',
      });

    this.server
      .register(cors)
      .register(buildRoutes([...this.ctls, ...predefinedCtls]))
      .after(err => {
        if (err) {
          console.log(`register plugins failed: ${err.message}`);
          throw err;
        }
      })
      .ready()
      .then(
        () => {
          this.server!.log.info('Server successfully booted!');
        },
        err => {
          this.server!.log.trace('Server start error', err);
        }
      );

    return this.server;
  }

  async start(port = 3006, host = '127.0.0.1') {
    if (!this.server) {
      this.server = this.build();
    }

    await this.server.listen({port, host});

    this.server.log.info(`🚀 Server running on port ${port}`);
    this.server.log.info(
      `🚀 Api document on http://${host}:${port}/documentation`
    );
  }
}
