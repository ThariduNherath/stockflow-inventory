import { range, dayKey } from "@/lib/range";
describe("range", () => {
  it("parses valid from/to", () => {
    const { from, to } = range(new URLSearchParams("from=2026-01-01&to=2026-01-31"));
    expect(dayKey(from)).toBe("2026-01-01");
    expect(dayKey(to)).toBe("2026-01-31");
    expect(to.getHours()).toBe(23);
  });
  it("defaults to the last 30 days on invalid input", () => {
    const { from, to } = range(new URLSearchParams("from=bad&to=nope"));
    const days = Math.round((to.getTime() - from.getTime()) / 864e5);
    expect(days).toBeGreaterThanOrEqual(29);
    expect(days).toBeLessThanOrEqual(30);
  });
  it("dayKey pads month and day", () => {
    expect(dayKey(new Date(2026, 2, 5))).toBe("2026-03-05");
  });
});