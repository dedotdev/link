// Generated by dedot cli

import type { GenericSubstrateApi } from 'dedot/types';
import type { BytesLike, Hash } from 'dedot/codecs';
import type {
  GenericContractTx,
  GenericContractTxCall,
  ContractTxOptions,
  ContractSubmittableExtrinsic,
} from 'dedot/contracts';
import type { LinkSlugCreationMode } from './types';

export interface ContractTx<ChainApi extends GenericSubstrateApi> extends GenericContractTx<ChainApi> {
  /**
   * Create a a new mapping or use an existing one.
   *
   * @param {LinkSlugCreationMode} slug
   * @param {BytesLike} url
   * @param {ContractTxOptions} options
   *
   * @selector 0x92ccc180
   **/
  shorten: GenericContractTxCall<
    ChainApi,
    (slug: LinkSlugCreationMode, url: BytesLike, options: ContractTxOptions) => ContractSubmittableExtrinsic<ChainApi>
  >;

  /**
   * Change the code of this contract.
   *
   * This can only be called by the upgrader specified at contract construction.
   * The code cannot be changed in case no upgrader was set because the
   * [`unstoppable`] constructor was used.
   *
   * @param {Hash} codeHash
   * @param {ContractTxOptions} options
   *
   * @selector 0x9852f7b0
   **/
  upgrade: GenericContractTxCall<
    ChainApi,
    (codeHash: Hash, options: ContractTxOptions) => ContractSubmittableExtrinsic<ChainApi>
  >;
}