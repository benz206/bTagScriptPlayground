import {
    CHAR_LIMIT,
    examples,
    initialSeeds,
    parseCarlId,
    randomPerson,
    runTag,
} from "../src/lib/tagscript";

describe("the in-browser engine", () => {
    test("runs the bundled examples with the default seeds", () => {
        const [welcome] = examples;
        expect(runTag(welcome!.code, initialSeeds, false).body).toBe(
            "Hello, alex!\n\nWelcome to general.\nYou said: Hello world",
        );
    });
    test("mirrors user into target unless a separate target is enabled", () => {
        expect(runTag("{target(nick)}", initialSeeds, false).body).toBe("Alex");
        expect(runTag("{target(nick)}", initialSeeds, true).body).toBe("Sam");
    });
    test("exposes Discord-shaped member and channel fields", () => {
        const result = runTag(
            "{user(id)} {user(mention)} {user(color)} {user(roleids)} {user(timestamp)} {user(created_at)}",
            initialSeeds,
            false,
        );
        expect(result.body).toBe(
            "123456789012345678 <@123456789012345678> #7c9265 987654321012345678 1609459200 2021-01-01 00:00:00+00:00",
        );
        expect(
            runTag(
                "{channel} {channel(topic)} {channel(nsfw)} {channel(slowmode)}",
                initialSeeds,
                false,
            ).body,
        ).toBe("general A place to try things out. false 0");
    });
    test("returns actions and every variable for the debug view", () => {
        const result = runTag(
            "{=(x):5}{c:ping}{embed(title):Hi}",
            initialSeeds,
            false,
        );
        expect(result.body).toBe("");
        expect(result.actions.commands).toEqual(["ping"]);
        expect(result.actions.embed).toEqual({ title: "Hi" });
        expect(result.extras.debug.x).toBe("5");
        expect(result.extras.debug.args).toBe("Hello world");
    });
    test("keeps debug variables when a tag stops early", () => {
        expect(
            runTag("{=(x):5}{stop:done} after", initialSeeds, false).extras
                .debug.x,
        ).toBe("5");
    });
    test("stops runaway tags with a readable error", () => {
        const script = "{=(r):lol}" + "{=(r):{r}{r}}".repeat(30) + "{r}";
        expect(() => runTag(script, initialSeeds, false)).toThrow(
            `more than ${CHAR_LIMIT.toLocaleString()} characters`,
        );
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
