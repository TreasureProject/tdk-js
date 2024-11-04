type Segment = {
  partner: {
    ids: string[];
  };
  user: {
    maxTransactions: number;
    maxGas: number;
  };
};

type SegmentData = {
  partner: {
    id: string;
  };
  user: {
    transactionsCount: number;
    gas: number;
  };
};

export const validateSegmentationRules = (
  segment: Segment,
  data: SegmentData,
) => {
  const {
    partner: { id },
    user: { transactionsCount, gas },
  } = data;

  const isValidPartner = segment.partner.ids.includes(id);
  const hasNotExceededTransactions =
    transactionsCount <= segment.user.maxTransactions;
  const hasNotExceededGas = gas <= segment.user.maxGas;

  const rules = [
    {
      condition: isValidPartner,
      reason: "partner is valid",
    },
    {
      condition: hasNotExceededTransactions,
      reason: "not exceeded the maximum number of transactions",
    },
    {
      condition: hasNotExceededGas,
      reason: "not exceeded the maximum gas",
    },
  ];

  const approvedRule = rules.find((rule) => rule.condition);

  if (approvedRule) {
    return {
      isAllowed: true,
      reason: approvedRule.reason,
    };
  }

  return {
    isAllowed: false,
    reason: "does not meet any rule",
  };
};
