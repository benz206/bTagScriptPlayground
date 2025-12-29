function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomID() {
    return randomInt(100000000000000000, 9999999999999999999);
}

export function randomArgs() {
    const values = [
        "Hello world",
        "Boy do I love tagscript!",
        "Imagine",
        "Consider putting something here",
        "args!!!",
        "kiwis",
        "discord",
        "botlabs",
    ];
    return values[randomInt(0, values.length - 1)];
}

export function randomChannel() {
    const nameValues = [
        "tagscript-chat",
        "tagscript-is-so-cool",
        "general",
        "support",
        "carl-bot",
        "btagscript",
        "main-chat",
    ];
    const id = String(randomID());
    const nsfwValues = ["true", "false"];
    const topicValues = [
        "Shameless advertising",
        "This channel is for tagscript",
        "Tagscript is the coolest language to ever exist!",
        "Javascript is pretty fun to learn!",
        "Python is a pretty cool language",
    ];
    const slowmodeValues = [
        "0",
        "5",
        "30",
        "60",
        "120",
        "240",
        "480",
        "960",
        "1440",
    ];

    return {
        name: nameValues[randomInt(0, nameValues.length - 1)],
        id,
        nsfw: nsfwValues[randomInt(0, nsfwValues.length - 1)],
        mention: `<#${id}>`,
        topic: topicValues[randomInt(0, topicValues.length - 1)],
        slowmode: slowmodeValues[randomInt(0, slowmodeValues.length - 1)],
    };
}

function randomHexColorNoHash() {
    return randomInt(0, 16777215).toString(16).toUpperCase();
}

function randomRoleIDs() {
    const n = randomInt(1, 10);
    const ids = [];
    for (let i = 0; i < n; i++) ids.push(String(randomID()));
    return ids.join(" ");
}

export function randomUser() {
    const nameValues = [
        "tagscript",
        "tagscript-bot",
        "tagscript-bot-2",
        "carl-bot",
        "btagscript",
        "bot",
        "turtle101",
        "sentinelsfan",
    ];
    const name = nameValues[randomInt(0, nameValues.length - 1)];
    const username = `${
        nameValues[randomInt(0, nameValues.length - 1)]
    }#${randomInt(0, 9999)}`;
    const id = String(randomID());
    const createdAt = String(randomInt(0, Math.floor(Date.now() / 1000)));
    const joinedAt = String(randomInt(0, Math.floor(Date.now() / 1000)));

    return {
        name,
        username,
        id,
        createdAt,
        joinedAt,
        mention: `<@${id}>`,
        color: randomHexColorNoHash(),
        roleIDs: randomRoleIDs(),
    };
}

export function randomTarget() {
    const nameValues = [
        "Jerry",
        "Ben",
        "Asty",
        "Asport",
        "Arthur",
        "Elise",
        "Raffael",
        "Deafiore",
        "Panda",
        "Oriel",
    ];
    const name = nameValues[randomInt(0, nameValues.length - 1)];
    const username = `${
        nameValues[randomInt(0, nameValues.length - 1)]
    }#${randomInt(0, 9999)}`;
    const id = String(randomID());
    const createdAt = String(randomInt(0, Math.floor(Date.now() / 1000)));
    const joinedAt = String(randomInt(0, Math.floor(Date.now() / 1000)));

    return {
        name,
        username,
        id,
        createdAt,
        joinedAt,
        mention: `<@${id}>`,
        color: randomHexColorNoHash(),
        roleIDs: randomRoleIDs(),
    };
}

export function randomAllSeeds() {
    const channel = randomChannel();
    const user = randomUser();
    const target = randomTarget();
    return { args: randomArgs(), channel, user, target };
}
