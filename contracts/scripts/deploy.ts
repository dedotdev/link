import { getDeploymentData } from "@/utils/getDeploymentData"
import { initDedot } from "@/utils/initDedot"
import { writeContractAddresses } from "@/utils/writeContractAddresses"
import { deployLinkContract } from "@/utils/deployLinkContract"

/**
 * Script that deploys the greeter contract and writes its address to a file.
 *
 * Parameters:
 *  - `DIR`: Directory to read contract build artifacts & write addresses to (optional, defaults to `./deployments`)
 *  - `CHAIN`: Chain ID (optional, defaults to `development`)
 *
 * Example usage:
 *  - `pnpm run deploy`
 *  - `CHAIN=alephzero-testnet pnpm run deploy`
 */
const main = async () => {
  const initParams = await initDedot();
  const { api, chain, account } = initParams;

  // Deploy greeter contract
  const { abi, wasm } = await getDeploymentData('link');
  const contract = await deployLinkContract(api, account, abi, wasm);

  // Write contract addresses to `{contract}/{network}.ts` file(s)
  await writeContractAddresses(chain.network, {
    link: contract,
  });
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
