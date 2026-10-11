// Filled in once MilestonePot is deployed and the address is provided.
export const MILESTONE_POT_ADDRESS = import.meta.env.VITE_MILESTONE_POT_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

export const MILESTONE_POT_ABI = [
  { inputs: [], name: "InvalidRecipient", type: "error" },
  { inputs: [], name: "InvalidUnlockTimestamp", type: "error" },
  { inputs: [], name: "NotRecipient", type: "error" },
  { inputs: [], name: "NotYetUnlocked", type: "error" },
  { inputs: [], name: "PotAlreadyClaimed", type: "error" },
  { inputs: [], name: "PotDoesNotExist", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  { inputs: [], name: "ZeroContribution", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "potId", type: "uint256" },
      { indexed: true, internalType: "address", name: "contributor", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "totalContributed", type: "uint256" },
    ],
    name: "ContributionMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "potId", type: "uint256" },
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "PotClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "potId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint64", name: "unlockTimestamp", type: "uint64" },
      { indexed: false, internalType: "uint256", name: "targetAmount", type: "uint256" },
    ],
    name: "PotCreated",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "potId", type: "uint256" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "potId", type: "uint256" }],
    name: "contribute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint64", name: "unlockTimestamp", type: "uint64" },
      { internalType: "uint256", name: "targetAmount", type: "uint256" },
    ],
    name: "createPot",
    outputs: [{ internalType: "uint256", name: "potId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "potId", type: "uint256" }],
    name: "getPot",
    outputs: [
      {
        components: [
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint64", name: "unlockTimestamp", type: "uint64" },
          { internalType: "uint256", name: "targetAmount", type: "uint256" },
          { internalType: "uint256", name: "totalContributed", type: "uint256" },
          { internalType: "bool", name: "claimed", type: "bool" },
        ],
        internalType: "struct MilestonePot.Pot",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "potCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "potId", type: "uint256" }],
    name: "potExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
