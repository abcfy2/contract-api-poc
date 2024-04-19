// eslint-disable-next-line node/no-extraneous-import
import {ethers} from 'ethers';
import {RouteShorthandOptions} from 'fastify';
import fs from 'fs';
import path from 'path';
import {Controller} from './type';
import {env} from '../env';

export function generateFromAbi(abiPath: string): Controller[] {
  const ctls = [] as Controller[];

  fs.readdirSync(abiPath, {recursive: true, encoding: 'utf8'}).forEach(
    (f: string) => {
      if (f.endsWith('.json')) {
        // fix windows path separators issue
        const prefix = f.replace(/\\/g, '/').slice(0, -5) + '/';
        const ctl = {prefix, actions: []} as Controller;
        const abi = JSON.parse(fs.readFileSync(path.join(abiPath, f), 'utf8'));
        const abiParse = new ethers.utils.Interface(abi);

        const infuraNetwork =
          env.CHAIN_NAME === 'polygon' ? 'matic' : env.CHAIN_NAME;
        const provider = new ethers.providers.InfuraProvider(
          infuraNetwork,
          env.INFURA_API_KEY
        );
        const contract = new ethers.Contract(
          env.CONTRACT_ADDRESS,
          abiParse,
          provider
        );

        Object.entries(abiParse.functions).forEach(([name, func]) => {
          const method = func.stateMutability === 'nonpayable' ? 'post' : 'get';
          const options = {} as RouteShorthandOptions;
          options.schema = {
            description: `execute function ${name}`,
          };
          const inputs = func.inputs;
          const inputParams = func.inputs.map(input => {
            return {
              [input.name ?? 'input']: convertParamTypeToSchema(input),
            };
          });
          if (inputs.length > 0) {
            const schemaProperties = inputParams.reduce((acc, aur) => {
              return {...acc, ...aur};
            }, {});
            if (method === 'get') {
              options.schema.querystring = {
                type: 'object',
                properties: schemaProperties,
              };
            } else {
              options.schema.body = {
                type: 'object',
                properties: schemaProperties,
              };
            }
          }
          ctl.actions.push({
            path: func.name,
            method,
            options,
            handler: async (request, reply) => {
              const queryParams =
                request.method === 'GET' ? request.query : request.body;
              const args = convertQueryParamsToContractArgs(
                inputParams,
                queryParams
              );
              const result = await contract[func.name](...args);
              return reply.code(200).send(result);
            },
          });
        });
        ctls.push(ctl);
      }
    }
  );

  return ctls;
}

// convert ethers.utils.ParamType to fastify.RouteShorthandOptions.schema
function convertParamTypeToSchema(param: ethers.utils.ParamType): unknown {
  const schema: any = {
    description: `${param.name ?? '&lt;input&gt;'} (${param.type})`,
  };
  switch (param.baseType) {
    case 'bool':
      schema.type = 'boolean';
      break;
    case 'address':
    case 'bytes':
    case 'bytes32':
    case 'string':
      schema.type = 'string';
      break;
    case 'uint256':
    case 'int256':
    case 'uint16':
    case 'int16':
    case 'uint8':
    case 'int8':
    case 'fixed':
    case 'ufixed':
      schema.type = 'integer';
      break;
    case 'array':
      schema.type = 'array';
      schema.items = convertParamTypeToSchema(param.arrayChildren);
      break;
    case 'tuple':
      schema.type = 'object';
      schema.properties = param.components.reduce((acc, aur) => {
        return {...acc, [aur.name]: convertParamTypeToSchema(aur)};
      }, {});
      break;
    default:
      throw new Error(`unsupported type: ${param.type}`);
  }

  return schema;
}

function convertQueryParamsToContractArgs(
  inputParams: {
    [x: string]: unknown;
  }[],
  queryParams: any
): any[] {
  return inputParams
    .map(p => {
      const paraNames = Object.keys(p);
      return paraNames.map(n => {
        return queryParams[n];
      });
    })
    .flat();
}
