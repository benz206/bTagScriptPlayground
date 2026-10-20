import {
    ChannelAdapter,
    Interpreter,
    MemberAdapter,
    StringAdapter,
    Verb,
    WorkloadExceededError,
    defaultBlocks,
} from "btagscript";

export const CHAR_LIMIT = 20000;
export const CARL_URL =
    "https://mighty-sea-55702.herokuapp.com/https://carl.gg/api/v1/tags/";

export interface PersonSeed {
    name: string;
    username: string;
    id: string;
    createdAt: string;
    joinedAt: string;
    mention: string;
    color: string;
    roleIDs: string;
}
export interface Seeds {
    args: string;
    user: PersonSeed;
    target: PersonSeed;
    channel: {
        name: string;
        id: string;
        nsfw: string;
        mention: string;
        topic: string;
        slowmode: string;
    };
}
export interface TagResult {
    body: string;
    actions: Record<string, unknown>;
    extras: { debug: Record<string, unknown> };
}

const person: PersonSeed = {
    name: "Alex",
    username: "alex",
    id: "123456789012345678",
    createdAt: "1609459200",
    joinedAt: "1640995200",
    mention: "<@123456789012345678>",
    color: "7C9265",
    roleIDs: "987654321012345678",
};
export const initialSeeds: Seeds = {
    args: "Hello world",
    user: person,
    target: { ...person, name: "Sam", username: "sam" },
    channel: {
        name: "general",
        id: "234567890123456789",
        nsfw: "false",
        mention: "<#234567890123456789>",
        topic: "A place to try things out.",
        slowmode: "0",
    },
};
export const examples = [
    {
        name: "A warm welcome",
        description: "Make your first tag feel personal.",
        category: "The basics",
        code: "{=(greeting):Hello, {user(name)}!}\n{greeting}\n\nWelcome to {channel(name)}.\nYou said: {args}",
    },
    {
        name: "A little logic",
        description: "Give your tag a different response.",
        category: "Conditions",
        code: "{if({args}==Hello):Hey, {user(name)}!|Try sending Hello as your argument.}",
    },
    {
        name: "Roll the dice",
        description: "Leave the result up to chance.",
        category: "Randomness",
        code: "{user(name)} rolled a {range:1-6}!",
    },
    {
        name: "Do the math",
        description: "Turn an expression into an answer.",
        category: "Math",
        code: "{=(price):24}\n{=(quantity):3}\nYour total is {math:{price}*{quantity}}.",
    },
];

function discordTime(seconds: string) {
    const date = new Date((Number(seconds) || 0) * 1000);
    date.toString = () =>
        date
            .toISOString()
            .replace("T", " ")
            .replace(/\.\d+Z$/, "+00:00");
    return date;
}
function member(seed: PersonSeed) {
    return new MemberAdapter({
        id: seed.id,
        name: seed.username,
        display_name: seed.name,
        created_at: discordTime(seed.createdAt),
        joined_at: discordTime(seed.joinedAt),
        mention: seed.mention,
        color: `#${seed.color.toLowerCase()}`,
        discriminator: "0",
        display_avatar: { url: "" },
        bot: false,
        _roles: seed.roleIDs.split(/\s+/).filter(Boolean),
        toString: () => seed.username,
    });
}
export function createSeeds(seeds: Seeds, useTarget: boolean) {
    const { channel } = seeds;
    return {
        args: new StringAdapter(seeds.args),
        user: member(seeds.user),
        target: member(useTarget ? seeds.target : seeds.user),
        channel: new ChannelAdapter({
            id: channel.id,
            name: channel.name,
            nsfw: channel.nsfw === "true",
            mention: channel.mention,
            topic: channel.topic || null,
            slowmode_delay: Number(channel.slowmode) || 0,
            toString: () => channel.name,
        }),
    };
}
const engine = new Interpreter(defaultBlocks());
const debugVerb = new Verb("{debug}");
export function runTag(
    script: string,
    seeds: Seeds,
    useTarget: boolean,
): TagResult {
    try {
        const response = engine.process(script, createSeeds(seeds, useTarget), {
            charlimit: CHAR_LIMIT,
        });
        return {
            body: response.body ?? "",
            actions: response.actions,
            extras: {
                debug: Object.fromEntries(
                    Object.entries(response.variables).map(
                        ([name, adapter]) => [
                            name,
                            adapter.getValue(debugVerb),
                        ],
                    ),
                ),
            },
        };
    } catch (error) {
        if (error instanceof WorkloadExceededError)
            throw new Error(
                `This tag produced more than ${CHAR_LIMIT.toLocaleString()} characters, so it was stopped.`,
            );
        throw error;
    }
}
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function parseCarlId(value: string) {
    const trimmed = value.trim();
    if (/^[1-9]\d*$/.test(trimmed)) return trimmed;
    try {
        const url = new URL(trimmed);
        if (
            url.protocol !== "https:" ||
            !["carl.gg", "www.carl.gg"].includes(url.hostname)
        )
            return null;
        return (
            url.pathname.match(/^\/(?:t|tag|tags)\/([1-9]\d*)\/?$/)?.[1] ?? null
        );
    } catch {
        return null;
    }
}
export async function importCarlTag(value: string) {
    const id = parseCarlId(value);
    if (!id)
        throw new Error(
            "Enter a numeric tag ID or a https://carl.gg/t/… link.",
        );
    const response = await fetch(`${CARL_URL}${id}`, {
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
        throw new Error(
            "Carl import is unavailable. You can still paste your tag into the editor or import a file.",
        );
    const data: unknown = await response.json();
    if (!isRecord(data) || typeof data.content !== "string")
        throw new Error("That tag did not contain a script.");
    return data.content;
}
export function randomPerson(): PersonSeed {
    const name = ["Alex", "Sam", "River", "Charlie", "Morgan"][
        Math.floor(Math.random() * 5)
    ];
    const id = randomId();
    const createdAt =
        Math.floor(Date.now() / 1000) -
        86400 * (365 + Math.floor(Math.random() * 365));
    return {
        name,
        username: name.toLowerCase(),
        id,
        mention: `<@${id}>`,
        createdAt: String(createdAt),
        joinedAt: String(createdAt + 86400 * 100),
        color: Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0")
            .toUpperCase(),
        roleIDs: randomId(),
    };
}
export function randomId() {
    return (
        "1" +
        Array.from({ length: 17 }, () => Math.floor(Math.random() * 10)).join(
            "",
        )
    );
}
export function randomChannel(): Seeds["channel"] {
    const id = randomId();
    return {
        name: ["general", "bot-testing", "tagscript-chat"][
            Math.floor(Math.random() * 3)
        ],
        id,
        mention: `<#${id}>`,
        nsfw: "false",
        topic: "Testing something new.",
        slowmode: "0",
    };
}
export function displayValue(value: unknown) {
    return typeof value === "string"
        ? value
        : (JSON.stringify(value, null, 2) ?? "");
}
