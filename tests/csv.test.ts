import { csv } from "@/lib/csv";
describe("csv", () => {
  it("starts with BOM and joins rows with CRLF", () => {
    const out = csv([["a", "b"], [1, 2]]);
    expect(out.charCodeAt(0)).toBe(0xfeff);
    expect(out.slice(1)).toBe("a,b\r\n1,2");
  });
  it("escapes commas, quotes and newlines", () => {
    expect(csv([["x,y", 'say "hi"', "a\nb"]]).slice(1)).toBe('"x,y","say ""hi""","a\nb"');
  });
  it("prefixes formula-like text (injection guard)", () => {
    expect(csv([["=1+1", "+cmd", "@x", "-5"]]).slice(1)).toBe("'=1+1,'+cmd,'@x,'-5");
  });
  it("does not prefix numbers; null becomes empty", () => {
    expect(csv([[-5, null, undefined]]).slice(1)).toBe("-5,,");
  });
});