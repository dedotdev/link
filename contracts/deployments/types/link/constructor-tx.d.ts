// Generated by dedot cli

import type { GenericSubstrateApi } from 'dedot/types';
import type {
  GenericConstructorTx,
  GenericConstructorTxCall,
  ConstructorTxOptions,
  GenericInstantiateSubmittableExtrinsic,
} from 'dedot/contracts';

export interface ConstructorTx<ChainApi extends GenericSubstrateApi> extends GenericConstructorTx<ChainApi> {
  /**
   * Construct a new contract and set the caller as an upgrader.
   *
   * The caller will be able to upgrade this contract to use any code. This requires
   * users of the contract to trust the upgrader. Probably a multisig should be used
   * for that reason. A truly trustless deployment should use the [`unstoppable`]
   * constructor.
   *
   * @param {ConstructorTxOptions} options
   *
   * @selector 0x9bae9d5e
   **/
  new: GenericConstructorTxCall<
    ChainApi,
    (options: ConstructorTxOptions) => GenericInstantiateSubmittableExtrinsic<ChainApi>
  >;

  /**
   * Construct a new contract and don't set an upgrader.
   *
   * This prevents the contract from being changed and hence makes it truly
   * unstoppable.
   *
   * @param {ConstructorTxOptions} options
   *
   * @selector 0x80f86a83
   **/
  unstoppable: GenericConstructorTxCall<
    ChainApi,
    (options: ConstructorTxOptions) => GenericInstantiateSubmittableExtrinsic<ChainApi>
  >;
}