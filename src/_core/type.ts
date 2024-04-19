import {RouteHandlerMethod, RouteShorthandOptions} from 'fastify';

export type Action = {
  path: string;
  method:
    | 'get'
    | 'head'
    | 'post'
    | 'put'
    | 'delete'
    | 'options'
    | 'patch'
    | 'all';
  options?: RouteShorthandOptions;
  handler: RouteHandlerMethod;
};

export type Controller = {
  prefix: string;
  actions: Action[];
};
