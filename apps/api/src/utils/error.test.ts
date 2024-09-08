import { describe, expect, it } from "vitest";
import { normalizeEngineErrorMessage } from "./error";

describe("error utils", () => {
  it("should normalize Engine error messages", () => {
    expect(normalizeEngineErrorMessage("No normalization required")).toBe(
      "No normalization required",
    );
    expect(
      normalizeEngineErrorMessage(
        "UserOp failed with reason: 'Only basic foxes can be evolved' at txHash: 0xe4d9bfb4e5b6c8d5bd96dff274a6514d5b340df0245158a2690d682fd91d5a49",
      ),
    ).toBe("Only basic foxes can be evolved");
    expect(
      normalizeEngineErrorMessage(
        `cannot estimate gas; transaction may fail or may require manual gas limit [ See: https://links.ethers.org/v5-errors-UNPREDICTABLE_GAS_LIMIT ] (reason="execution reverted: Today's reward already claimed", method="estimateGas", transaction={"from":"0xaC4d30E5a47A0815604F1f32BCD517C4B902476A","to":"0x1CebDDE81A9E4cd377bc7DA5000797407CF9A58A","value":{"type":"BigNumber","hex":"0x00"},"data":"0x06f71afa000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000191bf7b13ff0000000000000000000000000000000000000000000000056bc75e2d631000000000000000000000000000000000000000000000000000000000000000000041d5351ced72173e1690543f2d3edb744a059198ef815054fcca94fb2191751b0c38a9b10080ae135198e28eaceb39b1abf2509a9f1c67915ba5a6adbf22c7d8d41b00000000000000000000000000000000000000000000000000000000000000","accessList":null}, error={"code":3,"data":"0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001e546f64617927732072657761726420616c726561647920636c61696d65640000"}, code=UNPREDICTABLE_GAS_LIMIT, version=providers/5.7.2)`,
      ),
    ).toBe("Today's reward already claimed");
    expect(
      normalizeEngineErrorMessage(
        `eth_sendUserOperation error: {"message":"Invalid UserOperation signature or paymaster signature","code":-32507} Status: 200 Code: UNKNOWN`,
      ),
    ).toBe("Invalid UserOperation signature or paymaster signature");
  });
});