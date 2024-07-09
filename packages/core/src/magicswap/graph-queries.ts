const TOKEN_FRAGMENT = `
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

const PAIR_FRAGMENT = `
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
    volume0
    volume1
    volumeUSD
    lpFee
    protocolFee
    royaltiesFee
    royaltiesBeneficiary
    totalFee
    dayData(first: 7, orderBy: date, orderDirection: desc) {
      date
      reserve0
      reserve1
      reserveUSD
      volume0
      volume1
      volumeUSD
      txCount
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
