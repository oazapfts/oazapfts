/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DO NOT MODIFY - This file has been generated using @tzkt/oazapfts.
 * See https://www.npmjs.com/package/@tzkt/oazapfts
 */
import * as Oazapfts from "@tzkt/oazapfts/lib/runtime";
import * as QS from "@tzkt/oazapfts/lib/runtime/query";
import QueryParamsParsers from "./queryParamParsers";
export const defaults: Oazapfts.RequestOpts = {
  baseUrl: "https://api.tzkt.io",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
  server1: "https://api.tzkt.io",
};
export type Int32Parameter = {
  eq?: number;
  ne?: number;
  gt?: number;
  ge?: number;
  lt?: number;
  le?: number;
  in?: number[];
  ni?: number[];
};
export type AccountTypeParameter = {
  eq?: "user" | "contract" | "delegate";
  ne?: "user" | "contract" | "delegate";
};
export type ContractKindParameter = {
  eq?: "delegator_contract" | "smart_contract";
  ne?: "delegator_contract" | "smart_contract";
  in?: ("delegator_contract" | "smart_contract")[];
  ni?: ("delegator_contract" | "smart_contract")[];
};
export type AccountParameter = {
  eq?: string;
  ne?: string;
  in?: string[];
  ni?: string[];
  eqx?: string;
  nex?: string;
  null?: boolean;
  inHasNull?: boolean;
  niHasNull?: boolean;
};
export type Int64Parameter = {
  eq?: number;
  ne?: number;
  gt?: number;
  ge?: number;
  lt?: number;
  le?: number;
  in?: number[];
  ni?: number[];
};
export type BoolParameter = {
  eq?: boolean;
  null?: boolean;
};
export type SelectParameter = {
  fields?: string[];
  values?: string[];
};
export type SortParameter = {
  asc?: string;
  desc?: string;
};
export type OffsetParameter = {
  el?: number;
  pg?: number;
  cr?: number;
};
export type Account = {
  type: string;
};
export type DelegateInfo = {
  alias?: string | null;
  address?: string | null;
  active?: boolean;
};
export type RelatedContract = {
  kind?: string | null;
  alias?: string | null;
  address?: string | null;
  balance?: number;
  delegate?: DelegateInfo | null;
  creationLevel?: number;
  creationTime?: string | null;
};
export type Delegator = {
  type?: string | null;
  alias?: string | null;
  address?: string | null;
  balance?: number;
  delegationLevel?: number;
  delegationTime?: string;
};
export type DateTimeParameter = {
  eq?: string;
  ne?: string;
  gt?: string;
  ge?: string;
  lt?: string;
  le?: string;
  in?: string[];
  ni?: string[];
};
export type StringParameter = {
  eq?: string;
  ne?: string;
  as?: string;
  un?: string;
  in?: string[];
  ni?: string[];
  null?: boolean;
};
export type JsonParameter = {
  eq?: {
    jsonValue: string;
    jsonPath?: string;
  } | null;
  ne?: {
    jsonValue: string;
    jsonPath?: string;
  } | null;
  gt?: {
    jsonValue: string;
    jsonPath?: string;
  } | null;
  ge?: {
    jsonValue: string;
    jsonPath?: string;
  } | null;
  lt?: {
    jsonValue: string;
    jsonPath?: string;
  } | null;
  le?: {
    jsonValue: string;
    jsonPath?: string;
  } | null;
  as?: {
    jsonValue: string;
    jsonPath?: string;
  } | null;
  un?: {
    jsonValue: string;
    jsonPath?: string;
  } | null;
  in?: {
    jsonValue: string[];
    jsonPath?: string;
  } | null;
  ni?: {
    jsonValue: string[];
    jsonPath?: string;
  } | null;
  null?: {
    jsonValue: boolean;
    jsonPath?: string;
  };
};
export type OperationStatusParameter = {
  eq?: "applied" | "failed" | "backtracked" | "skipped";
  ne?: "applied" | "failed" | "backtracked" | "skipped";
};
export type SortMode = "Ascending" | "Descending";
export type MichelineFormat = "Json" | "JsonString" | "Raw" | "RawString";
export type Symbols =
  | "None"
  | "Btc"
  | "Eur"
  | "Usd"
  | "Cny"
  | "Jpy"
  | "Krw"
  | "Eth"
  | "Gbp";
export type Operation = {
  type: string;
};
export type ProfileMetadata = {
  kind?: string | null;
  alias?: string | null;
  description?: string | null;
  site?: string | null;
  support?: string | null;
  email?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  discord?: string | null;
  reddit?: string | null;
  slack?: string | null;
  github?: string | null;
  gitlab?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  medium?: string | null;
};
export type QuoteShort = {
  btc?: number | null;
  eur?: number | null;
  usd?: number | null;
  cny?: number | null;
  jpy?: number | null;
  krw?: number | null;
  eth?: number | null;
  gbp?: number | null;
};
export type HistoricalBalance = {
  level?: number;
  timestamp?: string;
  balance?: number;
  quote?: QuoteShort | null;
};
export type BigMapTagsParameter = {
  eq?: ("metadata" | "token_metadata" | "ledger")[];
  any?: ("metadata" | "token_metadata" | "ledger")[];
  all?: ("metadata" | "token_metadata" | "ledger")[];
};
export type Alias = {
  alias?: string | null;
  address?: string | null;
};
export type BigMap = {
  ptr?: number;
  contract?: Alias | null;
  path?: string | null;
  tags?: string[] | null;
  active?: boolean;
  firstLevel?: number;
  lastLevel?: number;
  totalKeys?: number;
  activeKeys?: number;
  updates?: number;
  keyType?: any | null;
  valueType?: any | null;
};
export type BigMapActionParameter = {
  eq?: "allocate" | "add_key" | "update_key" | "remove_key" | "remove";
  ne?: "allocate" | "add_key" | "update_key" | "remove_key" | "remove";
  in?: ("allocate" | "add_key" | "update_key" | "remove_key" | "remove")[];
  ni?: ("allocate" | "add_key" | "update_key" | "remove_key" | "remove")[];
};
export type TimestampParameter = {
  eq?: string;
  ne?: string;
  gt?: string;
  ge?: string;
  lt?: string;
  le?: string;
  in?: string[];
  ni?: string[];
};
export type BigMapKeyShort = {
  hash?: string | null;
  key?: any | null;
  value?: any | null;
};
export type BigMapUpdate = {
  id?: number;
  level?: number;
  timestamp?: string;
  bigmap?: number;
  contract?: Alias | null;
  path?: string | null;
  action?: string | null;
  content?: BigMapKeyShort | null;
};
export type PrimType =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99
  | 100
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118
  | 119
  | 120
  | 121
  | 122
  | 123
  | 124
  | 125
  | 126
  | 127
  | 128
  | 129
  | 130
  | 131
  | 132
  | 133
  | 134
  | 135
  | 136
  | 137
  | 138
  | 139
  | 140
  | 141
  | 142
  | 143
  | 144
  | 145
  | 146
  | 147
  | 148
  | 149
  | 150;
export type MichelineType = 0 | 32 | 64 | 96 | 128;
export type IMicheline = {
  type?: MichelineType;
};
export type AnnotationType = 0 | 64 | 128 | 192;
export type IAnnotation = {
  type?: AnnotationType;
  value?: string | null;
};
export type MichelinePrim = {
  prim?: PrimType;
  args?: IMicheline[] | null;
  annots?: IAnnotation[] | null;
};
export type BigMapKey = {
  id?: number;
  active?: boolean;
  hash?: string | null;
  key?: any | null;
  value?: any | null;
  firstLevel?: number;
  lastLevel?: number;
  updates?: number;
};
export type BigMapKeyUpdate = {
  id?: number;
  level?: number;
  timestamp?: string;
  action?: string | null;
  value?: any | null;
};
export type BigMapKeyHistorical = {
  id?: number;
  active?: boolean;
  hash?: string | null;
  key?: any | null;
  value?: any | null;
};
export type SoftwareAlias = {
  version?: string | null;
  date?: string;
};
export type EndorsementOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  delegate?: Alias | null;
  slots?: number;
  deposit?: number;
  rewards?: number;
  quote?: QuoteShort | null;
};
export type PreendorsementOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  delegate?: Alias | null;
  slots?: number;
  quote?: QuoteShort | null;
};
export type PeriodInfo = {
  index?: number;
  epoch?: number;
  kind?: string | null;
  firstLevel?: number;
  lastLevel?: number;
};
export type ProposalAlias = {
  alias?: string | null;
  hash?: string | null;
};
export type ProposalOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  period?: PeriodInfo | null;
  proposal?: ProposalAlias | null;
  delegate?: Alias | null;
  votingPower?: number;
  duplicated?: boolean;
  quote?: QuoteShort | null;
  rolls?: number;
};
export type BallotOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  period?: PeriodInfo | null;
  proposal?: ProposalAlias | null;
  delegate?: Alias | null;
  votingPower?: number;
  vote?: string | null;
  quote?: QuoteShort | null;
  rolls?: number;
};
export type ActivationOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  account?: Alias | null;
  balance?: number;
  quote?: QuoteShort | null;
};
export type DoubleBakingOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  accusedLevel?: number;
  accuser?: Alias | null;
  accuserReward?: number;
  offender?: Alias | null;
  offenderLoss?: number;
  quote?: QuoteShort | null;
  accuserRewards?: number;
  offenderLostDeposits?: number;
  offenderLostRewards?: number;
  offenderLostFees?: number;
};
export type DoubleEndorsingOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  accusedLevel?: number;
  accuser?: Alias | null;
  accuserReward?: number;
  offender?: Alias | null;
  offenderLoss?: number;
  quote?: QuoteShort | null;
  accuserRewards?: number;
  offenderLostDeposits?: number;
  offenderLostRewards?: number;
  offenderLostFees?: number;
};
export type DoublePreendorsingOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  accusedLevel?: number;
  accuser?: Alias | null;
  accuserReward?: number;
  offender?: Alias | null;
  offenderLoss?: number;
  quote?: QuoteShort | null;
};
export type NonceRevelationOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  baker?: Alias | null;
  sender?: Alias | null;
  revealedLevel?: number;
  revealedCycle?: number;
  nonce?: string | null;
  reward?: number;
  quote?: QuoteShort | null;
  bakerRewards?: number;
};
export type OperationError = {
  type: string;
};
export type DelegationOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  counter?: number;
  initiator?: Alias | null;
  sender?: Alias | null;
  senderCodeHash?: number | null;
  nonce?: number | null;
  gasLimit?: number;
  gasUsed?: number;
  bakerFee?: number;
  amount?: number;
  prevDelegate?: Alias | null;
  newDelegate?: Alias | null;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type BigMapDiff = {
  bigmap?: number;
  path?: string | null;
  action?: string | null;
  content?: BigMapKeyShort | null;
};
export type OriginatedContract = {
  kind?: string | null;
  alias?: string | null;
  address?: string | null;
  typeHash?: number;
  codeHash?: number;
  tzips?: string[] | null;
};
export type OriginationOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  counter?: number;
  initiator?: Alias | null;
  sender?: Alias | null;
  senderCodeHash?: number | null;
  nonce?: number | null;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  storageFee?: number;
  allocationFee?: number;
  contractBalance?: number;
  contractManager?: Alias | null;
  contractDelegate?: Alias | null;
  code?: any | null;
  storage?: any | null;
  diffs?: BigMapDiff[] | null;
  status?: string | null;
  errors?: OperationError[] | null;
  originatedContract?: OriginatedContract | null;
  tokenTransfersCount?: number | null;
  quote?: QuoteShort | null;
};
export type TxParameter = {
  entrypoint?: string | null;
  value?: any | null;
};
export type TransactionOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  counter?: number;
  initiator?: Alias | null;
  sender?: Alias | null;
  senderCodeHash?: number | null;
  nonce?: number | null;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  storageFee?: number;
  allocationFee?: number;
  target?: Alias | null;
  targetCodeHash?: number | null;
  amount?: number;
  parameter?: TxParameter | null;
  storage?: any | null;
  diffs?: BigMapDiff[] | null;
  status?: string | null;
  errors?: OperationError[] | null;
  hasInternals?: boolean;
  tokenTransfersCount?: number | null;
  quote?: QuoteShort | null;
};
export type RevealOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  bakerFee?: number;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type RegisterConstantOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  storageFee?: number;
  status?: string | null;
  address?: string | null;
  value?: any | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type SetDepositsLimitOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  bakerFee?: number;
  status?: string | null;
  limit?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type RawJson = Record<string, unknown>;
export type TransferTicketOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  storageFee?: number;
  target?: Alias | null;
  ticketer?: Alias | null;
  amount?: string | null;
  entrypoint?: string | null;
  contentType?: RawJson | null;
  content?: any | null;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type TxRollupCommitOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  rollup?: Alias | null;
  bond?: number;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type TxRollupDispatchTicketsOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  storageFee?: number;
  rollup?: Alias | null;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type TxRollupFinalizeCommitmentOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  rollup?: Alias | null;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type TxRollupOriginationOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  allocationFee?: number;
  rollup?: Alias | null;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type TxRollupRejectionOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  rollup?: Alias | null;
  committer?: Alias | null;
  reward?: number;
  loss?: number;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type TxRollupRemoveCommitmentOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  rollup?: Alias | null;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type TxRollupReturnBondOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  rollup?: Alias | null;
  bond?: number;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type TxRollupSubmitBatchOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  hash?: string | null;
  sender?: Alias | null;
  counter?: number;
  gasLimit?: number;
  gasUsed?: number;
  storageLimit?: number;
  storageUsed?: number;
  bakerFee?: number;
  storageFee?: number;
  rollup?: Alias | null;
  status?: string | null;
  errors?: OperationError[] | null;
  quote?: QuoteShort | null;
};
export type MigrationOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  kind?: string | null;
  account?: Alias | null;
  balanceChange?: number;
  storage?: any | null;
  diffs?: BigMapDiff[] | null;
  tokenTransfersCount?: number | null;
  quote?: QuoteShort | null;
};
export type RevelationPenaltyOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  baker?: Alias | null;
  missedLevel?: number;
  loss?: number;
  quote?: QuoteShort | null;
  lostReward?: number;
  lostFees?: number;
};
export type EndorsingRewardOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  baker?: Alias | null;
  expected?: number;
  received?: number;
  quote?: QuoteShort | null;
};
export type Block = {
  cycle?: number;
  level?: number;
  hash?: string | null;
  timestamp?: string;
  proto?: number;
  payloadRound?: number;
  blockRound?: number;
  validations?: number;
  deposit?: number;
  reward?: number;
  bonus?: number;
  fees?: number;
  nonceRevealed?: boolean;
  proposer?: Alias | null;
  producer?: Alias | null;
  software?: SoftwareAlias | null;
  lbToggle?: boolean | null;
  lbToggleEma?: number;
  endorsements?: EndorsementOperation[] | null;
  preendorsements?: PreendorsementOperation[] | null;
  proposals?: ProposalOperation[] | null;
  ballots?: BallotOperation[] | null;
  activations?: ActivationOperation[] | null;
  doubleBaking?: DoubleBakingOperation[] | null;
  doubleEndorsing?: DoubleEndorsingOperation[] | null;
  doublePreendorsing?: DoublePreendorsingOperation[] | null;
  nonceRevelations?: NonceRevelationOperation[] | null;
  delegations?: DelegationOperation[] | null;
  originations?: OriginationOperation[] | null;
  transactions?: TransactionOperation[] | null;
  reveals?: RevealOperation[] | null;
  registerConstants?: RegisterConstantOperation[] | null;
  setDepositsLimits?: SetDepositsLimitOperation[] | null;
  transferTicketOps?: TransferTicketOperation[] | null;
  txRollupCommitOps?: TxRollupCommitOperation[] | null;
  txRollupDispatchTicketsOps?: TxRollupDispatchTicketsOperation[] | null;
  txRollupFinalizeCommitmentOps?: TxRollupFinalizeCommitmentOperation[] | null;
  txRollupOriginationOps?: TxRollupOriginationOperation[] | null;
  txRollupRejectionOps?: TxRollupRejectionOperation[] | null;
  txRollupRemoveCommitmentOps?: TxRollupRemoveCommitmentOperation[] | null;
  txRollupReturnBondOps?: TxRollupReturnBondOperation[] | null;
  txRollupSubmitBatchOps?: TxRollupSubmitBatchOperation[] | null;
  migrations?: MigrationOperation[] | null;
  revelationPenalties?: RevelationPenaltyOperation[] | null;
  endorsingRewards?: EndorsingRewardOperation[] | null;
  quote?: QuoteShort | null;
  priority?: number;
  baker?: Alias | null;
  lbEscapeVote?: boolean;
  lbEscapeEma?: number;
};
export type Commitment = {
  address?: string | null;
  balance?: number;
  activated?: boolean;
  activationLevel?: number | null;
  activationTime?: string | null;
  activatedAccount?: Alias | null;
};
export type Int32NullParameter = {
  eq?: number;
  ne?: number;
  gt?: number;
  ge?: number;
  lt?: number;
  le?: number;
  in?: number[];
  ni?: number[];
  null?: boolean;
};
export type ExpressionParameter = {
  eq?: string;
  ne?: string;
  in?: string[];
  ni?: string[];
};
export type Constant = {
  address?: string | null;
  value?: any | null;
  size?: number;
  refs?: number;
  creator?: Alias | null;
  creationLevel?: number;
  creationTime?: string;
  metadata?: RawJson | null;
};
export type ContractTagsParameter = {
  eq?: ("fa1" | "fa12" | "fa2")[];
  any?: ("fa1" | "fa12" | "fa2")[];
  all?: ("fa1" | "fa12" | "fa2")[];
};
export type CreatorInfo = {
  alias?: string | null;
  address?: string | null;
};
export type ManagerInfo = {
  alias?: string | null;
  address?: string | null;
  publicKey?: string | null;
};
export type Contract = Account & {
  id?: number;
  type?: string | null;
  address?: string | null;
  kind?: string | null;
  tzips?: string[] | null;
  alias?: string | null;
  balance?: number;
  creator?: CreatorInfo | null;
  manager?: ManagerInfo | null;
  delegate?: DelegateInfo | null;
  delegationLevel?: number | null;
  delegationTime?: string | null;
  numContracts?: number;
  activeTokensCount?: number;
  tokenBalancesCount?: number;
  tokenTransfersCount?: number;
  numDelegations?: number;
  numOriginations?: number;
  numTransactions?: number;
  numReveals?: number;
  numMigrations?: number;
  transferTicketCount?: number;
  firstActivity?: number;
  firstActivityTime?: string;
  lastActivity?: number;
  lastActivityTime?: string;
  storage?: any | null;
  typeHash?: number;
  codeHash?: number;
  metadata?: ProfileMetadata | null;
};
export type EntrypointInterface = {
  name?: string | null;
  parameterSchema?: RawJson | null;
};
export type BigMapInterface = {
  path?: string | null;
  name?: string | null;
  keySchema?: RawJson | null;
  valueSchema?: RawJson | null;
};
export type ContractInterface = {
  storageSchema?: RawJson | null;
  entrypoints?: EntrypointInterface[] | null;
  bigMaps?: BigMapInterface[] | null;
};
export type Entrypoint = {
  name?: string | null;
  jsonParameters?: any | null;
  michelineParameters?: IMicheline | null;
  michelsonParameters?: string | null;
  unused?: boolean;
};
export type ContractView = {
  name?: string | null;
  jsonParameterType?: any | null;
  jsonReturnType?: any | null;
  michelineParameterType?: IMicheline | null;
  michelineReturnType?: IMicheline | null;
  michelsonParameterType?: string | null;
  michelsonReturnType?: string | null;
};
export type SourceOperation = {
  type?: string | null;
  hash?: string | null;
  counter?: number | null;
  nonce?: number | null;
  parameter?: TxParameter | null;
};
export type StorageRecord = {
  id?: number;
  level?: number;
  timestamp?: string;
  operation?: SourceOperation | null;
  value?: any | null;
};
export type Cycle = {
  index?: number;
  firstLevel?: number;
  startTime?: string;
  lastLevel?: number;
  endTime?: string;
  snapshotIndex?: number;
  snapshotLevel?: number;
  randomSeed?: string | null;
  totalBakers?: number;
  totalStaking?: number;
  totalDelegators?: number;
  totalDelegated?: number;
  selectedBakers?: number;
  selectedStake?: number;
  quote?: QuoteShort | null;
  totalRolls?: number;
};
export type Delegate = Account & {
  id?: number;
  type?: string | null;
  address?: string | null;
  active?: boolean;
  alias?: string | null;
  publicKey?: string | null;
  revealed?: boolean;
  balance?: number;
  rollupBonds?: number;
  frozenDeposit?: number;
  frozenDepositLimit?: number | null;
  counter?: number;
  activationLevel?: number;
  activationTime?: string;
  deactivationLevel?: number | null;
  deactivationTime?: string | null;
  stakingBalance?: number;
  delegatedBalance?: number;
  numContracts?: number;
  rollupsCount?: number;
  activeTokensCount?: number;
  tokenBalancesCount?: number;
  tokenTransfersCount?: number;
  numDelegators?: number;
  numBlocks?: number;
  numEndorsements?: number;
  numPreendorsements?: number;
  numBallots?: number;
  numProposals?: number;
  numActivations?: number;
  numDoubleBaking?: number;
  numDoubleEndorsing?: number;
  numDoublePreendorsing?: number;
  numNonceRevelations?: number;
  numRevelationPenalties?: number;
  numEndorsingRewards?: number;
  numDelegations?: number;
  numOriginations?: number;
  numTransactions?: number;
  numReveals?: number;
  numRegisterConstants?: number;
  numSetDepositsLimits?: number;
  numMigrations?: number;
  txRollupOriginationCount?: number;
  txRollupSubmitBatchCount?: number;
  txRollupCommitCount?: number;
  txRollupReturnBondCount?: number;
  txRollupFinalizeCommitmentCount?: number;
  txRollupRemoveCommitmentCount?: number;
  txRollupRejectionCount?: number;
  txRollupDispatchTicketsCount?: number;
  transferTicketCount?: number;
  firstActivity?: number;
  firstActivityTime?: string;
  lastActivity?: number;
  lastActivityTime?: string;
  metadata?: ProfileMetadata | null;
  software?: SoftwareAlias | null;
  frozenDeposits?: number;
  frozenRewards?: number;
  frozenFees?: number;
};
export type State = {
  chain?: string | null;
  chainId?: string | null;
  cycle?: number;
  level?: number;
  hash?: string | null;
  protocol?: string | null;
  nextProtocol?: string | null;
  timestamp?: string;
  votingEpoch?: number;
  votingPeriod?: number;
  knownLevel?: number;
  lastSync?: string;
  synced?: boolean;
  quoteLevel?: number;
  quoteBtc?: number;
  quoteEur?: number;
  quoteUsd?: number;
  quoteCny?: number;
  quoteJpy?: number;
  quoteKrw?: number;
  quoteEth?: number;
  quoteGbp?: number;
};
export type MigrationKindParameter = {
  eq?:
    | "bootstrap"
    | "activate_delegate"
    | "airdrop"
    | "proposal_invoice"
    | "code_change"
    | "origination"
    | "subsidy";
  ne?:
    | "bootstrap"
    | "activate_delegate"
    | "airdrop"
    | "proposal_invoice"
    | "code_change"
    | "origination"
    | "subsidy";
  in?: (
    | "bootstrap"
    | "activate_delegate"
    | "airdrop"
    | "proposal_invoice"
    | "code_change"
    | "origination"
    | "subsidy"
  )[];
  ni?: (
    | "bootstrap"
    | "activate_delegate"
    | "airdrop"
    | "proposal_invoice"
    | "code_change"
    | "origination"
    | "subsidy"
  )[];
};
export type BakingOperation = Operation & {
  type?: string | null;
  id?: number;
  level?: number;
  timestamp?: string;
  block?: string | null;
  proposer?: Alias | null;
  producer?: Alias | null;
  payloadRound?: number;
  blockRound?: number;
  deposit?: number;
  reward?: number;
  bonus?: number;
  fees?: number;
  quote?: QuoteShort | null;
  baker?: Alias | null;
  priority?: number;
};
export type ProtocolParameter = {
  eq?: string;
  ne?: string;
  in?: string[];
  ni?: string[];
};
export type VoteParameter = {
  eq?: "yay" | "nay" | "pass";
  ne?: "yay" | "nay" | "pass";
  in?: ("yay" | "nay" | "pass")[];
  ni?: ("yay" | "nay" | "pass")[];
};
export type ProtocolConstants = {
  rampUpCycles?: number;
  noRewardCycles?: number;
  preservedCycles?: number;
  blocksPerCycle?: number;
  blocksPerCommitment?: number;
  blocksPerSnapshot?: number;
  blocksPerVoting?: number;
  timeBetweenBlocks?: number;
  endorsersPerBlock?: number;
  hardOperationGasLimit?: number;
  hardOperationStorageLimit?: number;
  hardBlockGasLimit?: number;
  tokensPerRoll?: number;
  revelationReward?: number;
  blockDeposit?: number;
  blockReward?: number[] | null;
  endorsementDeposit?: number;
  endorsementReward?: number[] | null;
  originationSize?: number;
  byteCost?: number;
  proposalQuorum?: number;
  ballotQuorumMin?: number;
  ballotQuorumMax?: number;
  lbSubsidy?: number;
  lbSunsetLevel?: number;
  lbToggleThreshold?: number;
  consensusThreshold?: number;
  minParticipationNumerator?: number;
  minParticipationDenominator?: number;
  maxSlashingPeriod?: number;
  frozenDepositsPercentage?: number;
  doubleBakingPunishment?: number;
  doubleEndorsingPunishmentNumerator?: number;
  doubleEndorsingPunishmentDenominator?: number;
  txRollupOriginationSize?: number;
  txRollupCommitmentBond?: number;
  lbEscapeThreshold?: number;
};
export type ProtocolMetadata = {
  alias?: string | null;
  hash?: string | null;
  docs?: string | null;
};
export type Protocol = {
  code?: number;
  hash?: string | null;
  firstLevel?: number;
  firstCycle?: number;
  firstCycleLevel?: number;
  lastLevel?: number | null;
  constants?: ProtocolConstants | null;
  metadata?: ProtocolMetadata | null;
};
export type Quote = {
  level?: number;
  timestamp?: string;
  btc?: number;
  eur?: number;
  usd?: number;
  cny?: number;
  jpy?: number;
  krw?: number;
  eth?: number;
  gbp?: number;
};
export type BakerRewards = {
  cycle?: number;
  stakingBalance?: number;
  activeStake?: number;
  selectedStake?: number;
  delegatedBalance?: number;
  numDelegators?: number;
  expectedBlocks?: number;
  expectedEndorsements?: number;
  futureBlocks?: number;
  futureBlockRewards?: number;
  blocks?: number;
  blockRewards?: number;
  missedBlocks?: number;
  missedBlockRewards?: number;
  futureEndorsements?: number;
  futureEndorsementRewards?: number;
  endorsements?: number;
  endorsementRewards?: number;
  missedEndorsements?: number;
  missedEndorsementRewards?: number;
  blockFees?: number;
  missedBlockFees?: number;
  doubleBakingRewards?: number;
  doubleBakingLosses?: number;
  doubleEndorsingRewards?: number;
  doubleEndorsingLosses?: number;
  doublePreendorsingRewards?: number;
  doublePreendorsingLosses?: number;
  revelationRewards?: number;
  revelationLosses?: number;
  quote?: QuoteShort | null;
  ownBlocks?: number;
  extraBlocks?: number;
  missedOwnBlocks?: number;
  missedExtraBlocks?: number;
  uncoveredOwnBlocks?: number;
  uncoveredExtraBlocks?: number;
  uncoveredEndorsements?: number;
  ownBlockRewards?: number;
  extraBlockRewards?: number;
  missedOwnBlockRewards?: number;
  missedExtraBlockRewards?: number;
  uncoveredOwnBlockRewards?: number;
  uncoveredExtraBlockRewards?: number;
  uncoveredEndorsementRewards?: number;
  ownBlockFees?: number;
  extraBlockFees?: number;
  missedOwnBlockFees?: number;
  missedExtraBlockFees?: number;
  uncoveredOwnBlockFees?: number;
  uncoveredExtraBlockFees?: number;
  doubleBakingLostDeposits?: number;
  doubleBakingLostRewards?: number;
  doubleBakingLostFees?: number;
  doubleEndorsingLostDeposits?: number;
  doubleEndorsingLostRewards?: number;
  doubleEndorsingLostFees?: number;
  revelationLostRewards?: number;
  revelationLostFees?: number;
  futureBlockDeposits?: number;
  blockDeposits?: number;
  futureEndorsementDeposits?: number;
  endorsementDeposits?: number;
};
export type DelegatorRewards = {
  cycle?: number;
  balance?: number;
  baker?: Alias | null;
  stakingBalance?: number;
  activeStake?: number;
  selectedStake?: number;
  expectedBlocks?: number;
  expectedEndorsements?: number;
  futureBlocks?: number;
  futureBlockRewards?: number;
  blocks?: number;
  blockRewards?: number;
  missedBlocks?: number;
  missedBlockRewards?: number;
  futureEndorsements?: number;
  futureEndorsementRewards?: number;
  endorsements?: number;
  endorsementRewards?: number;
  missedEndorsements?: number;
  missedEndorsementRewards?: number;
  blockFees?: number;
  missedBlockFees?: number;
  doubleBakingRewards?: number;
  doubleBakingLosses?: number;
  doubleEndorsingRewards?: number;
  doubleEndorsingLosses?: number;
  doublePreendorsingRewards?: number;
  doublePreendorsingLosses?: number;
  revelationRewards?: number;
  revelationLosses?: number;
  quote?: QuoteShort | null;
  ownBlocks?: number;
  extraBlocks?: number;
  missedOwnBlocks?: number;
  missedExtraBlocks?: number;
  uncoveredOwnBlocks?: number;
  uncoveredExtraBlocks?: number;
  uncoveredEndorsements?: number;
  ownBlockRewards?: number;
  extraBlockRewards?: number;
  missedOwnBlockRewards?: number;
  missedExtraBlockRewards?: number;
  uncoveredOwnBlockRewards?: number;
  uncoveredExtraBlockRewards?: number;
  uncoveredEndorsementRewards?: number;
  ownBlockFees?: number;
  extraBlockFees?: number;
  missedOwnBlockFees?: number;
  missedExtraBlockFees?: number;
  uncoveredOwnBlockFees?: number;
  uncoveredExtraBlockFees?: number;
  doubleBakingLostDeposits?: number;
  doubleBakingLostRewards?: number;
  doubleBakingLostFees?: number;
  doubleEndorsingLostDeposits?: number;
  doubleEndorsingLostRewards?: number;
  doubleEndorsingLostFees?: number;
  revelationLostRewards?: number;
  revelationLostFees?: number;
};
export type SplitDelegator = {
  address?: string | null;
  balance?: number;
  currentBalance?: number;
  emptied?: boolean;
};
export type RewardSplit = {
  cycle?: number;
  stakingBalance?: number;
  activeStake?: number;
  selectedStake?: number;
  delegatedBalance?: number;
  numDelegators?: number;
  expectedBlocks?: number;
  expectedEndorsements?: number;
  futureBlocks?: number;
  futureBlockRewards?: number;
  blocks?: number;
  blockRewards?: number;
  missedBlocks?: number;
  missedBlockRewards?: number;
  futureEndorsements?: number;
  futureEndorsementRewards?: number;
  endorsements?: number;
  endorsementRewards?: number;
  missedEndorsements?: number;
  missedEndorsementRewards?: number;
  blockFees?: number;
  missedBlockFees?: number;
  doubleBakingRewards?: number;
  doubleBakingLosses?: number;
  doubleEndorsingRewards?: number;
  doubleEndorsingLosses?: number;
  doublePreendorsingRewards?: number;
  doublePreendorsingLosses?: number;
  revelationRewards?: number;
  revelationLosses?: number;
  delegators?: SplitDelegator[] | null;
  ownBlocks?: number;
  extraBlocks?: number;
  missedOwnBlocks?: number;
  missedExtraBlocks?: number;
  uncoveredOwnBlocks?: number;
  uncoveredExtraBlocks?: number;
  uncoveredEndorsements?: number;
  ownBlockRewards?: number;
  extraBlockRewards?: number;
  missedOwnBlockRewards?: number;
  missedExtraBlockRewards?: number;
  uncoveredOwnBlockRewards?: number;
  uncoveredExtraBlockRewards?: number;
  uncoveredEndorsementRewards?: number;
  ownBlockFees?: number;
  extraBlockFees?: number;
  missedOwnBlockFees?: number;
  missedExtraBlockFees?: number;
  uncoveredOwnBlockFees?: number;
  uncoveredExtraBlockFees?: number;
  doubleBakingLostDeposits?: number;
  doubleBakingLostRewards?: number;
  doubleBakingLostFees?: number;
  doubleEndorsingLostDeposits?: number;
  doubleEndorsingLostRewards?: number;
  doubleEndorsingLostFees?: number;
  revelationLostRewards?: number;
  revelationLostFees?: number;
  futureBlockDeposits?: number;
  blockDeposits?: number;
  futureEndorsementDeposits?: number;
  endorsementDeposits?: number;
};
export type BakingRightTypeParameter = {
  eq?: "baking" | "endorsing";
  ne?: "baking" | "endorsing";
};
export type BakingRightStatusParameter = {
  eq?: "future" | "realized" | "uncovered" | "missed";
  ne?: "future" | "realized" | "uncovered" | "missed";
};
export type BakingRight = {
  type?: string | null;
  cycle?: number;
  level?: number;
  timestamp?: string;
  round?: number | null;
  slots?: number | null;
  baker?: Alias | null;
  status?: string | null;
  priority?: number | null;
};
export type Software = {
  shortHash?: string | null;
  firstLevel?: number;
  firstTime?: string;
  lastLevel?: number;
  lastTime?: string;
  blocksCount?: number;
  metadata?: RawJson | null;
};
export type Statistics = {
  cycle?: number | null;
  date?: string | null;
  level?: number;
  timestamp?: string;
  totalSupply?: number;
  circulatingSupply?: number;
  totalBootstrapped?: number;
  totalCommitments?: number;
  totalActivated?: number;
  totalCreated?: number;
  totalBurned?: number;
  totalBanished?: number;
  totalFrozen?: number;
  totalRollupBonds?: number;
  quote?: QuoteShort | null;
  totalVested?: number;
};
export type NatParameter = {
  eq?: string;
  ne?: string;
  gt?: string;
  ge?: string;
  lt?: string;
  le?: string;
  in?: string[];
  ni?: string[];
};
export type TokenStandardParameter = {
  eq?: "fa1.2" | "fa2";
  ne?: "fa1.2" | "fa2";
};
export type SelectionParameter = {
  fields?: string[];
  values?: string[];
};
export type Token = {
  id?: number;
  contract?: Alias | null;
  tokenId?: string | null;
  standard?: string | null;
  firstLevel?: number;
  firstTime?: string;
  lastLevel?: number;
  lastTime?: string;
  transfersCount?: number;
  balancesCount?: number;
  holdersCount?: number;
  totalMinted?: string | null;
  totalBurned?: string | null;
  totalSupply?: string | null;
  metadata?: any | null;
};
export type TokenInfo = {
  id?: number;
  contract?: Alias | null;
  tokenId?: string | null;
  standard?: string | null;
  metadata?: any | null;
};
export type TokenBalance = {
  id?: number;
  account?: Alias | null;
  token?: TokenInfo | null;
  balance?: string | null;
  transfersCount?: number;
  firstLevel?: number;
  firstTime?: string;
  lastLevel?: number;
  lastTime?: string;
};
export type TokenTransfer = {
  id?: number;
  level?: number;
  timestamp?: string;
  token?: TokenInfo | null;
  from?: Alias | null;
  to?: Alias | null;
  amount?: string | null;
  transactionId?: number | null;
  originationId?: number | null;
  migrationId?: number | null;
};
export type TokenBalanceShort = {
  account?: Alias | null;
  token?: TokenInfo | null;
  balance?: string | null;
};
export type ProposalMetadata = {
  alias?: string | null;
  hash?: string | null;
  agora?: string | null;
  invoice?: number;
};
export type Proposal = {
  hash?: string | null;
  initiator?: Alias | null;
  firstPeriod?: number;
  lastPeriod?: number;
  epoch?: number;
  upvotes?: number;
  votingPower?: number;
  status?: string | null;
  metadata?: ProposalMetadata | null;
  rolls?: number;
};
export type VotingPeriod = {
  index?: number;
  epoch?: number;
  firstLevel?: number;
  startTime?: string;
  lastLevel?: number;
  endTime?: string;
  kind?: string | null;
  status?: string | null;
  totalBakers?: number | null;
  totalVotingPower?: number | null;
  upvotesQuorum?: number | null;
  proposalsCount?: number | null;
  topUpvotes?: number | null;
  topVotingPower?: number | null;
  ballotsQuorum?: number | null;
  supermajority?: number | null;
  yayBallots?: number | null;
  yayVotingPower?: number | null;
  nayBallots?: number | null;
  nayVotingPower?: number | null;
  passBallots?: number | null;
  passVotingPower?: number | null;
  totalRolls?: number | null;
  topRolls?: number | null;
  yayRolls?: number | null;
  nayRolls?: number | null;
  passRolls?: number | null;
};
export type VoterStatusParameter = {
  eq?: "none" | "upvoted" | "voted_yay" | "voted_nay" | "voted_pass";
  ne?: "none" | "upvoted" | "voted_yay" | "voted_nay" | "voted_pass";
  in?: ("none" | "upvoted" | "voted_yay" | "voted_nay" | "voted_pass")[];
  ni?: ("none" | "upvoted" | "voted_yay" | "voted_nay" | "voted_pass")[];
};
export type VoterSnapshot = {
  delegate?: Alias | null;
  votingPower?: number;
  status?: string | null;
  rolls?: number;
};
export type VotingEpoch = {
  index?: number;
  firstLevel?: number;
  startTime?: string;
  lastLevel?: number;
  endTime?: string;
  status?: string | null;
  periods?: VotingPeriod[] | null;
  proposals?: Proposal[] | null;
};
/**
 * Get accounts
 */
export function accountsGet(
  {
    id,
    type,
    kind,
    delegate,
    balance,
    staked,
    lastActivity,
    select,
    sort,
    offset,
    limit,
  }: {
    id?: Int32Parameter | null;
    type?: AccountTypeParameter | null;
    kind?: ContractKindParameter | null;
    delegate?: AccountParameter | null;
    balance?: Int64Parameter | null;
    staked?: BoolParameter | null;
    lastActivity?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Account[];
  }>(
    `/v1/accounts${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("type", type),
        ...QueryParamsParsers.queryParameter("kind", kind),
        ...QueryParamsParsers.queryParameter("delegate", delegate),
        ...QueryParamsParsers.queryParameter("balance", balance),
        ...QueryParamsParsers.queryParameter("staked", staked),
        ...QueryParamsParsers.queryParameter("lastActivity", lastActivity),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get accounts count
 */
export function accountsGetCount(
  {
    type,
    kind,
    balance,
    staked,
    firstActivity,
  }: {
    type?: AccountTypeParameter | null;
    kind?: ContractKindParameter | null;
    balance?: Int64Parameter | null;
    staked?: BoolParameter | null;
    firstActivity?: Int32Parameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/accounts/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("type", type),
        ...QueryParamsParsers.queryParameter("kind", kind),
        ...QueryParamsParsers.queryParameter("balance", balance),
        ...QueryParamsParsers.queryParameter("staked", staked),
        ...QueryParamsParsers.queryParameter("firstActivity", firstActivity),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get account by address
 */
export function accountsGetByAddress(
  address: string | null,
  {
    metadata,
  }: {
    metadata?: boolean;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Account;
  }>(
    `/v1/accounts/${address}${QS.query(
      QS.form({
        metadata,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get account contracts
 */
export function accountsGetContracts(
  address: string | null,
  {
    sort,
    offset,
    limit,
  }: {
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: RelatedContract[];
  }>(
    `/v1/accounts/${address}/contracts${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get account delegators
 */
export function accountsGetDelegators(
  address: string | null,
  {
    type,
    balance,
    delegationLevel,
    sort,
    offset,
    limit,
  }: {
    type?: AccountTypeParameter | null;
    balance?: Int64Parameter | null;
    delegationLevel?: Int32Parameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Delegator[];
  }>(
    `/v1/accounts/${address}/delegators${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("type", type),
        ...QueryParamsParsers.queryParameter("balance", balance),
        ...QueryParamsParsers.queryParameter(
          "delegationLevel",
          delegationLevel
        ),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get account operations
 */
export function accountsGetOperations(
  address: string | null,
  {
    type,
    initiator,
    sender,
    target,
    prevDelegate,
    newDelegate,
    contractManager,
    contractDelegate,
    originatedContract,
    accuser,
    offender,
    baker,
    level,
    timestamp,
    entrypoint,
    parameter,
    hasInternals,
    status,
    sort,
    lastId,
    limit,
    micheline,
    quote,
  }: {
    type?: string | null;
    initiator?: AccountParameter | null;
    sender?: AccountParameter | null;
    target?: AccountParameter | null;
    prevDelegate?: AccountParameter | null;
    newDelegate?: AccountParameter | null;
    contractManager?: AccountParameter | null;
    contractDelegate?: AccountParameter | null;
    originatedContract?: AccountParameter | null;
    accuser?: AccountParameter | null;
    offender?: AccountParameter | null;
    baker?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    entrypoint?: StringParameter | null;
    parameter?: JsonParameter | null;
    hasInternals?: BoolParameter | null;
    status?: OperationStatusParameter | null;
    sort?: SortMode;
    lastId?: number | null;
    limit?: number;
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Operation[];
  }>(
    `/v1/accounts/${address}/operations${QS.query(
      QS.form({
        type,
        sort,
        lastId,
        limit,
        micheline,
        quote,
        ...QueryParamsParsers.queryParameter("initiator", initiator),
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("target", target),
        ...QueryParamsParsers.queryParameter("prevDelegate", prevDelegate),
        ...QueryParamsParsers.queryParameter("newDelegate", newDelegate),
        ...QueryParamsParsers.queryParameter(
          "contractManager",
          contractManager
        ),
        ...QueryParamsParsers.queryParameter(
          "contractDelegate",
          contractDelegate
        ),
        ...QueryParamsParsers.queryParameter(
          "originatedContract",
          originatedContract
        ),
        ...QueryParamsParsers.queryParameter("accuser", accuser),
        ...QueryParamsParsers.queryParameter("offender", offender),
        ...QueryParamsParsers.queryParameter("baker", baker),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("entrypoint", entrypoint),
        ...QueryParamsParsers.jsonParameter("parameter", parameter),
        ...QueryParamsParsers.queryParameter("hasInternals", hasInternals),
        ...QueryParamsParsers.queryParameter("status", status),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get account metadata
 */
export function accountsGetMetadata(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ProfileMetadata;
  }>(`/v1/accounts/${address}/metadata`, {
    ...opts,
  });
}
/**
 * Get counter
 */
export function accountsGetCounter(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(`/v1/accounts/${address}/counter`, {
    ...opts,
  });
}
/**
 * Get balance
 */
export function accountsGetBalance(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(`/v1/accounts/${address}/balance`, {
    ...opts,
  });
}
/**
 * Get balance at level
 */
export function accountsGetBalanceAtLevel(
  address: string | null,
  level: number,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(`/v1/accounts/${address}/balance_history/${level}`, {
    ...opts,
  });
}
/**
 * Get balance at date
 */
export function accountsGetBalanceAtDate(
  address: string | null,
  datetime: string,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(`/v1/accounts/${address}/balance_history/${datetime}`, {
    ...opts,
  });
}
/**
 * Get balance history
 */
export function accountsGetBalanceHistory(
  address: string | null,
  {
    step,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    step?: number | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: number;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: HistoricalBalance[];
  }>(
    `/v1/accounts/${address}/balance_history${QS.query(
      QS.form({
        step,
        offset,
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get account report
 */
export function accountsGetBalanceReport(
  address: string | null,
  {
    from,
    to,
    currency,
    historical,
    delimiter,
    separator,
  }: {
    from?: string | null;
    to?: string | null;
    currency?: string | null;
    historical?: boolean;
    delimiter?: string | null;
    separator?: string | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchBlob<{
    status: 200;
    data: Blob;
  }>(
    `/v1/accounts/${address}/report${QS.query(
      QS.form({
        from,
        to,
        currency,
        historical,
        delimiter,
        separator,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmaps count
 */
export function bigMapsGetBigMapsCount(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>("/v1/bigmaps/count", {
    ...opts,
  });
}
/**
 * Get bigmaps
 */
export function bigMapsGetBigMaps(
  {
    contract,
    path,
    tags,
    active,
    lastLevel,
    select,
    sort,
    offset,
    limit,
    micheline,
  }: {
    contract?: AccountParameter | null;
    path?: StringParameter | null;
    tags?: BigMapTagsParameter | null;
    active?: boolean | null;
    lastLevel?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMap[];
  }>(
    `/v1/bigmaps${QS.query(
      QS.form({
        active,
        limit,
        micheline,
        ...QueryParamsParsers.queryParameter("contract", contract),
        ...QueryParamsParsers.queryParameter("path", path),
        ...QueryParamsParsers.queryParameter("tags", tags),
        ...QueryParamsParsers.queryParameter("lastLevel", lastLevel),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmap updates
 */
export function bigMapsGetBigMapUpdates(
  {
    bigmap,
    path,
    contract,
    tags,
    action,
    value,
    level,
    timestamp,
    sort,
    offset,
    limit,
    micheline,
  }: {
    bigmap?: Int32Parameter | null;
    path?: StringParameter | null;
    contract?: AccountParameter | null;
    tags?: BigMapTagsParameter | null;
    action?: BigMapActionParameter | null;
    value?: JsonParameter | null;
    level?: Int32Parameter | null;
    timestamp?: TimestampParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapUpdate[];
  }>(
    `/v1/bigmaps/updates${QS.query(
      QS.form({
        limit,
        micheline,
        ...QueryParamsParsers.queryParameter("bigmap", bigmap),
        ...QueryParamsParsers.queryParameter("path", path),
        ...QueryParamsParsers.queryParameter("contract", contract),
        ...QueryParamsParsers.queryParameter("tags", tags),
        ...QueryParamsParsers.queryParameter("action", action),
        ...QueryParamsParsers.jsonParameter("value", value),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmap by Id
 */
export function bigMapsGetBigMapById(
  id: number,
  {
    micheline,
  }: {
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMap;
  }>(
    `/v1/bigmaps/${id}${QS.query(
      QS.form({
        micheline,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmap type
 */
export function bigMapsGetBigMapType(id: number, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: MichelinePrim;
  }>(`/v1/bigmaps/${id}/type`, {
    ...opts,
  });
}
/**
 * Get bigmap keys
 */
export function bigMapsGetKeys(
  id: number,
  {
    active,
    key,
    value,
    lastLevel,
    select,
    sort,
    offset,
    limit,
    micheline,
  }: {
    active?: boolean | null;
    key?: JsonParameter | null;
    value?: JsonParameter | null;
    lastLevel?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKey[];
  }>(
    `/v1/bigmaps/${id}/keys${QS.query(
      QS.form({
        active,
        limit,
        micheline,
        ...QueryParamsParsers.jsonParameter("key", key),
        ...QueryParamsParsers.jsonParameter("value", value),
        ...QueryParamsParsers.queryParameter("lastLevel", lastLevel),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmap key
 */
export function bigMapsGetKey(
  id: number,
  key: string | null,
  {
    micheline,
  }: {
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKey;
  }>(
    `/v1/bigmaps/${id}/keys/${key}${QS.query(
      QS.form({
        micheline,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmap key updates
 */
export function bigMapsGetKeyUpdates(
  id: number,
  key: string | null,
  {
    sort,
    offset,
    limit,
    micheline,
  }: {
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKeyUpdate[];
  }>(
    `/v1/bigmaps/${id}/keys/${key}/updates${QS.query(
      QS.form({
        limit,
        micheline,
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get historical keys
 */
export function bigMapsGetHistoricalKeys(
  id: number,
  level: number,
  {
    active,
    key,
    value,
    select,
    sort,
    offset,
    limit,
    micheline,
  }: {
    active?: boolean | null;
    key?: JsonParameter | null;
    value?: JsonParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKeyHistorical[];
  }>(
    `/v1/bigmaps/${id}/historical_keys/${level}${QS.query(
      QS.form({
        active,
        limit,
        micheline,
        ...QueryParamsParsers.jsonParameter("key", key),
        ...QueryParamsParsers.jsonParameter("value", value),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get historical key
 */
export function bigMapsGetKey2(
  id: number,
  level: number,
  key: string | null,
  {
    micheline,
  }: {
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKeyHistorical;
  }>(
    `/v1/bigmaps/${id}/historical_keys/${level}/${key}${QS.query(
      QS.form({
        micheline,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get blocks count
 */
export function blocksGetCount(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>("/v1/blocks/count", {
    ...opts,
  });
}
/**
 * Get blocks
 */
export function blocksGet(
  {
    baker,
    anyof,
    proposer,
    producer,
    level,
    timestamp,
    priority,
    blockRound,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    baker?: AccountParameter | null;
    anyof?: {
      value?: string | null;
      fields?: ("proposer" | "producer")[];
      in?: ("proposer" | "producer")[];
      null?: boolean;
      eq?: "proposer" | "producer";
    };
    proposer?: AccountParameter | null;
    producer?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    priority?: Int32Parameter | null;
    blockRound?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Block[];
  }>(
    `/v1/blocks${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("baker", baker),
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("proposer", proposer),
        ...QueryParamsParsers.queryParameter("producer", producer),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("priority", priority),
        ...QueryParamsParsers.queryParameter("blockRound", blockRound),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get block by hash
 */
export function blocksGetByHash(
  hash: string | null,
  {
    operations,
    micheline,
    quote,
  }: {
    operations?: boolean;
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Block;
  }>(
    `/v1/blocks/${hash}${QS.query(
      QS.form({
        operations,
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get block by level
 */
export function blocksGetByLevel(
  level: number,
  {
    operations,
    micheline,
    quote,
  }: {
    operations?: boolean;
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Block;
  }>(
    `/v1/blocks/${level}${QS.query(
      QS.form({
        operations,
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get timestamp by level
 */
export function blocksGetByLevel2(level: number, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: string;
  }>(`/v1/blocks/${level}/timestamp`, {
    ...opts,
  });
}
/**
 * Get block by timestamp
 */
export function blocksGetByDate(
  timestamp: string,
  {
    operations,
    micheline,
    quote,
  }: {
    operations?: boolean;
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Block;
  }>(
    `/v1/blocks/${timestamp}${QS.query(
      QS.form({
        operations,
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get level by timestamp
 */
export function blocksGetByDate2(
  timestamp: string,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(`/v1/blocks/${timestamp}/level`, {
    ...opts,
  });
}
/**
 * Get commitment by blinded address
 */
export function commitmentsGet(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Commitment;
  }>(`/v1/commitments/${address}`, {
    ...opts,
  });
}
/**
 * Get commitments
 */
export function commitmentsGetAll(
  {
    activated,
    activationLevel,
    balance,
    select,
    sort,
    offset,
    limit,
  }: {
    activated?: boolean | null;
    activationLevel?: Int32NullParameter | null;
    balance?: Int64Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Commitment[];
  }>(
    `/v1/commitments${QS.query(
      QS.form({
        activated,
        limit,
        ...QueryParamsParsers.queryParameter(
          "activationLevel",
          activationLevel
        ),
        ...QueryParamsParsers.queryParameter("balance", balance),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get commitments count
 */
export function commitmentsGetCount(
  {
    activated,
    balance,
  }: {
    activated?: boolean | null;
    balance?: Int64Parameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/commitments/count${QS.query(
      QS.form({
        activated,
        ...QueryParamsParsers.queryParameter("balance", balance),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get global constants
 */
export function constantsGet(
  {
    address,
    creationLevel,
    creationTime,
    creator,
    refs,
    size,
    select,
    sort,
    offset,
    limit,
    format,
  }: {
    address?: ExpressionParameter | null;
    creationLevel?: Int32Parameter | null;
    creationTime?: TimestampParameter | null;
    creator?: AccountParameter | null;
    refs?: Int32Parameter | null;
    size?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    format?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Constant[];
  }>(
    `/v1/constants${QS.query(
      QS.form({
        limit,
        format,
        ...QueryParamsParsers.queryParameter("address", address),
        ...QueryParamsParsers.queryParameter("creationLevel", creationLevel),
        ...QueryParamsParsers.queryParameter("creationTime", creationTime),
        ...QueryParamsParsers.queryParameter("creator", creator),
        ...QueryParamsParsers.queryParameter("refs", refs),
        ...QueryParamsParsers.queryParameter("size", size),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get global constant by address
 */
export function constantsGetByAddress(
  address: string | null,
  {
    format,
  }: {
    format?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Constant;
  }>(
    `/v1/constants/${address}${QS.query(
      QS.form({
        format,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get global constants count
 */
export function constantsGetCount(
  {
    refs,
  }: {
    refs?: Int32Parameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/constants/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("refs", refs),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get contracts
 */
export function contractsGet(
  {
    kind,
    tzips,
    creator,
    manager,
    delegate,
    balance,
    lastActivity,
    typeHash,
    codeHash,
    select,
    sort,
    offset,
    limit,
    includeStorage,
  }: {
    kind?: ContractKindParameter | null;
    tzips?: ContractTagsParameter | null;
    creator?: AccountParameter | null;
    manager?: AccountParameter | null;
    delegate?: AccountParameter | null;
    balance?: Int64Parameter | null;
    lastActivity?: Int32Parameter | null;
    typeHash?: Int32Parameter | null;
    codeHash?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    includeStorage?: boolean;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Contract[];
  }>(
    `/v1/contracts${QS.query(
      QS.form({
        limit,
        includeStorage,
        ...QueryParamsParsers.queryParameter("kind", kind),
        ...QueryParamsParsers.queryParameter("tzips", tzips),
        ...QueryParamsParsers.queryParameter("creator", creator),
        ...QueryParamsParsers.queryParameter("manager", manager),
        ...QueryParamsParsers.queryParameter("delegate", delegate),
        ...QueryParamsParsers.queryParameter("balance", balance),
        ...QueryParamsParsers.queryParameter("lastActivity", lastActivity),
        ...QueryParamsParsers.queryParameter("typeHash", typeHash),
        ...QueryParamsParsers.queryParameter("codeHash", codeHash),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get contracts count
 */
export function contractsGetCount(
  {
    kind,
  }: {
    kind?: ContractKindParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/contracts/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("kind", kind),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get contract by address
 */
export function contractsGetByAddress(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Contract;
  }>(`/v1/contracts/${address}`, {
    ...opts,
  });
}
/**
 * Get same contracts
 */
export function contractsGetSame(
  address: string | null,
  {
    select,
    sort,
    offset,
    limit,
    includeStorage,
  }: {
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    includeStorage?: boolean;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Contract[];
  }>(
    `/v1/contracts/${address}/same${QS.query(
      QS.form({
        limit,
        includeStorage,
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get similar contracts
 */
export function contractsGetSimilar(
  address: string | null,
  {
    select,
    sort,
    offset,
    limit,
    includeStorage,
  }: {
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    includeStorage?: boolean;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Contract[];
  }>(
    `/v1/contracts/${address}/similar${QS.query(
      QS.form({
        limit,
        includeStorage,
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get contract code
 */
export function contractsGetCode(
  address: string | null,
  {
    level,
    format,
  }: {
    level?: number;
    format?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchBlob<{
    status: 200;
    data: Blob;
  }>(
    `/v1/contracts/${address}/code${QS.query(
      QS.form({
        level,
        format,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get JSON Schema [2020-12] interface for the contract
 */
export function contractsGetInterface(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ContractInterface;
  }>(`/v1/contracts/${address}/interface`, {
    ...opts,
  });
}
/**
 * Get contract entrypoints
 */
export function contractsGetEntrypoints(
  address: string | null,
  {
    all,
    json,
    micheline,
    michelson,
  }: {
    all?: boolean;
    json?: boolean;
    micheline?: boolean;
    michelson?: boolean;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Entrypoint[];
  }>(
    `/v1/contracts/${address}/entrypoints${QS.query(
      QS.form({
        all,
        json,
        micheline,
        michelson,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get entrypoint by name
 */
export function contractsGetEntrypointByName(
  address: string | null,
  name: string | null,
  {
    json,
    micheline,
    michelson,
  }: {
    json?: boolean;
    micheline?: boolean;
    michelson?: boolean;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Entrypoint;
  }>(
    `/v1/contracts/${address}/entrypoints/${name}${QS.query(
      QS.form({
        json,
        micheline,
        michelson,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get contract views
 */
export function contractsGetContractViews(
  address: string | null,
  {
    json,
    micheline,
    michelson,
  }: {
    json?: boolean;
    micheline?: boolean;
    michelson?: boolean;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ContractView[];
  }>(
    `/v1/contracts/${address}/views${QS.query(
      QS.form({
        json,
        micheline,
        michelson,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get view by name
 */
export function contractsGetContractViewByName(
  address: string | null,
  name: string | null,
  {
    json,
    micheline,
    michelson,
  }: {
    json?: boolean;
    micheline?: boolean;
    michelson?: boolean;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ContractView;
  }>(
    `/v1/contracts/${address}/views/${name}${QS.query(
      QS.form({
        json,
        micheline,
        michelson,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Build entrypoint parameters
 */
export function contractsBuildEntrypointParametersGet(
  address: string | null,
  name: string | null,
  {
    value,
  }: {
    value?: string | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchBlob<{
    status: 200;
    data: Blob;
  }>(
    `/v1/contracts/${address}/entrypoints/${name}/build${QS.query(
      QS.form({
        value,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Build entrypoint parameters
 */
export function contractsBuildEntrypointParametersPost(
  address: string | null,
  name: string | null,
  body: any,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchBlob<{
    status: 200;
    data: Blob;
  }>(
    `/v1/contracts/${address}/entrypoints/${name}/build`,
    oazapfts.json({
      ...opts,
      method: "POST",
      body,
    })
  );
}
/**
 * Get contract storage
 */
export function contractsGetStorage(
  address: string | null,
  {
    level,
    path,
  }: {
    level?: number;
    path?: string | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchBlob<{
    status: 200;
    data: Blob;
  }>(
    `/v1/contracts/${address}/storage${QS.query(
      QS.form({
        level,
        path,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get contract storage schema
 */
export function contractsGetStorageSchema(
  address: string | null,
  {
    level,
  }: {
    level?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchBlob<{
    status: 200;
    data: Blob;
  }>(
    `/v1/contracts/${address}/storage/schema${QS.query(
      QS.form({
        level,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get contract storage history
 */
export function contractsGetStorageHistory(
  address: string | null,
  {
    lastId,
    limit,
  }: {
    lastId?: number;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: StorageRecord[];
  }>(
    `/v1/contracts/${address}/storage/history${QS.query(
      QS.form({
        lastId,
        limit,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get raw contract storage
 */
export function contractsGetRawStorage(
  address: string | null,
  {
    level,
  }: {
    level?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: IMicheline;
  }>(
    `/v1/contracts/${address}/storage/raw${QS.query(
      QS.form({
        level,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get raw contract storage schema
 */
export function contractsGetRawStorageSchema(
  address: string | null,
  {
    level,
  }: {
    level?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: IMicheline;
  }>(
    `/v1/contracts/${address}/storage/raw/schema${QS.query(
      QS.form({
        level,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get raw contract storage history
 */
export function contractsGetRawStorageHistory(
  address: string | null,
  {
    lastId,
    limit,
  }: {
    lastId?: number;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: StorageRecord[];
  }>(
    `/v1/contracts/${address}/storage/raw/history${QS.query(
      QS.form({
        lastId,
        limit,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get contract bigmaps
 */
export function contractsGetBigMaps(
  address: string | null,
  {
    tags,
    select,
    sort,
    offset,
    limit,
    micheline,
  }: {
    tags?: BigMapTagsParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMap[];
  }>(
    `/v1/contracts/${address}/bigmaps${QS.query(
      QS.form({
        limit,
        micheline,
        ...QueryParamsParsers.queryParameter("tags", tags),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmap by name
 */
export function contractsGetBigMapByName(
  address: string | null,
  name: string | null,
  {
    micheline,
  }: {
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMap;
  }>(
    `/v1/contracts/${address}/bigmaps/${name}${QS.query(
      QS.form({
        micheline,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmap keys
 */
export function contractsGetBigMapByNameKeys(
  address: string | null,
  name: string | null,
  {
    active,
    key,
    value,
    lastLevel,
    select,
    sort,
    offset,
    limit,
    micheline,
  }: {
    active?: boolean | null;
    key?: JsonParameter | null;
    value?: JsonParameter | null;
    lastLevel?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKey[];
  }>(
    `/v1/contracts/${address}/bigmaps/${name}/keys${QS.query(
      QS.form({
        active,
        limit,
        micheline,
        ...QueryParamsParsers.jsonParameter("key", key),
        ...QueryParamsParsers.jsonParameter("value", value),
        ...QueryParamsParsers.queryParameter("lastLevel", lastLevel),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmap key
 */
export function contractsGetKey(
  address: string | null,
  name: string | null,
  key: string | null,
  {
    micheline,
  }: {
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKey;
  }>(
    `/v1/contracts/${address}/bigmaps/${name}/keys/${key}${QS.query(
      QS.form({
        micheline,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get bigmap key updates
 */
export function contractsGetKeyUpdates(
  address: string | null,
  name: string | null,
  key: string | null,
  {
    sort,
    offset,
    limit,
    micheline,
  }: {
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKeyUpdate[];
  }>(
    `/v1/contracts/${address}/bigmaps/${name}/keys/${key}/updates${QS.query(
      QS.form({
        limit,
        micheline,
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get historical keys
 */
export function contractsGetHistoricalKeys(
  address: string | null,
  name: string | null,
  level: number,
  {
    active,
    key,
    value,
    select,
    sort,
    offset,
    limit,
    micheline,
  }: {
    active?: boolean | null;
    key?: JsonParameter | null;
    value?: JsonParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKeyHistorical[];
  }>(
    `/v1/contracts/${address}/bigmaps/${name}/historical_keys/${level}${QS.query(
      QS.form({
        active,
        limit,
        micheline,
        ...QueryParamsParsers.jsonParameter("key", key),
        ...QueryParamsParsers.jsonParameter("value", value),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get historical key
 */
export function contractsGetKey2(
  address: string | null,
  name: string | null,
  level: number,
  key: string | null,
  {
    micheline,
  }: {
    micheline?: MichelineFormat;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BigMapKeyHistorical;
  }>(
    `/v1/contracts/${address}/bigmaps/${name}/historical_keys/${level}/${key}${QS.query(
      QS.form({
        micheline,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get cycles count
 */
export function cyclesGetCount(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>("/v1/cycles/count", {
    ...opts,
  });
}
/**
 * Get cycles
 */
export function cyclesGet(
  {
    snapshotIndex,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    snapshotIndex?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Cycle[];
  }>(
    `/v1/cycles${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("snapshotIndex", snapshotIndex),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get cycle by index
 */
export function cyclesGetByIndex(
  index: number,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Cycle;
  }>(
    `/v1/cycles/${index}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get delegates
 */
export function delegatesGet(
  {
    active,
    lastActivity,
    select,
    sort,
    offset,
    limit,
  }: {
    active?: BoolParameter | null;
    lastActivity?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Delegate[];
  }>(
    `/v1/delegates${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("active", active),
        ...QueryParamsParsers.queryParameter("lastActivity", lastActivity),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get delegates count
 */
export function delegatesGetCount(
  {
    active,
  }: {
    active?: BoolParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/delegates/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("active", active),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get delegate by address
 */
export function delegatesGetByAddress(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Delegate;
  }>(`/v1/delegates/${address}`, {
    ...opts,
  });
}
/**
 * Get indexer head
 */
export function headGet(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: State;
  }>("/v1/head", {
    ...opts,
  });
}
/**
 * Get tx rollup remove commitment count
 */
export function operationsGetTxRollupRemoveCommitmentOpsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/tx_rollup_remove_commitment/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup return bond
 */
export function operationsGetTxRollupReturnBondOps(
  {
    sender,
    rollup,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    sender?: AccountParameter | null;
    rollup?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupReturnBondOperation[];
  }>(
    `/v1/operations/tx_rollup_return_bond${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("rollup", rollup),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup return bond by hash
 */
export function operationsGetTxRollupReturnBondOpsByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupReturnBondOperation[];
  }>(
    `/v1/operations/tx_rollup_return_bond/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup return bond status
 */
export function operationsGetTxRollupReturnBondStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/tx_rollup_return_bond/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get tx rollup return bond count
 */
export function operationsGetTxRollupReturnBondOpsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/tx_rollup_return_bond/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup submit batch
 */
export function operationsGetTxRollupSubmitBatchOps(
  {
    sender,
    rollup,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    sender?: AccountParameter | null;
    rollup?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupSubmitBatchOperation[];
  }>(
    `/v1/operations/tx_rollup_submit_batch${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("rollup", rollup),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup submit batch by hash
 */
export function operationsGetTxRollupSubmitBatchOpsByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupSubmitBatchOperation[];
  }>(
    `/v1/operations/tx_rollup_submit_batch/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup submit batch status
 */
export function operationsGetTxRollupSubmitBatchStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/tx_rollup_submit_batch/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get tx rollup submit batch count
 */
export function operationsGetTxRollupSubmitBatchOpsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/tx_rollup_submit_batch/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get migrations
 */
export function operationsGetMigrations(
  {
    account,
    kind,
    balanceChange,
    id,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    micheline,
    quote,
  }: {
    account?: AccountParameter | null;
    kind?: MigrationKindParameter | null;
    balanceChange?: Int64Parameter | null;
    id?: Int32Parameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: MigrationOperation[];
  }>(
    `/v1/operations/migrations${QS.query(
      QS.form({
        limit,
        micheline,
        quote,
        ...QueryParamsParsers.queryParameter("account", account),
        ...QueryParamsParsers.queryParameter("kind", kind),
        ...QueryParamsParsers.queryParameter("balanceChange", balanceChange),
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get migration by id
 */
export function operationsGetMigrationById(
  id: number,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: MigrationOperation;
  }>(
    `/v1/operations/migrations/${id}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get migrations count
 */
export function operationsGetMigrationsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/migrations/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get revelation penalties
 */
export function operationsGetRevelationPenalties(
  {
    baker,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    baker?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: RevelationPenaltyOperation[];
  }>(
    `/v1/operations/revelation_penalties${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("baker", baker),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get revelation penalty by id
 */
export function operationsGetRevelationPenaltyById(
  id: number,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: RevelationPenaltyOperation;
  }>(
    `/v1/operations/revelation_penalties/${id}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get revelation penalties count
 */
export function operationsGetRevelationPenaltiesCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/revelation_penalties/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get baking
 */
export function operationsGetBaking(
  {
    baker,
    anyof,
    proposer,
    producer,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    baker?: AccountParameter | null;
    anyof?: {
      value?: string | null;
      fields?: ("proposer" | "producer")[];
      in?: ("proposer" | "producer")[];
      null?: boolean;
      eq?: "proposer" | "producer";
    };
    proposer?: AccountParameter | null;
    producer?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BakingOperation[];
  }>(
    `/v1/operations/baking${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("baker", baker),
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("proposer", proposer),
        ...QueryParamsParsers.queryParameter("producer", producer),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get baking by id
 */
export function operationsGetBakingById(
  id: number,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BakingOperation;
  }>(
    `/v1/operations/baking/${id}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get baking count
 */
export function operationsGetBakingCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/baking/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get endorsing rewards
 */
export function operationsGetEndorsingRewards(
  {
    baker,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    baker?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: EndorsingRewardOperation[];
  }>(
    `/v1/operations/endorsing_rewards${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("baker", baker),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get endorsing reward by id
 */
export function operationsGetEndorsingRewardById(
  id: number,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: EndorsingRewardOperation;
  }>(
    `/v1/operations/endorsing_rewards/${id}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get endorsing rewards count
 */
export function operationsGetEndorsingRewardsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/endorsing_rewards/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get operations by hash
 */
export function operationsGetByHash(
  hash: string | null,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Operation[];
  }>(
    `/v1/operations/${hash}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get operations by hash and counter
 */
export function operationsGetByHashCounter(
  hash: string | null,
  counter: number,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Operation[];
  }>(
    `/v1/operations/${hash}/${counter}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get operations by hash, counter and nonce
 */
export function operationsGetByHashCounterNonce(
  hash: string | null,
  counter: number,
  nonce: number,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Operation[];
  }>(
    `/v1/operations/${hash}/${counter}/${nonce}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get operation status
 */
export function operationsGetStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get endorsements
 */
export function operationsGetEndorsements(
  {
    delegate,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    delegate?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: EndorsementOperation[];
  }>(
    `/v1/operations/endorsements${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("delegate", delegate),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get endorsement by hash
 */
export function operationsGetEndorsementByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: EndorsementOperation[];
  }>(
    `/v1/operations/endorsements/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get endorsements count
 */
export function operationsGetEndorsementsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/endorsements/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get preendorsements
 */
export function operationsGetPreendorsements(
  {
    delegate,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    delegate?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: PreendorsementOperation[];
  }>(
    `/v1/operations/preendorsements${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("delegate", delegate),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get preendorsement by hash
 */
export function operationsGetPreendorsementByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: PreendorsementOperation[];
  }>(
    `/v1/operations/preendorsements/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get preendorsements count
 */
export function operationsGetPreendorsementsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/preendorsements/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get ballots
 */
export function operationsGetBallots(
  {
    delegate,
    level,
    timestamp,
    epoch,
    period,
    proposal,
    vote,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    delegate?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    epoch?: Int32Parameter | null;
    period?: Int32Parameter | null;
    proposal?: ProtocolParameter | null;
    vote?: VoteParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BallotOperation[];
  }>(
    `/v1/operations/ballots${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("delegate", delegate),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("epoch", epoch),
        ...QueryParamsParsers.queryParameter("period", period),
        ...QueryParamsParsers.queryParameter("proposal", proposal),
        ...QueryParamsParsers.queryParameter("vote", vote),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get ballot by hash
 */
export function operationsGetBallotByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BallotOperation[];
  }>(
    `/v1/operations/ballots/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get ballots count
 */
export function operationsGetBallotsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/ballots/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get proposals
 */
export function operationsGetProposals(
  {
    delegate,
    level,
    timestamp,
    epoch,
    period,
    proposal,
    duplicated,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    delegate?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    epoch?: Int32Parameter | null;
    period?: Int32Parameter | null;
    proposal?: ProtocolParameter | null;
    duplicated?: BoolParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ProposalOperation[];
  }>(
    `/v1/operations/proposals${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("delegate", delegate),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("epoch", epoch),
        ...QueryParamsParsers.queryParameter("period", period),
        ...QueryParamsParsers.queryParameter("proposal", proposal),
        ...QueryParamsParsers.queryParameter("duplicated", duplicated),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get proposal by hash
 */
export function operationsGetProposalByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ProposalOperation[];
  }>(
    `/v1/operations/proposals/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get proposals count
 */
export function operationsGetProposalsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/proposals/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get activations
 */
export function operationsGetActivations(
  {
    account,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    account?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ActivationOperation[];
  }>(
    `/v1/operations/activations${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("account", account),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get activation by hash
 */
export function operationsGetActivationByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ActivationOperation[];
  }>(
    `/v1/operations/activations/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get activations count
 */
export function operationsGetActivationsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/activations/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get double baking
 */
export function operationsGetDoubleBaking(
  {
    anyof,
    accuser,
    offender,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    anyof?: {
      value?: string | null;
      fields?: ("accuser" | "offender")[];
      in?: ("accuser" | "offender")[];
      null?: boolean;
      eq?: "accuser" | "offender";
    };
    accuser?: AccountParameter | null;
    offender?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DoubleBakingOperation[];
  }>(
    `/v1/operations/double_baking${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("accuser", accuser),
        ...QueryParamsParsers.queryParameter("offender", offender),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get double baking by hash
 */
export function operationsGetDoubleBakingByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DoubleBakingOperation[];
  }>(
    `/v1/operations/double_baking/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get double baking count
 */
export function operationsGetDoubleBakingCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/double_baking/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get double endorsing
 */
export function operationsGetDoubleEndorsing(
  {
    anyof,
    accuser,
    offender,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    anyof?: {
      value?: string | null;
      fields?: ("accuser" | "offender")[];
      in?: ("accuser" | "offender")[];
      null?: boolean;
      eq?: "accuser" | "offender";
    };
    accuser?: AccountParameter | null;
    offender?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DoubleEndorsingOperation[];
  }>(
    `/v1/operations/double_endorsing${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("accuser", accuser),
        ...QueryParamsParsers.queryParameter("offender", offender),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get double endorsing by hash
 */
export function operationsGetDoubleEndorsingByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DoubleEndorsingOperation[];
  }>(
    `/v1/operations/double_endorsing/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get double endorsing count
 */
export function operationsGetDoubleEndorsingCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/double_endorsing/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get double preendorsing
 */
export function operationsGetDoublePreendorsing(
  {
    anyof,
    accuser,
    offender,
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    anyof?: {
      value?: string | null;
      fields?: ("accuser" | "offender")[];
      in?: ("accuser" | "offender")[];
      null?: boolean;
      eq?: "accuser" | "offender";
    };
    accuser?: AccountParameter | null;
    offender?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DoublePreendorsingOperation[];
  }>(
    `/v1/operations/double_preendorsing${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("accuser", accuser),
        ...QueryParamsParsers.queryParameter("offender", offender),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get double preendorsing by hash
 */
export function operationsGetDoublePreendorsingByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DoublePreendorsingOperation[];
  }>(
    `/v1/operations/double_preendorsing/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get double preendorsing count
 */
export function operationsGetDoublePreendorsingCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/double_preendorsing/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get nonce revelations
 */
export function operationsGetNonceRevelations(
  {
    anyof,
    baker,
    sender,
    level,
    revealedCycle,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    anyof?: {
      value?: string | null;
      fields?: ("baker" | "sender")[];
      in?: ("baker" | "sender")[];
      null?: boolean;
      eq?: "baker" | "sender";
    };
    baker?: AccountParameter | null;
    sender?: AccountParameter | null;
    level?: Int32Parameter | null;
    revealedCycle?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: NonceRevelationOperation[];
  }>(
    `/v1/operations/nonce_revelations${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("baker", baker),
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("revealedCycle", revealedCycle),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get nonce revelation by hash
 */
export function operationsGetNonceRevelationByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: NonceRevelationOperation[];
  }>(
    `/v1/operations/nonce_revelations/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get nonce revelations count
 */
export function operationsGetNonceRevelationsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/nonce_revelations/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get delegations
 */
export function operationsGetDelegations(
  {
    anyof,
    initiator,
    sender,
    prevDelegate,
    newDelegate,
    level,
    timestamp,
    senderCodeHash,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    anyof?: {
      value?: string | null;
      fields?: ("sender" | "prevDelegate" | "newDelegate")[];
      in?: ("sender" | "prevDelegate" | "newDelegate")[];
      null?: boolean;
      eq?: "sender" | "prevDelegate" | "newDelegate";
    };
    initiator?: AccountParameter | null;
    sender?: AccountParameter | null;
    prevDelegate?: AccountParameter | null;
    newDelegate?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    senderCodeHash?: Int32Parameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DelegationOperation[];
  }>(
    `/v1/operations/delegations${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("initiator", initiator),
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("prevDelegate", prevDelegate),
        ...QueryParamsParsers.queryParameter("newDelegate", newDelegate),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("senderCodeHash", senderCodeHash),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get delegation by hash
 */
export function operationsGetDelegationByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DelegationOperation[];
  }>(
    `/v1/operations/delegations/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get delegation status
 */
export function operationsGetDelegationStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/delegations/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get delegations count
 */
export function operationsGetDelegationsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/delegations/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get originations
 */
export function operationsGetOriginations(
  {
    anyof,
    initiator,
    sender,
    contractManager,
    contractDelegate,
    originatedContract,
    id,
    typeHash,
    codeHash,
    level,
    timestamp,
    senderCodeHash,
    anyCodeHash,
    status,
    select,
    sort,
    offset,
    limit,
    micheline,
    quote,
  }: {
    anyof?: {
      value?: string | null;
      fields?: (
        | "initiator"
        | "sender"
        | "contractManager"
        | "contractDelegate"
        | "originatedContract"
      )[];
      in?: (
        | "initiator"
        | "sender"
        | "contractManager"
        | "contractDelegate"
        | "originatedContract"
      )[];
      null?: boolean;
      eq?:
        | "initiator"
        | "sender"
        | "contractManager"
        | "contractDelegate"
        | "originatedContract";
    };
    initiator?: AccountParameter | null;
    sender?: AccountParameter | null;
    contractManager?: AccountParameter | null;
    contractDelegate?: AccountParameter | null;
    originatedContract?: AccountParameter | null;
    id?: Int32Parameter | null;
    typeHash?: Int32Parameter | null;
    codeHash?: Int32Parameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    senderCodeHash?: Int32Parameter | null;
    anyCodeHash?: Int32Parameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: OriginationOperation[];
  }>(
    `/v1/operations/originations${QS.query(
      QS.form({
        limit,
        micheline,
        quote,
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("initiator", initiator),
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter(
          "contractManager",
          contractManager
        ),
        ...QueryParamsParsers.queryParameter(
          "contractDelegate",
          contractDelegate
        ),
        ...QueryParamsParsers.queryParameter(
          "originatedContract",
          originatedContract
        ),
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("typeHash", typeHash),
        ...QueryParamsParsers.queryParameter("codeHash", codeHash),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("senderCodeHash", senderCodeHash),
        ...QueryParamsParsers.queryParameter("anyCodeHash", anyCodeHash),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get origination by hash
 */
export function operationsGetOriginationByHash(
  hash: string | null,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: OriginationOperation[];
  }>(
    `/v1/operations/originations/${hash}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get origination status
 */
export function operationsGetOriginationStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/originations/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get originations count
 */
export function operationsGetOriginationsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/originations/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get transactions
 */
export function operationsGetTransactions(
  {
    anyof,
    initiator,
    sender,
    target,
    amount,
    id,
    level,
    timestamp,
    senderCodeHash,
    targetCodeHash,
    codeHash,
    entrypoint,
    parameter,
    hasInternals,
    status,
    select,
    sort,
    offset,
    limit,
    micheline,
    quote,
  }: {
    anyof?: {
      value?: string | null;
      fields?: ("sender" | "target" | "initiator")[];
      in?: ("sender" | "target" | "initiator")[];
      null?: boolean;
      eq?: "sender" | "target" | "initiator";
    };
    initiator?: AccountParameter | null;
    sender?: AccountParameter | null;
    target?: AccountParameter | null;
    amount?: Int64Parameter | null;
    id?: Int32Parameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    senderCodeHash?: Int32Parameter | null;
    targetCodeHash?: Int32Parameter | null;
    codeHash?: Int32Parameter | null;
    entrypoint?: StringParameter | null;
    parameter?: JsonParameter | null;
    hasInternals?: BoolParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TransactionOperation[];
  }>(
    `/v1/operations/transactions${QS.query(
      QS.form({
        limit,
        micheline,
        quote,
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("initiator", initiator),
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("target", target),
        ...QueryParamsParsers.queryParameter("amount", amount),
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("senderCodeHash", senderCodeHash),
        ...QueryParamsParsers.queryParameter("targetCodeHash", targetCodeHash),
        ...QueryParamsParsers.queryParameter("codeHash", codeHash),
        ...QueryParamsParsers.queryParameter("entrypoint", entrypoint),
        ...QueryParamsParsers.jsonParameter("parameter", parameter),
        ...QueryParamsParsers.queryParameter("hasInternals", hasInternals),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get transaction by hash
 */
export function operationsGetTransactionByHash(
  hash: string | null,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TransactionOperation[];
  }>(
    `/v1/operations/transactions/${hash}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get transaction by hash and counter
 */
export function operationsGetTransactionByHashCounter(
  hash: string | null,
  counter: number,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TransactionOperation[];
  }>(
    `/v1/operations/transactions/${hash}/${counter}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get transaction by hash, counter and nonce
 */
export function operationsGetTransactionByHashCounterNonce(
  hash: string | null,
  counter: number,
  nonce: number,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TransactionOperation[];
  }>(
    `/v1/operations/transactions/${hash}/${counter}/${nonce}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get transaction status
 */
export function operationsGetTransactionStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/transactions/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get transactions count
 */
export function operationsGetTransactionsCount(
  {
    anyof,
    initiator,
    sender,
    target,
    level,
    timestamp,
    entrypoint,
    parameter,
    status,
  }: {
    anyof?: {
      value?: string | null;
      fields?: ("sender" | "target" | "initiator")[];
      in?: ("sender" | "target" | "initiator")[];
      null?: boolean;
      eq?: "sender" | "target" | "initiator";
    };
    initiator?: AccountParameter | null;
    sender?: AccountParameter | null;
    target?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    entrypoint?: StringParameter | null;
    parameter?: JsonParameter | null;
    status?: OperationStatusParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/transactions/count${QS.query(
      QS.form({
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("initiator", initiator),
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("target", target),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("entrypoint", entrypoint),
        ...QueryParamsParsers.jsonParameter("parameter", parameter),
        ...QueryParamsParsers.queryParameter("status", status),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get reveals
 */
export function operationsGetReveals(
  {
    sender,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    sender?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: RevealOperation[];
  }>(
    `/v1/operations/reveals${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get reveal by hash
 */
export function operationsGetRevealByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: RevealOperation[];
  }>(
    `/v1/operations/reveals/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get reveal status
 */
export function operationsGetRevealStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/reveals/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get reveals count
 */
export function operationsGetRevealsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/reveals/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get register constants
 */
export function operationsGetRegisterConstants(
  {
    sender,
    address,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    micheline,
    quote,
  }: {
    sender?: AccountParameter | null;
    address?: ExpressionParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: RegisterConstantOperation[];
  }>(
    `/v1/operations/register_constants${QS.query(
      QS.form({
        limit,
        micheline,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("address", address),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get register constant by hash
 */
export function operationsGetRegisterConstantByHash(
  hash: string | null,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: RegisterConstantOperation[];
  }>(
    `/v1/operations/register_constants/${hash}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get register constant status
 */
export function operationsGetRegisterConstantStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/register_constants/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get register constants count
 */
export function operationsGetRegisterConstantsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/register_constants/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get set deposits limits
 */
export function operationsGetSetDepositsLimits(
  {
    sender,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    sender?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: SetDepositsLimitOperation[];
  }>(
    `/v1/operations/set_deposits_limits${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get set deposits limit by hash
 */
export function operationsGetSetDepositsLimitByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: SetDepositsLimitOperation[];
  }>(
    `/v1/operations/set_deposits_limits/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get set deposits limit status
 */
export function operationsGetSetDepositsLimitStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/set_deposits_limits/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get set deposits limits count
 */
export function operationsGetSetDepositsLimitsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/set_deposits_limits/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get transfer ticket
 */
export function operationsGetTransferTicketOps(
  {
    anyof,
    sender,
    target,
    ticketer,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    micheline,
    quote,
  }: {
    anyof?: {
      value?: string | null;
      fields?: ("sender" | "target" | "ticketer")[];
      in?: ("sender" | "target" | "ticketer")[];
      null?: boolean;
      eq?: "sender" | "target" | "ticketer";
    };
    sender?: AccountParameter | null;
    target?: AccountParameter | null;
    ticketer?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TransferTicketOperation[];
  }>(
    `/v1/operations/transfer_ticket${QS.query(
      QS.form({
        limit,
        micheline,
        quote,
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("target", target),
        ...QueryParamsParsers.queryParameter("ticketer", ticketer),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get transfer ticket by hash
 */
export function operationsGetTransferTicketOpsByHash(
  hash: string | null,
  {
    micheline,
    quote,
  }: {
    micheline?: MichelineFormat;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TransferTicketOperation[];
  }>(
    `/v1/operations/transfer_ticket/${hash}${QS.query(
      QS.form({
        micheline,
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get transfer ticket status
 */
export function operationsGetTransferTicketStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/transfer_ticket/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get transfer ticket count
 */
export function operationsGetTransferTicketOpsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/transfer_ticket/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup commit
 */
export function operationsGetTxRollupCommitOps(
  {
    sender,
    rollup,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    sender?: AccountParameter | null;
    rollup?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupCommitOperation[];
  }>(
    `/v1/operations/tx_rollup_commit${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("rollup", rollup),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup commit by hash
 */
export function operationsGetTxRollupCommitOpsByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupCommitOperation[];
  }>(
    `/v1/operations/tx_rollup_commit/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup commit status
 */
export function operationsGetTxRollupCommitStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/tx_rollup_commit/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get tx rollup commit count
 */
export function operationsGetTxRollupCommitOpsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/tx_rollup_commit/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup dispatch tickets
 */
export function operationsGetTxRollupDispatchTicketsOps(
  {
    sender,
    rollup,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    sender?: AccountParameter | null;
    rollup?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupDispatchTicketsOperation[];
  }>(
    `/v1/operations/tx_rollup_dispatch_tickets${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("rollup", rollup),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup dispatch tickets by hash
 */
export function operationsGetTxRollupDispatchTicketsOpsByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupDispatchTicketsOperation[];
  }>(
    `/v1/operations/tx_rollup_dispatch_tickets/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup dispatch tickets status
 */
export function operationsGetTxRollupDispatchTicketsStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/tx_rollup_dispatch_tickets/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get tx rollup dispatch tickets count
 */
export function operationsGetTxRollupDispatchTicketsOpsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/tx_rollup_dispatch_tickets/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup finalize commitment
 */
export function operationsGetTxRollupFinalizeCommitmentOps(
  {
    sender,
    rollup,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    sender?: AccountParameter | null;
    rollup?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupFinalizeCommitmentOperation[];
  }>(
    `/v1/operations/tx_rollup_finalize_commitment${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("rollup", rollup),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup finalize commitment by hash
 */
export function operationsGetTxRollupFinalizeCommitmentOpsByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupFinalizeCommitmentOperation[];
  }>(
    `/v1/operations/tx_rollup_finalize_commitment/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup finalize commitment status
 */
export function operationsGetTxRollupFinalizeCommitmentStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/tx_rollup_finalize_commitment/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get tx rollup finalize commitment count
 */
export function operationsGetTxRollupFinalizeCommitmentOpsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/tx_rollup_finalize_commitment/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup origination
 */
export function operationsGetTxRollupOriginationOps(
  {
    sender,
    rollup,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    sender?: AccountParameter | null;
    rollup?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupOriginationOperation[];
  }>(
    `/v1/operations/tx_rollup_origination${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("rollup", rollup),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup origination by hash
 */
export function operationsGetTxRollupOriginationOpsByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupOriginationOperation[];
  }>(
    `/v1/operations/tx_rollup_origination/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup origination status
 */
export function operationsGetTxRollupOriginationStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/tx_rollup_origination/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get tx rollup origination count
 */
export function operationsGetTxRollupOriginationOpsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/tx_rollup_origination/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup rejection
 */
export function operationsGetTxRollupRejectionOps(
  {
    anyof,
    sender,
    committer,
    rollup,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    anyof?: {
      value?: string | null;
      fields?: ("sender" | "committer")[];
      in?: ("sender" | "committer")[];
      null?: boolean;
      eq?: "sender" | "committer";
    };
    sender?: AccountParameter | null;
    committer?: AccountParameter | null;
    rollup?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupRejectionOperation[];
  }>(
    `/v1/operations/tx_rollup_rejection${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("committer", committer),
        ...QueryParamsParsers.queryParameter("rollup", rollup),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup rejection by hash
 */
export function operationsGetTxRollupRejectionOpsByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupRejectionOperation[];
  }>(
    `/v1/operations/tx_rollup_rejection/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup rejection status
 */
export function operationsGetTxRollupRejectionStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/tx_rollup_rejection/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get tx rollup rejection count
 */
export function operationsGetTxRollupRejectionOpsCount(
  {
    level,
    timestamp,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/operations/tx_rollup_rejection/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup remove commitment
 */
export function operationsGetTxRollupRemoveCommitmentOps(
  {
    sender,
    rollup,
    level,
    timestamp,
    status,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    sender?: AccountParameter | null;
    rollup?: AccountParameter | null;
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    status?: OperationStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupRemoveCommitmentOperation[];
  }>(
    `/v1/operations/tx_rollup_remove_commitment${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("sender", sender),
        ...QueryParamsParsers.queryParameter("rollup", rollup),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup remove commitment by hash
 */
export function operationsGetTxRollupRemoveCommitmentOpsByHash(
  hash: string | null,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TxRollupRemoveCommitmentOperation[];
  }>(
    `/v1/operations/tx_rollup_remove_commitment/${hash}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tx rollup remove commitment status
 */
export function operationsGetTxRollupRemoveCommitmentStatus(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: boolean | null;
  }>(`/v1/operations/tx_rollup_remove_commitment/${hash}/status`, {
    ...opts,
  });
}
/**
 * Get protocols count
 */
export function protocolsGetCount(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>("/v1/protocols/count", {
    ...opts,
  });
}
/**
 * Get protocols
 */
export function protocolsGet(
  {
    sort,
    offset,
    limit,
  }: {
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Protocol[];
  }>(
    `/v1/protocols${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get current protocol
 */
export function protocolsGetCurrent(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Protocol;
  }>("/v1/protocols/current", {
    ...opts,
  });
}
/**
 * Get protocol by code
 */
export function protocolsGetByCode(code: number, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Protocol;
  }>(`/v1/protocols/${code}`, {
    ...opts,
  });
}
/**
 * Get protocol by hash
 */
export function protocolsGetByHash(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Protocol;
  }>(`/v1/protocols/${hash}`, {
    ...opts,
  });
}
/**
 * Get protocol by cycle
 */
export function protocolsGetByCycle(
  cycle: number,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Protocol;
  }>(`/v1/protocols/cycles/${cycle}`, {
    ...opts,
  });
}
/**
 * Get quotes count
 */
export function quotesGetCount(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>("/v1/quotes/count", {
    ...opts,
  });
}
/**
 * Get last quote
 */
export function quotesGetLast(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Quote;
  }>("/v1/quotes/last", {
    ...opts,
  });
}
/**
 * Get quotes
 */
export function quotesGet(
  {
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
  }: {
    level?: Int32Parameter | null;
    timestamp?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Quote[];
  }>(
    `/v1/quotes${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get baker cycle rewards count
 */
export function rewardsGetBakerRewardsCount(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(`/v1/rewards/bakers/${address}/count`, {
    ...opts,
  });
}
/**
 * Get baker cycle rewards
 */
export function rewardsGetBakerRewards(
  address: string | null,
  {
    cycle,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    cycle?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BakerRewards[];
  }>(
    `/v1/rewards/bakers/${address}${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("cycle", cycle),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get baker cycle rewards by cycle
 */
export function rewardsGetBakerRewardsByCycle(
  address: string | null,
  cycle: number,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BakerRewards;
  }>(
    `/v1/rewards/bakers/${address}/${cycle}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get delegator cycle rewards count
 */
export function rewardsGetDelegatorRewardsCount(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(`/v1/rewards/delegators/${address}/count`, {
    ...opts,
  });
}
/**
 * Get delegator cycle rewards
 */
export function rewardsGetDelegatorRewards(
  address: string | null,
  {
    cycle,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    cycle?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DelegatorRewards[];
  }>(
    `/v1/rewards/delegators/${address}${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("cycle", cycle),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get delegator cycle rewards by cycle
 */
export function rewardsGetDelegatorRewardsByCycle(
  address: string | null,
  cycle: number,
  {
    quote,
  }: {
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: DelegatorRewards;
  }>(
    `/v1/rewards/delegators/${address}/${cycle}${QS.query(
      QS.form({
        quote,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get reward split
 */
export function rewardsGetRewardSplit(
  baker: string | null,
  cycle: number,
  {
    offset,
    limit,
  }: {
    offset?: number;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: RewardSplit;
  }>(
    `/v1/rewards/split/${baker}/${cycle}${QS.query(
      QS.form({
        offset,
        limit,
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get reward split delegator
 */
export function rewardsGetRewardSplitDelegator(
  baker: string | null,
  cycle: number,
  delegator: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: SplitDelegator;
  }>(`/v1/rewards/split/${baker}/${cycle}/${delegator}`, {
    ...opts,
  });
}
/**
 * Get rights count
 */
export function rightsGetCount(
  {
    type,
    baker,
    cycle,
    level,
    slots,
    round,
    priority,
    status,
  }: {
    type?: BakingRightTypeParameter | null;
    baker?: AccountParameter | null;
    cycle?: Int32Parameter | null;
    level?: Int32Parameter | null;
    slots?: Int32NullParameter | null;
    round?: Int32NullParameter | null;
    priority?: Int32NullParameter | null;
    status?: BakingRightStatusParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/rights/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("type", type),
        ...QueryParamsParsers.queryParameter("baker", baker),
        ...QueryParamsParsers.queryParameter("cycle", cycle),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("slots", slots),
        ...QueryParamsParsers.queryParameter("round", round),
        ...QueryParamsParsers.queryParameter("priority", priority),
        ...QueryParamsParsers.queryParameter("status", status),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get rights
 */
export function rightsGet(
  {
    type,
    baker,
    cycle,
    level,
    slots,
    round,
    priority,
    status,
    select,
    sort,
    offset,
    limit,
  }: {
    type?: BakingRightTypeParameter | null;
    baker?: AccountParameter | null;
    cycle?: Int32Parameter | null;
    level?: Int32Parameter | null;
    slots?: Int32NullParameter | null;
    round?: Int32NullParameter | null;
    priority?: Int32NullParameter | null;
    status?: BakingRightStatusParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: BakingRight[];
  }>(
    `/v1/rights${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("type", type),
        ...QueryParamsParsers.queryParameter("baker", baker),
        ...QueryParamsParsers.queryParameter("cycle", cycle),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("slots", slots),
        ...QueryParamsParsers.queryParameter("round", round),
        ...QueryParamsParsers.queryParameter("priority", priority),
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get baker software
 */
export function softwareGet(
  {
    select,
    sort,
    offset,
    limit,
  }: {
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Software[];
  }>(
    `/v1/software${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get software count
 */
export function softwareGetCount(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>("/v1/software/count", {
    ...opts,
  });
}
/**
 * Get statistics
 */
export function statisticsGet(
  {
    level,
    timestamp,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    level?: Int32Parameter | null;
    timestamp?: TimestampParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Statistics[];
  }>(
    `/v1/statistics${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get daily statistics
 */
export function statisticsGetDaily(
  {
    date,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    date?: DateTimeParameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Statistics[];
  }>(
    `/v1/statistics/daily${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("date", date),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get cyclic statistics
 */
export function statisticsGetCyclesAll(
  {
    cycle,
    select,
    sort,
    offset,
    limit,
    quote,
  }: {
    cycle?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Statistics[];
  }>(
    `/v1/statistics/cyclic${QS.query(
      QS.form({
        limit,
        quote,
        ...QueryParamsParsers.queryParameter("cycle", cycle),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get current statistics
 */
export function statisticsGetCycles(
  {
    select,
    quote,
  }: {
    select?: SelectParameter | null;
    quote?: Symbols;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Statistics;
  }>(
    `/v1/statistics/current${QS.query(
      QS.form({
        quote,
        ...QueryParamsParsers.queryParameter("select", select),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tokens count
 */
export function tokensGetTokensCount(
  {
    id,
    contract,
    tokenId,
    standard,
    firstLevel,
    firstTime,
    lastLevel,
    lastTime,
    metadata,
  }: {
    id?: Int32Parameter | null;
    contract?: AccountParameter | null;
    tokenId?: NatParameter | null;
    standard?: TokenStandardParameter | null;
    firstLevel?: Int32Parameter | null;
    firstTime?: TimestampParameter | null;
    lastLevel?: Int32Parameter | null;
    lastTime?: TimestampParameter | null;
    metadata?: JsonParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/tokens/count${QS.query(
      QS.form({
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("contract", contract),
        ...QueryParamsParsers.queryParameter("tokenId", tokenId),
        ...QueryParamsParsers.queryParameter("standard", standard),
        ...QueryParamsParsers.queryParameter("firstLevel", firstLevel),
        ...QueryParamsParsers.queryParameter("firstTime", firstTime),
        ...QueryParamsParsers.queryParameter("lastLevel", lastLevel),
        ...QueryParamsParsers.queryParameter("lastTime", lastTime),
        ...QueryParamsParsers.jsonParameter("metadata", metadata),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get tokens
 */
export function tokensGetTokens(
  {
    id,
    contract,
    tokenId,
    standard,
    firstLevel,
    firstTime,
    lastLevel,
    lastTime,
    metadata,
    sort,
    offset,
    limit,
    select,
  }: {
    id?: Int32Parameter | null;
    contract?: AccountParameter | null;
    tokenId?: NatParameter | null;
    standard?: TokenStandardParameter | null;
    firstLevel?: Int32Parameter | null;
    firstTime?: TimestampParameter | null;
    lastLevel?: Int32Parameter | null;
    lastTime?: TimestampParameter | null;
    metadata?: JsonParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    select?: SelectionParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Token[];
  }>(
    `/v1/tokens${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("contract", contract),
        ...QueryParamsParsers.queryParameter("tokenId", tokenId),
        ...QueryParamsParsers.queryParameter("standard", standard),
        ...QueryParamsParsers.queryParameter("firstLevel", firstLevel),
        ...QueryParamsParsers.queryParameter("firstTime", firstTime),
        ...QueryParamsParsers.queryParameter("lastLevel", lastLevel),
        ...QueryParamsParsers.queryParameter("lastTime", lastTime),
        ...QueryParamsParsers.jsonParameter("metadata", metadata),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
        ...QueryParamsParsers.queryParameter("select", select),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get token balances count
 */
export function tokensGetTokenBalancesCount(
  {
    id,
    account,
    tokenId,
    tokenContract,
    tokenTokenId,
    tokenStandard,
    tokenMetadata,
    tokenHasFilters,
    balance,
    firstLevel,
    firstTime,
    lastLevel,
    lastTime,
  }: {
    id?: Int32Parameter | null;
    account?: AccountParameter | null;
    tokenId?: Int32Parameter | null;
    tokenContract?: AccountParameter | null;
    tokenTokenId?: NatParameter | null;
    tokenStandard?: TokenStandardParameter | null;
    tokenMetadata?: JsonParameter | null;
    tokenHasFilters?: boolean;
    balance?: NatParameter | null;
    firstLevel?: Int32Parameter | null;
    firstTime?: TimestampParameter | null;
    lastLevel?: Int32Parameter | null;
    lastTime?: TimestampParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/tokens/balances/count${QS.query(
      QS.form({
        "token.HasFilters": tokenHasFilters,
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("account", account),
        ...QueryParamsParsers.queryParameter("token.id", tokenId),
        ...QueryParamsParsers.queryParameter("token.contract", tokenContract),
        ...QueryParamsParsers.queryParameter("token.tokenId", tokenTokenId),
        ...QueryParamsParsers.queryParameter("token.standard", tokenStandard),
        ...QueryParamsParsers.jsonParameter("token.metadata", tokenMetadata),
        ...QueryParamsParsers.queryParameter("balance", balance),
        ...QueryParamsParsers.queryParameter("firstLevel", firstLevel),
        ...QueryParamsParsers.queryParameter("firstTime", firstTime),
        ...QueryParamsParsers.queryParameter("lastLevel", lastLevel),
        ...QueryParamsParsers.queryParameter("lastTime", lastTime),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get token balances
 */
export function tokensGetTokenBalances(
  {
    id,
    account,
    tokenId,
    tokenContract,
    tokenTokenId,
    tokenStandard,
    tokenMetadata,
    tokenHasFilters,
    balance,
    firstLevel,
    firstTime,
    lastLevel,
    lastTime,
    sort,
    offset,
    limit,
    select,
  }: {
    id?: Int32Parameter | null;
    account?: AccountParameter | null;
    tokenId?: Int32Parameter | null;
    tokenContract?: AccountParameter | null;
    tokenTokenId?: NatParameter | null;
    tokenStandard?: TokenStandardParameter | null;
    tokenMetadata?: JsonParameter | null;
    tokenHasFilters?: boolean;
    balance?: NatParameter | null;
    firstLevel?: Int32Parameter | null;
    firstTime?: TimestampParameter | null;
    lastLevel?: Int32Parameter | null;
    lastTime?: TimestampParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    select?: SelectionParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TokenBalance[];
  }>(
    `/v1/tokens/balances${QS.query(
      QS.form({
        "token.HasFilters": tokenHasFilters,
        limit,
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("account", account),
        ...QueryParamsParsers.queryParameter("token.id", tokenId),
        ...QueryParamsParsers.queryParameter("token.contract", tokenContract),
        ...QueryParamsParsers.queryParameter("token.tokenId", tokenTokenId),
        ...QueryParamsParsers.queryParameter("token.standard", tokenStandard),
        ...QueryParamsParsers.jsonParameter("token.metadata", tokenMetadata),
        ...QueryParamsParsers.queryParameter("balance", balance),
        ...QueryParamsParsers.queryParameter("firstLevel", firstLevel),
        ...QueryParamsParsers.queryParameter("firstTime", firstTime),
        ...QueryParamsParsers.queryParameter("lastLevel", lastLevel),
        ...QueryParamsParsers.queryParameter("lastTime", lastTime),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
        ...QueryParamsParsers.queryParameter("select", select),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get token transfers count
 */
export function tokensGetTokenTransfersCount(
  {
    id,
    level,
    timestamp,
    tokenId,
    tokenContract,
    tokenTokenId,
    tokenStandard,
    tokenMetadata,
    tokenHasFilters,
    anyof,
    from,
    to,
    amount,
    transactionId,
    originationId,
    migrationId,
  }: {
    id?: Int32Parameter | null;
    level?: Int32Parameter | null;
    timestamp?: TimestampParameter | null;
    tokenId?: Int32Parameter | null;
    tokenContract?: AccountParameter | null;
    tokenTokenId?: NatParameter | null;
    tokenStandard?: TokenStandardParameter | null;
    tokenMetadata?: JsonParameter | null;
    tokenHasFilters?: boolean;
    anyof?: {
      value?: string | null;
      fields?: ("from" | "to")[];
      in?: ("from" | "to")[];
      null?: boolean;
      eq?: "from" | "to";
    };
    from?: AccountParameter | null;
    to?: AccountParameter | null;
    amount?: NatParameter | null;
    transactionId?: Int32NullParameter | null;
    originationId?: Int32NullParameter | null;
    migrationId?: Int32NullParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>(
    `/v1/tokens/transfers/count${QS.query(
      QS.form({
        "token.HasFilters": tokenHasFilters,
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("token.id", tokenId),
        ...QueryParamsParsers.queryParameter("token.contract", tokenContract),
        ...QueryParamsParsers.queryParameter("token.tokenId", tokenTokenId),
        ...QueryParamsParsers.queryParameter("token.standard", tokenStandard),
        ...QueryParamsParsers.jsonParameter("token.metadata", tokenMetadata),
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("from", from),
        ...QueryParamsParsers.queryParameter("to", to),
        ...QueryParamsParsers.queryParameter("amount", amount),
        ...QueryParamsParsers.queryParameter("transactionId", transactionId),
        ...QueryParamsParsers.queryParameter("originationId", originationId),
        ...QueryParamsParsers.queryParameter("migrationId", migrationId),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get token transfers
 */
export function tokensGetTokenTransfers(
  {
    id,
    level,
    timestamp,
    tokenId,
    tokenContract,
    tokenTokenId,
    tokenStandard,
    tokenMetadata,
    tokenHasFilters,
    anyof,
    from,
    to,
    amount,
    transactionId,
    originationId,
    migrationId,
    sort,
    offset,
    limit,
    select,
  }: {
    id?: Int32Parameter | null;
    level?: Int32Parameter | null;
    timestamp?: TimestampParameter | null;
    tokenId?: Int32Parameter | null;
    tokenContract?: AccountParameter | null;
    tokenTokenId?: NatParameter | null;
    tokenStandard?: TokenStandardParameter | null;
    tokenMetadata?: JsonParameter | null;
    tokenHasFilters?: boolean;
    anyof?: {
      value?: string | null;
      fields?: ("from" | "to")[];
      in?: ("from" | "to")[];
      null?: boolean;
      eq?: "from" | "to";
    };
    from?: AccountParameter | null;
    to?: AccountParameter | null;
    amount?: NatParameter | null;
    transactionId?: Int32NullParameter | null;
    originationId?: Int32NullParameter | null;
    migrationId?: Int32NullParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    select?: SelectionParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TokenTransfer[];
  }>(
    `/v1/tokens/transfers${QS.query(
      QS.form({
        "token.HasFilters": tokenHasFilters,
        limit,
        ...QueryParamsParsers.queryParameter("id", id),
        ...QueryParamsParsers.queryParameter("level", level),
        ...QueryParamsParsers.queryParameter("timestamp", timestamp),
        ...QueryParamsParsers.queryParameter("token.id", tokenId),
        ...QueryParamsParsers.queryParameter("token.contract", tokenContract),
        ...QueryParamsParsers.queryParameter("token.tokenId", tokenTokenId),
        ...QueryParamsParsers.queryParameter("token.standard", tokenStandard),
        ...QueryParamsParsers.jsonParameter("token.metadata", tokenMetadata),
        ...QueryParamsParsers.anyofParameter("anyof", anyof),
        ...QueryParamsParsers.queryParameter("from", from),
        ...QueryParamsParsers.queryParameter("to", to),
        ...QueryParamsParsers.queryParameter("amount", amount),
        ...QueryParamsParsers.queryParameter("transactionId", transactionId),
        ...QueryParamsParsers.queryParameter("originationId", originationId),
        ...QueryParamsParsers.queryParameter("migrationId", migrationId),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
        ...QueryParamsParsers.queryParameter("select", select),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get historical token balances
 */
export function tokensGetTokenBalances2(
  level: number,
  {
    account,
    tokenId,
    tokenContract,
    tokenTokenId,
    tokenStandard,
    tokenMetadata,
    tokenHasFilters,
    balance,
    sort,
    offset,
    limit,
    select,
  }: {
    account?: AccountParameter | null;
    tokenId?: Int32Parameter | null;
    tokenContract?: AccountParameter | null;
    tokenTokenId?: NatParameter | null;
    tokenStandard?: TokenStandardParameter | null;
    tokenMetadata?: JsonParameter | null;
    tokenHasFilters?: boolean;
    balance?: NatParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
    select?: SelectionParameter | null;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: TokenBalanceShort[];
  }>(
    `/v1/tokens/historical_balances/${level}${QS.query(
      QS.form({
        "token.HasFilters": tokenHasFilters,
        limit,
        ...QueryParamsParsers.queryParameter("account", account),
        ...QueryParamsParsers.queryParameter("token.id", tokenId),
        ...QueryParamsParsers.queryParameter("token.contract", tokenContract),
        ...QueryParamsParsers.queryParameter("token.tokenId", tokenTokenId),
        ...QueryParamsParsers.queryParameter("token.standard", tokenStandard),
        ...QueryParamsParsers.jsonParameter("token.metadata", tokenMetadata),
        ...QueryParamsParsers.queryParameter("balance", balance),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
        ...QueryParamsParsers.queryParameter("select", select),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get proposals count
 */
export function votingGetProposalsCount(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: number;
  }>("/v1/voting/proposals/count", {
    ...opts,
  });
}
/**
 * Get proposals
 */
export function votingGetProposals(
  {
    hash,
    epoch,
    select,
    sort,
    offset,
    limit,
  }: {
    hash?: ProtocolParameter | null;
    epoch?: Int32Parameter | null;
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Proposal[];
  }>(
    `/v1/voting/proposals${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("hash", hash),
        ...QueryParamsParsers.queryParameter("epoch", epoch),
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get proposal by hash
 */
export function votingGetProposalByHash(
  hash: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Proposal;
  }>(`/v1/voting/proposals/${hash}`, {
    ...opts,
  });
}
/**
 * Get voting periods
 */
export function votingGetPeriods(
  {
    select,
    sort,
    offset,
    limit,
  }: {
    select?: SelectParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VotingPeriod[];
  }>(
    `/v1/voting/periods${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("select", select),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get voting period by index
 */
export function votingGetPeriod(index: number, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VotingPeriod;
  }>(`/v1/voting/periods/${index}`, {
    ...opts,
  });
}
/**
 * Get current voting period
 */
export function votingGetCurrentPeriod(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VotingPeriod;
  }>("/v1/voting/periods/current", {
    ...opts,
  });
}
/**
 * Get period voters
 */
export function votingGetPeriodVoters(
  index: number,
  {
    status,
    sort,
    offset,
    limit,
  }: {
    status?: VoterStatusParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VoterSnapshot[];
  }>(
    `/v1/voting/periods/${index}/voters${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get period voter
 */
export function votingGetPeriodVoter(
  index: number,
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VoterSnapshot;
  }>(`/v1/voting/periods/${index}/voters/${address}`, {
    ...opts,
  });
}
/**
 * Get current period voters
 */
export function votingGetPeriodVoters2(
  {
    status,
    sort,
    offset,
    limit,
  }: {
    status?: VoterStatusParameter | null;
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VoterSnapshot[];
  }>(
    `/v1/voting/periods/current/voters${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("status", status),
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get current period voter
 */
export function votingGetPeriodVoter2(
  address: string | null,
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VoterSnapshot;
  }>(`/v1/voting/periods/current/voters/${address}`, {
    ...opts,
  });
}
/**
 * Get voting epochs
 */
export function votingGetEpochs(
  {
    sort,
    offset,
    limit,
  }: {
    sort?: SortParameter | null;
    offset?: OffsetParameter | null;
    limit?: number;
  } = {},
  opts?: Oazapfts.RequestOpts
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VotingEpoch[];
  }>(
    `/v1/voting/epochs${QS.query(
      QS.form({
        limit,
        ...QueryParamsParsers.queryParameter("sort", sort),
        ...QueryParamsParsers.queryParameter("offset", offset),
      })
    )}`,
    {
      ...opts,
    }
  );
}
/**
 * Get voting epoch by index
 */
export function votingGetEpoch(index: number, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VotingEpoch;
  }>(`/v1/voting/epochs/${index}`, {
    ...opts,
  });
}
/**
 * Get current voting epoch
 */
export function votingGetCurrentEpoch(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VotingEpoch;
  }>("/v1/voting/epochs/current", {
    ...opts,
  });
}
/**
 * Get latest voting
 */
export function votingGetLatestVoting(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: VotingEpoch;
  }>("/v1/voting/epochs/latest_voting", {
    ...opts,
  });
}
