import {Application} from './_core/application';
import {generateFromAbi} from './_core/utils';
import {env} from './env';
import path from 'path';

import {getPolygonSdk} from '@dethcrypto/eth-sdk-client';
import {ethers} from 'ethers';

function main() {
  const abiPath = path.join(__dirname, '../eth-sdk/abis');
  const ctls = generateFromAbi(abiPath);
  const app = new Application();
  app.controllers(ctls);
  app.start(env.FASTIFY_PORT, env.FASTIFY_ADDRESS);

  // const sdk = getPolygonSdk(defaultSigner);
  // sdk.RPS.acceptAndPlay({
  //   gameId: 0,
  //   playerBContract: 'sss',
  //   playerBTokenId: 0,
  //   moves: [0, 1, 2],
  // });
}

main();
