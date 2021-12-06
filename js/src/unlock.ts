import { Connection, PublicKey, Keypair, Commitment } from '@solana/web3.js';
import fs from 'fs';

import {
  generateRandomSeed,
  signTransactionInstructions,
} from './utils';
import { TOKEN_VESTING_PROGRAM_ID, unlock } from './main';

/**
 *
 * Simple example of a linear unlock.
 *
 * This is just an example, please be careful using the vesting contract and test it first with test tokens.
 *
 */

/** Path to your wallet */
const WALLET_PATH = '../../../.config/solana/id.json';
const wallet = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH).toString())),
);

/** Token info */
const MINT = new PublicKey('Ef7byi1K9bGpDczXtnHpmtkmTo7NibUv4SYgTRvEWx3C');

/** Your RPC connection */
const commitment: Commitment = 'single';
const connection = new Connection('https://rpc-mainnet-fork.dappio.xyz', { commitment, wsEndpoint: 'wss://rpc-mainnet-fork.dappio.xyz/ws' });

const seed = '9847659504623677622998870504553417197969930031303948007146669749'; // Update this

const sendUnlock = async () => {
  const instruction = await unlock(
    connection,
    TOKEN_VESTING_PROGRAM_ID,
    Buffer.from(seed),
    MINT,
  );

  const tx = await signTransactionInstructions(
    connection,
    [wallet],
    wallet.publicKey,
    instruction,
  );

  console.log(`Transaction: ${tx}`);
};

sendUnlock();
