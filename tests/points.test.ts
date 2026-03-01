 import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

const contract = "guestbook";

// Helper: sign a message
function signMessage(signer: string, message: string) {
  return simnet.callPublicFn(contract, "sign", [Cl.stringAscii(message)], signer);
}

// Helper: read a message
function readMessage(user: string) {
  return simnet.callReadOnlyFn(contract, "read-message", [Cl.principal(user)], deployer);
}

describe("guestbook contract", () => {
  it("allows a user to sign a message", () => {
    const { result } = signMessage(user1, "Hello World!");
    expect(result).toBeOk("Signed");
  });

  it("stores and retrieves a message correctly", () => {
    signMessage(user1, "My first message");

    const { result } = readMessage(user1);
    expect(result).toBeSome(Cl.tuple({ message: Cl.stringAscii("My first message") }));
  });

  it("updates a message if signed again", () => {
    signMessage(user1, "Initial message");
    signMessage(user1, "Updated message");

    const { result } = readMessage(user1);
    expect(result).toBeSome(Cl.tuple({ message: Cl.stringAscii("Updated message") }));
  });

  it("returns none for users who haven't signed", () => {
    const { result } = readMessage(user2);
    expect(result).toBeNone();
  });

  it("handles maximum 50-character messages", () => {
    const longMessage = "A".repeat(50);
    const { result } = signMessage(user1, longMessage);
    expect(result).toBeOk("Signed");

    const { result: readResult } = readMessage(user1);
    expect(readResult).toBeSome(Cl.tuple({ message: Cl.stringAscii(longMessage) }));
  });

  it("fails for messages longer than 50 characters", () => {
    const tooLong = "B".repeat(51);
    // Should throw an error during Cl.stringAscii conversion
    expect(() => signMessage(user1, tooLong)).toThrow();
  });
});
