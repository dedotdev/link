import { Keyring } from "@polkadot/keyring"
import { IKeyringPair } from "@polkadot/types/types/interfaces"
import { getSubstrateChain } from "@scio-labs/use-inkathon/chains"
import { SubstrateChain, SubstrateExplorer } from "@scio-labs/use-inkathon/types"
import * as dotenv from "dotenv"
import { LegacyClient, WsProvider } from "dedot"

// Dynamically load environment from `.env.{chainId}`
const chainId = process.env.CHAIN || 'development';
dotenv.config({ path: `.env.${chainId}` });

/**
 * Initialize Polkadot.js API with given RPC & account from given URI.
 */
export type InitParams = {
  chain: SubstrateChain;
  api: LegacyClient;
  keyring: Keyring;
  account: IKeyringPair;
  decimals: number;
  prefix: number;
};

export const initDedot = async (): Promise<InitParams> => {
  const accountUri = process.env.ACCOUNT_URI || '//Alice';
  let chain: SubstrateChain | undefined = undefined;
  if (chainId === 'pop-network') {
    chain = {
      network: 'pop-network',
      name: 'Pop Network',
      ss58Prefix: 42,
      rpcUrls: ['wss://rpc1.paseo.popnetwork.xyz', 'wss://rpc2.paseo.popnetwork.xyz'],
      explorerUrls: {
        [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc1.paseo.popnetwork.xyz`,
      },
      testnet: true,
      faucetUrls: ['https://faucet.polkadot.io/'],
    };
  } else {
    chain = getSubstrateChain(chainId);
  }

  if (!chain) throw new Error(`Chain '${chainId}' not found`);

  // Initialize api
  const api = await LegacyClient.new(new WsProvider(chain.rpcUrls[0] as string));

  // Print chain info
  const network = await api.rpc.system_chain() || '';
  const version = await api.rpc.system_version() || '';
  console.log(`Initialized API on ${network} (${version})`);

  // Get decimals & prefix
  const props = await api.rpc.system_properties();
  const decimals = typeof props.tokenDecimals === 'number' ? props.tokenDecimals : Array.isArray(props.tokenDecimals) ? props.tokenDecimals[0] : 12;
  const prefix = api.consts.system.ss58Prefix;

  // Initialize account & set signer
  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri(accountUri);
  const balance = await api.query.system.account(account.address);
  const balanceFormatted = formatBalance(balance.data.free, decimals);
  console.log(`Initialized Account: ${account.address} (${balanceFormatted})\n`);

  return { api, chain, keyring, account, decimals, prefix };
};

export const formatBalance = (balance: bigint, decimal: number = 12): string => {
  return (parseFloat(balance.toString()) / Math.pow(10, decimal)).toString();
};
