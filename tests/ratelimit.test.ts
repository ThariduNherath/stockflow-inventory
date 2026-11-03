import { blockedFor, fail, reset, ipOf } from "@/lib/ratelimit";
describe("ratelimit", () => {
  it("blocks after 5 failures and resets", () => {
    const k = "t1|a@b.c";
    for (let i = 0; i < 4; i++) fail(k);
    expect(blockedFor(k)).toBe(0);
    fail(k);
    expect(blockedFor(k)).toBeGreaterThan(0);
    reset(k);
    expect(blockedFor(k)).toBe(0);
  });
  it("keys are independent", () => {
    for (let i = 0; i < 5; i++) fail("t2|x");
    expect(blockedFor("t2|x")).toBeGreaterThan(0);
    expect(blockedFor("t2|y")).toBe(0);
  });
  it("ipOf reads x-forwarded-for, falls back to local", () => {
    expect(ipOf(new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } }))).toBe("1.2.3.4");
    expect(ipOf(new Request("http://x"))).toBe("local");
  });
});