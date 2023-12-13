export const tokenTxQuery = `
query ($network: EthereumNetwork!,$limit: Int!, $offset: Int!, $from: ISO8601DateTime, $till: ISO8601DateTime) {
  ethereum(network: $network) {
    transfers(
      options: {desc: "block.timestamp.time", asc: "currency.symbol", limit: $limit, offset: $offset}
      date: {since: $from, till: $till}
      amount: {gt: 0}
      any: [{receiver: {is: $address}}, {sender: {is: $address}}]
    ) {
      block {
        timestamp {
          time(format: "%Y-%m-%d %H:%M:%S")
        }
        height
      }
      currency {
        address
        symbol
      }
      amount
      amount_usd: amount(in: USD)
      transaction {
        hash
      }
      external
      address: sender {
        address
      }
      receiver {
        address
      }
    }
  }
}


  `;

export const txCountQuery = `
  query ($network: EthereumNetwork!, $from: ISO8601DateTime, $till: ISO8601DateTime){
    ethereum(network: $network) {
      transfers(
        any: [{receiver: {is: $address}}, {sender: {is: $address}}]
        date: {till: $till, since: $from}
      ) {
        count
      }
    }
  }
`;

export const txSumCountQuery = `
query ($network: EthereumNetwork!, $address: String!,$from: ISO8601DateTime, $till: ISO8601DateTime, $limit: Int!, $offset: Int!) {
  ethereum(network: $network) {
    transfers(
      date: {since: $from, till: $till}
      amount: {gt: 0}
      any: [{receiver: {is: $address}}, {sender: {is: $address}}]
      options: {limit: $limit, offset: $offset, desc: ["count_in", "count_out"], asc: "currency.symbol"}
    ) {
      sum_in: amount(calculate: sum, receiver: {is: $address})
      sum_out: amount(calculate: sum, sender: {is: $address})
      sum_in_usd: amount(in: USD, calculate: sum, receiver: {is: $address})
      sum_out_usd: amount(in: USD, calculate: sum, sender: {is: $address})
      count_in: count(receiver: {is: $address})
      count_out: count(sender: {is: $address})
      currency {
        address
        symbol
        tokenType
      }
    }
  }
}
`;

export const txSumCountQueryBy = `
query ($network: EthereumNetwork!,  $from: ISO8601DateTime, $till: ISO8601DateTime, $limit: Int!, $offset: Int!) {
  ethereum(network: $network) {
    transfers(
      date: {since: $from, till: $till}
      amount: {gt: 0}
      any: [{receiver: {is: $address}}, {sender: {is: $address}}]
      options: {limit: $limit, offset: $offset, desc: ["count"], asc: "currency.symbol"}
    ) {
      sum: amount(calculate: sum)
      sum_usd: amount(in: USD, calculate: sum)
      count: count
      currency {
        address
        symbol
        tokenType
      }
    }
  }
}


`;
