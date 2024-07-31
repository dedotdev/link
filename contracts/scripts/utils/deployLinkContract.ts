import { LegacyClient } from "dedot"
import { IKeyringPair } from "@polkadot/types/types/interfaces"
import { ContractDeployer } from "dedot/contracts"
import { LinkContractApi } from "deployments/types/link"
import { assert, numberToHex } from "dedot/utils"

export const deployLinkContract = async (api: LegacyClient, account: IKeyringPair, abi: any, wasm: any): Promise<{ address: string, hash: string, blockNumber: number }> => {
  const deployer = new ContractDeployer<LinkContractApi>(api, abi, wasm);
  const salt = numberToHex(Date.now())
  const dryRun = await deployer.query.new({ caller: account.address, salt });

  return new Promise((resolve, reject) => {
    deployer.tx.new({ gasLimit: dryRun.raw.gasRequired, salt })
      .signAndSend(account, async ({ status, dispatchError, events }) => {
        if (status.type === 'BestChainBlockIncluded' || status.type === 'Finalized') {
          if (dispatchError) {
            reject(new Error(`Deployment failed: ${JSON.stringify(dispatchError)}`));
          } else {
            const instantiatedEvent = events
              .map(({ event }) => event)
              .find(api.events.contracts.Instantiated.is);

            assert(instantiatedEvent, 'Event Contracts.Instantiated should be available');

            const block = await api.rpc.chain_getBlock(status.value.blockHash);
            const blockNumber = block.block.header.number;

            resolve({
              address: instantiatedEvent.palletEvent.data.contract.address(),
              hash: abi.source.hash,
              blockNumber
            })
          }
        } else if (status.type === 'Invalid' || status.type === 'Drop') {
          reject(new Error(`Deployment failed with status: ${status.type}`));
        }
      })
      .catch(reject);
  })
}
