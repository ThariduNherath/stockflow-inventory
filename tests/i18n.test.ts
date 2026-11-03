jest.mock("react", () => ({ useEffect: () => {}, useState: (v: any) => [v, () => {}] }));
import { useLang } from "@/lib/i18n";
describe("i18n", () => {
  it("returns English labels by default", () => {
    const { t } = useLang();
    expect(t("products")).toBe("Products");
  });
  it("falls back to the key when unknown", () => {
    expect(useLang().t("nope")).toBe("nope");
  });
});