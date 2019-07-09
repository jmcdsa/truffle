import { AstDefinition, AstReferences, ContractKind, Mutability, Contexts, Types } from "truffle-codec-utils";
import * as Allocations from "./allocation";
import { Slot } from "./storage";

export interface EvmState {
  storage: WordMapping;
  stack?: Uint8Array[];
  memory?: Uint8Array;
  calldata?: Uint8Array;
  specials?: {
    [builtin: string]: Uint8Array //sorry
  };
  eventdata?: Uint8Array;
  eventtopics?: Uint8Array[];
}

export interface WordMapping {
  [slotAddress: string]: Uint8Array
}

export interface EvmInfo {
  state: EvmState;
  mappingKeys?: Slot[];
  userDefinedTypes?: Types.TypesById;
  allocations: AllocationInfo;
  contexts?: Contexts.DecoderContextsById;
  currentContext?: Contexts.DecoderContext;
  internalFunctionsTable?: InternalFunctions;
}

export interface AllocationInfo {
  storage?: Allocations.StorageAllocations;
  memory?: Allocations.MemoryAllocations;
  abi?: Allocations.AbiAllocations;
  calldata?: Allocations.CalldataAllocations;
  event?: Allocations.EventAllocations;
}

export interface InternalFunctions {
  [pc: number]: InternalFunction
}

export interface InternalFunction {
  source?: number;
  pointer?: string;
  node?: AstDefinition;
  name?: string;
  id?: number;
  mutability?: Mutability;
  contractPointer?: string;
  contractNode?: AstDefinition;
  contractName?: string;
  contractId?: number;
  contractKind?: ContractKind;
  contractPayable?: boolean;
  isDesignatedInvalid: boolean;
}

export interface DecoderOptions {
  permissivePadding?: boolean; //allows incorrect padding on certain data types
  strictAbiMode?: boolean; //throw errors instead of returning; check array & string lengths (crudely)
  abiPointerBase?: number;
  memoryVisited?: number[]; //for the future
}
