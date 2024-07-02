export const TOKEN_FRAGMENT = `
  fragment TokenFragment on Token {
    id
    name
    symbol
    decimals
    derivedMAGIC
    isNFT
    vaultCollections {
      collection {
        id
        type
      }
      tokenIds
    }
  }
`;

const TRANSACTION_ITEM_FRAGMENT = `
  fragment TransactionItemFragment on TransactionItem {
    id
    collection {
      id
    }
    tokenId
    amount
  }
`;

export const PAIR_FRAGMENT = `
  fragment PairFragment on Pair {
    id
    token0 {
      ...TokenFragment
    }
    token1 {
      ...TokenFragment
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    txCount
    volumeUSD
    lpFee
    protocolFee
    royaltiesFee
    royaltiesBeneficiary
    totalFee
    dayData(first: 7, orderBy: date, orderDirection: desc) {
      reserveUSD
      volumeUSD
      txCount
    }
  }
`;

export const getPairTransactions = `
  ${TRANSACTION_ITEM_FRAGMENT}
  query GetPairTransactions($id: String!) {
    transactions(
      where: { pair: $id }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      hash
      timestamp
      type
      user {
        id
      }
      amount0
      amount1
      amountUSD
      isAmount1Out
      items0 {
        ...TransactionItemFragment
      }
      items1 {
        ...TransactionItemFragment
      }
    }
  }
`;

export const getPairs = `
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetPairs {
    pairs(orderBy: volumeUSD, orderDirection: desc) {
      ...PairFragment
    }
  }
`;

export const getPair = `
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetPair($id: ID!) {
    pair(id: $id) {
      ...PairFragment
    }
  }
`;

export const getStats = `
  query GetStats {
    factories {
      reserveNFT
      txCount
      magicUSD
    }
    dayDatas(orderBy: date, orderDirection: desc, first: 1) {
      volumeUSD
    }
  }
`;
