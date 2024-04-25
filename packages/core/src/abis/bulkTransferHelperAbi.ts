export const bulkTransferHelperAbi = [
  {
    inputs: [
      { internalType: "address", name: "conduitController", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "bytes", name: "reason", type: "bytes" },
      { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
      { internalType: "address", name: "conduit", type: "address" },
    ],
    name: "ConduitErrorRevertBytes",
    type: "error",
  },
  {
    inputs: [
      { internalType: "string", name: "reason", type: "string" },
      { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
      { internalType: "address", name: "conduit", type: "address" },
    ],
    name: "ConduitErrorRevertString",
    type: "error",
  },
  {
    inputs: [
      { internalType: "bytes", name: "reason", type: "bytes" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "identifier", type: "uint256" },
    ],
    name: "ERC721ReceiverErrorRevertBytes",
    type: "error",
  },
  {
    inputs: [
      { internalType: "string", name: "reason", type: "string" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "identifier", type: "uint256" },
    ],
    name: "ERC721ReceiverErrorRevertString",
    type: "error",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
      { internalType: "address", name: "conduit", type: "address" },
    ],
    name: "InvalidConduit",
    type: "error",
  },
  { inputs: [], name: "InvalidERC20Identifier", type: "error" },
  {
    inputs: [{ internalType: "address", name: "recipient", type: "address" }],
    name: "InvalidERC721Recipient",
    type: "error",
  },
  { inputs: [], name: "InvalidERC721TransferAmount", type: "error" },
  { inputs: [], name: "InvalidItemType", type: "error" },
  { inputs: [], name: "RecipientCannotBeZeroAddress", type: "error" },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "enum ConduitItemType",
                name: "itemType",
                type: "uint8",
              },
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "identifier", type: "uint256" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct TransferHelperItem[]",
            name: "items",
            type: "tuple[]",
          },
          { internalType: "address", name: "recipient", type: "address" },
          {
            internalType: "bool",
            name: "validateERC721Receiver",
            type: "bool",
          },
        ],
        internalType: "struct TransferHelperItemsWithRecipient[]",
        name: "items",
        type: "tuple[]",
      },
      { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
    ],
    name: "bulkTransfer",
    outputs: [{ internalType: "bytes4", name: "magicValue", type: "bytes4" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
