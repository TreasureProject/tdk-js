type ZeeverseErrorReply = {
  status: number;
  message: string;
};

type ZeeverseLogInParams = {
  apiUrl: string;
  email: string;
  password: string;
};

type ZeeverseLoginReply = {
  item: {
    id: string;
    access_token: string;
    refresh_token: string;
  };
};

type ZeeverseVerifyParams = {
  apiUrl: string;
  token: string;
};

type ZeeverseVerifyReply = {
  user: {
    id: string;
    email: string;
    email_verified_at: string;
  };
};

export const logInWithZeeverse = async ({
  apiUrl,
  email,
  password,
}: ZeeverseLogInParams) => {
  const response = await fetch(`${apiUrl}/account/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const result: ZeeverseLoginReply | ZeeverseErrorReply = await response.json();
  if ("status" in result) {
    throw new Error(result.message);
  }

  return result;
};

export const verifyZeeverseToken = async ({
  apiUrl,
  token,
}: ZeeverseVerifyParams) => {
  const response = await fetch(`${apiUrl}/account/check`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result: ZeeverseVerifyReply | ZeeverseErrorReply =
    await response.json();
  if ("status" in result) {
    throw new Error(result.message);
  }

  return result;
};
