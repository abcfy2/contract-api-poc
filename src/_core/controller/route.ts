import {FastifyInstance} from 'fastify';
import {Action, Controller} from '../type';

export function buildRoutes(controllers: Controller[]) {
  return async (fastify: FastifyInstance) => {
    controllers.forEach(controller => {
      fastify.register(buildController(controller.actions), {
        prefix: controller.prefix,
      });
    });
  };
}

function buildController(actions: Action[]) {
  return async (fastify: FastifyInstance) => {
    actions.forEach(action => {
      fastify[action.method](action.path, action.options || {}, action.handler);
    });
  };
}
