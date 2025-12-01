import { generateCode } from "../utils/code";

describe("generateCode", () => {
  it("generates unique codes of expected length", () => {
    const c1 = generateCode();
    const c2 = generateCode();
    expect(typeof c1).toBe("string");
    expect(c1.length).toBeGreaterThanOrEqual(6);
    expect(c1).not.toBe(c2);
  });
});
