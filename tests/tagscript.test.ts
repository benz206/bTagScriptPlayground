import { describe, expect, test } from "bun:test";
import {
    createRequest,
    decodeTagScript,
    encodeTagScript,
    initialSeeds,
    parseCarlId,
    parseResult,
    randomPerson,
} from "../src/lib/tagscript";

describe("the existing TagScript API contract", () => {
    test("encodes reserved characters and round-trips seed data", () => {
        const value = "<@123> / path\\tag.txt";
        expect(encodeTagScript(value)).toBe("ꜳ@123ꜵ ₩ pathꜲtagꜶtxt");
        expect(decodeTagScript(encodeTagScript(value))).toBe(value);
    });
    test("sends form data and mirrors user into target by default", () => {
        const body = createRequest("Hello {user}", initialSeeds, false);
        expect(body.get("tagscript")).toBe("Hello {user}");
        const seeds = JSON.parse(decodeTagScript(body.get("seeds")!));
        expect(seeds.target).toEqual(initialSeeds.user);
        expect(seeds.channel).toEqual(initialSeeds.channel);
    });
    test("uses a separate target when enabled", () => {
        const body = createRequest("{target}", initialSeeds, true);
        expect(JSON.parse(decodeTagScript(body.get("seeds")!)).target).toEqual(
            initialSeeds.target,
        );
    });
    test("decodes output and retains structured action/debug values", () => {
        const result = parseResult({
            body: "Hello ꜳ@123ꜵꜶ",
            actions: { embed: { title: "Hello" } },
            extras: { debug: { count: 3 } },
        });
        expect(result.body).toBe("Hello <@123>.");
        expect(result.actions.embed).toEqual({ title: "Hello" });
        expect(result.extras.debug.count).toBe(3);
    });
    test("rejects malformed engine responses instead of showing fake output", () => {
        expect(() => parseResult({ error: "Unavailable" })).toThrow();
        expect(() => parseResult(null)).toThrow();
        expect(parseResult({ body: "", actions: {} }).extras.debug).toEqual({});
    });
});

describe("Carl import", () => {
    test("accepts IDs and public Carl tag URLs without losing integer precision", () => {
        expect(parseCarlId("1234567890123456789")).toBe("1234567890123456789");
        expect(parseCarlId(" https://carl.gg/t/1479390/ ")).toBe("1479390");
    });
    test("rejects invalid links without silently loading an unrelated tag", () => {
        for (const value of [
            "",
            "0",
            "-1",
            "1.5",
            "https://example.com/t/12",
            "https://carl.gg/nope",
            "javascript:alert(1)",
        ])
            expect(parseCarlId(value)).toBeNull();
    });
});

test("random seeds preserve string snowflakes, mentions, and timestamp order", () => {
    const seed = randomPerson();
    expect(seed.id).toMatch(/^\d{18}$/);
    expect(seed.mention).toBe(`<@${seed.id}>`);
    expect(seed.color).toMatch(/^[\dA-F]{6}$/);
    expect(Number(seed.joinedAt)).toBeGreaterThan(Number(seed.createdAt));
});
