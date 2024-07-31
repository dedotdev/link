// Generated by dedot cli

import type { GenericSubstrateApi } from 'dedot/types';
import type { Result } from 'dedot/codecs';
import type {
  GenericConstructorQuery,
  GenericConstructorQueryCall,
  GenericConstructorCallResult,
  ConstructorCallOptions,
  ContractInstantiateResult,
} from 'dedot/contracts';
import type { InkPrimitivesLangError } from './types';

export interface ConstructorQuery<ChainApi extends GenericSubstrateApi> extends GenericConstructorQuery<ChainApi> {
  /**
   * Construct a new contract and set the caller as an upgrader.
   *
   * The caller will be able to upgrade this contract to use any code. This requires
   * users of the contract to trust the upgrader. Probably a multisig should be used
   * for that reason. A truly trustless deployment should use the [`unstoppable`]
   * constructor.
   *
   * @param {ConstructorCallOptions} options
   *
   * @selector 0x9bae9d5e
   **/
  new: GenericConstructorQueryCall<
    ChainApi,
    (options: ConstructorCallOptions) => Promise<GenericConstructorCallResult<[], ContractInstantiateResult<ChainApi>>>
  >;

  /**
   * Construct a new contract and don't set an upgrader.
   *
   * This prevents the contract from being changed and hence makes it truly
   * unstoppable.
   *
   * @param {ConstructorCallOptions} options
   *
   * @selector 0x80f86a83
   **/
  unstoppable: GenericConstructorQueryCall<
    ChainApi,
    (options: ConstructorCallOptions) => Promise<GenericConstructorCallResult<[], ContractInstantiateResult<ChainApi>>>
  >;
}