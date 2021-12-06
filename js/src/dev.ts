import { Connection, PublicKey, Keypair, Commitment } from '@solana/web3.js';
import fs from 'fs';

import {
  Numberu64,
  generateRandomSeed,
  signTransactionInstructions,
} from './utils';
import { Schedule } from './state';
import { TOKEN_VESTING_PROGRAM_ID, create } from './main';

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

/** There are better way to generate an array of dates but be careful as it's irreversible */
const DATES = [
  new Date(2021, 8),
  new Date(2021, 9),
  new Date(2021, 10),
  new Date(2021, 11),
  new Date(2021, 12),
  new Date(2022, 1),
  new Date(2022, 2),
  new Date(2022, 3),
  new Date(2022, 4),
  new Date(2022, 5),
  new Date(2022, 6),
  new Date(2022, 7),
  new Date(2022, 8),
  new Date(2022, 9),
  new Date(2022, 10),
  new Date(2022, 11),
  new Date(2023, 12),
  new Date(2023, 1),
  new Date(2023, 2),
  new Date(2023, 3),
  new Date(2023, 4),
  new Date(2023, 5),
  new Date(2023, 6),
  new Date(2023, 7),
  new Date(2023, 8),
  new Date(2023, 9),
  new Date(2023, 10),
  new Date(2023, 11),
  new Date(2023, 12),
];

/** Info about the desintation */
const DESTINATION_OWNER = new PublicKey('BgdtDEEmn95wakgQRx4jAVqn8jsSPBhDwxE8NTPnmyon');
const DESTINATION_TOKEN_ACCOUNT = new PublicKey('9G76pKiXGQKyya9cDvbYWu3KqJTjU1GKHn1BxV6iMukV');

/** Token info */
const MINT = new PublicKey('Ef7byi1K9bGpDczXtnHpmtkmTo7NibUv4SYgTRvEWx3C');
const DECIMALS = 9;

// 100000 tokens

/** Info about the source */
const SOURCE_TOKEN_ACCOUNT = new PublicKey('6Z2qGTgKfkXrPqgx3AjfN6UpvF98PXohi1REgDDiS6nG');

/** Amount to give per schedule */
const AMOUNT_PER_SCHEDULE = 10;

/** Your RPC connection */
const commitment: Commitment = 'single';
const connection = new Connection('https://rpc-mainnet-fork.dappio.xyz', { commitment, wsEndpoint: 'wss://rpc-mainnet-fork.dappio.xyz/ws' });

const seed = generateRandomSeed();

/** Do some checks before sending the tokens */
const checks = async () => {
  const tokenInfo = await connection.getParsedAccountInfo(
    DESTINATION_TOKEN_ACCOUNT,
  );

  // @ts-ignore
  const parsed = tokenInfo.value.data.parsed;
  if (parsed.info.mint !== MINT.toBase58()) {
    throw new Error('Invalid mint');
  }
  if (parsed.info.owner !== DESTINATION_OWNER.toBase58()) {
    throw new Error('Invalid owner');
  }
  if (parsed.info.tokenAmount.decimals !== DECIMALS) {
    throw new Error('Invalid decimals');
  }
};

/** Function that locks the tokens */
const lock = async () => {
  await checks();
  const schedules: Schedule[] = [];
  for (let date of DATES) {
    schedules.push(
      new Schedule(
        /** Has to be in seconds */
        new Numberu64(date.getTime() / 1_000),
        /** Don't forget to add decimals */
        new Numberu64(AMOUNT_PER_SCHEDULE * Math.pow(10, DECIMALS)),
      ),
    );
  }

  console.log(`Seed: ${seed}`);

  const instruction = await create(
    connection,
    TOKEN_VESTING_PROGRAM_ID,
    Buffer.from(seed),
    wallet.publicKey,
    wallet.publicKey,
    SOURCE_TOKEN_ACCOUNT,
    DESTINATION_TOKEN_ACCOUNT,
    MINT,
    schedules,
  );

  const tx = await signTransactionInstructions(
    connection,
    [wallet],
    wallet.publicKey,
    instruction,
  );

  console.log(`Transaction: ${tx}`);
};

lock();
