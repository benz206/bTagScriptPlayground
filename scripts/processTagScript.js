// Out of respect, please don't go spamming my API :(

const API_URL = "https://leg3ndary.pythonanywhere.com/v2/process/";

class ApiResponse {
    constructor(data) {
        this.body = data.body;
        this.actions = data.actions;
        this.extras = data.extras;
        this.uses = data.uses;
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function decodeTagScript(tagscript) {
    return tagscript
        .replace(/Ꜳ/g, "\\")
        .replace(/ꜳ/g, "<")
        .replace(/₩/g, "/")
        .replace(/ꜵ/g, ">")
        .replace(/Ꜷ/g, ".");
}

function encodeTagScript(tagscript) {
    return tagscript
        .replace(/\\/g, "Ꜳ")
        .replace(/\//g, "₩")
        .replace(/</g, "ꜳ")
        .replace(/>/g, "ꜵ")
        .replace(/\./g, "Ꜷ");
}

function genSeedString() {
    // these are left here in case I need to quickly edit them.
    const ARGS = document.getElementById("tagscriptArgs").value;

    const CHANNEL_NAME = document.getElementById("channelName").value;
    const CHANNEL_ID = document.getElementById("channelID").value;
    const CHANNEL_NSFW = document.getElementById("channelNSFW").value;
    const CHANNEL_MENTION = document.getElementById("channelMention").value;
    const CHANNEL_TOPIC = document.getElementById("channelTopic").value;
    const CHANNEL_SLOWMODE = document.getElementById("channelSlowmode").value;

    const USER_NAME = document.getElementById("userName").value;
    const USER_USERNAME = document.getElementById("userUsername").value;
    const USER_ID = document.getElementById("userID").value;
    const USER_CREATEDAT = document.getElementById("userCreatedAt").value;
    const USER_JOINEDAT = document.getElementById("userJoinedAt").value;
    const USER_MENTION = document.getElementById("userMention").value;
    const USER_COLOR = document.getElementById("userColor").value;
    const USER_ROLEIDS = document.getElementById("userRoleIDs").value;

    const USE_TARGET = document.getElementById("useTarget").checked;

    const TARGET_NAME = document.getElementById("targetName").value;
    const TARGET_USERNAME = document.getElementById("targetUsername").value;
    const TARGET_ID = document.getElementById("targetID").value;
    const TARGET_CREATEDAT = document.getElementById("targetCreatedAt").value;
    const TARGET_JOINEDAT = document.getElementById("targetJoinedAt").value;
    const TARGET_MENTION = document.getElementById("targetMention").value;
    const TARGET_COLOR = document.getElementById("targetColor").value;
    const TARGET_ROLEIDS = document.getElementById("targetRoleIDs").value;

    let target;
    let user;

    user = {
        name: USER_NAME,
        username: USER_USERNAME,
        id: USER_ID,
        createdAt: USER_CREATEDAT,
        joinedAt: USER_JOINEDAT,
        mention: USER_MENTION,
        color: USER_COLOR,
        roleIDs: USER_ROLEIDS,
    };

    if (USE_TARGET === true) {
        target = {
            name: TARGET_NAME,
            username: TARGET_USERNAME,
            id: TARGET_ID,
            createdAt: TARGET_CREATEDAT,
            joinedAt: TARGET_JOINEDAT,
            mention: TARGET_MENTION,
            color: TARGET_COLOR,
            roleIDs: TARGET_ROLEIDS,
        };
    } else {
        target = user;
    }

    let seed = {
        user: user,
        target: target,
        args: ARGS,
        channel: {
            name: CHANNEL_NAME,
            id: CHANNEL_ID,
            nsfw: CHANNEL_NSFW,
            mention: CHANNEL_MENTION,
            topic: CHANNEL_TOPIC,
            slowmode: CHANNEL_SLOWMODE,
        },
    };
    return seed;
}

function loadActionTable(actions) {
    const table = document.getElementById("actionBody");
    const errorsText = document.getElementById("errors");
    const warningsText = document.getElementById("warnings");

    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }
    errorsText.innerText = "Errors: None";
    warningsText.innerText = "Warnings: None";

    const errors = [];
    const warnings = [];

    for (const [action, value] of Object.entries(actions)) {
        const row = table.insertRow();
        const actionRow = row.insertCell(0);
        const valuesRow = row.insertCell(1);
        const badge = row.insertCell(2);

        let actionContent = "Error";
        let valueContent = "Error";
        let badgeContent = '<div class="badge badge-danger">Error</div>';

        if (action === "blacklist") {
            if (actions.requires) {
                errors.push(
                    "You cannot have both a blacklist and a require block."
                );
                actionContent = action;
                valueContent = `Blacklisting the following IDS: ${value.items.join(
                    ", "
                )}, 
					replying with "${value.response}" when the user/role/channel is blacklisted.`;
                badgeContent = '<div class="badge badge-danger">Error</div>';
            } else {
                valueContent = `Blacklisting the following IDS: ${value.items.join(
                    ", "
                )}, 
					replying with "${value.response}" when the user/role/channel is blacklisted.`;
                badgeContent =
                    '<div class="badge badge-success">Succewass</div>';
            }
        } else if (action === "commands") {
            actionContent = "command";
            valueContent = `The following commands are used with their associated values: ${value.join(
                ", "
            )}`;
            badgeContent = '<div class="badge badge-success">Success</div>';
        } else if (action === "delete") {
            actionContent = "delete";
            valueContent = "Deleting the message";
            badgeContent = '<div class="badge badge-success">Success</div>';
        } else if (action === "embed") {
            actionContent = "embed";
            valueContent = `Embedding the following embed json: ${JSON.stringify(
                value
            )}`;
            badgeContent = '<div class="badge badge-success">Success</div>';
        } else if (action === "overrides") {
            actionContent = "override";
            valueContent = "Overriding command permissions.";
            badgeContent = '<div class="badge badge-success">Success</div>';
        } else if (action === "reactions") {
            actionContent = "reaction";
            valueContent = `Adding the following reactions: ${value.join(
                ", "
            )}`;
            badgeContent = '<div class="badge badge-success">Success</div>';
        } else if (action === "requires") {
            if (actions.requires) {
                actionContent = "require";
                valueContent = `Requiring the following IDS: ${value.items.join(
                    ", "
                )}, 
					replying with "${value.response}" when the requirements aren't met.`;
                badgeContent = '<div class="badge badge-danger">Error</div>';
            } else {
                actionContent = "require";
                valueContent = `Requiring the following IDS: ${value.items.join(
                    ", "
                )}, 
					replying with "${value.response}" when the requirements aren't met.`;
                badgeContent = '<div class="badge badge-success">Success</div>';
            }
        } else if (action === "target") {
            actionContent = "redirect";
            valueContent = `Redirecting the message to the following channel: ${value.channel}`;
            badgeContent = '<div class="badge badge-success">Success</div>';
        } else {
            console.log("Unknown action: " + action);
        }

        actionRow.innerHTML = escapeHtml(actionContent);
        valuesRow.innerHTML = escapeHtml(valueContent);
        badge.innerHTML = badgeContent;
    }

    if (errors.length > 0) {
        errorsText.innerText = "Errors: " + errors.join(", ");
    }
    if (warnings.length > 0) {
        warningsText.innerText = "Warnings: " + warnings.join(", ");
    }
}

function loadDebugTable(debug) {
    const table = document.getElementById("debugTable");

    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }

    for (const [name, value] of Object.entries(debug)) {
        if (["channel", "user", "target", "args"].includes(name) !== true) {
            const row = table.insertRow();

            const nameRow = row.insertCell(0);
            nameRow.innerHTML = escapeHtml(name);

            const valuesRow = row.insertCell(1);
            valuesRow.innerHTML = escapeHtml(value);
        }
    }
}

const BUTTON = document.getElementById("processButton");
let isProcessing = false;

async function processTagScript() {
    if (isProcessing) return;

    BUTTON.setAttribute("disabled", true);
    isProcessing = true;

    // Generating the seed str
    const TAGSCRIPT = editor.getValue();
    const SEED = genSeedString();
    let cleanedSeed = encodeTagScript(JSON.stringify(SEED));

    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    let body = new URLSearchParams();
    body.set("tagscript", TAGSCRIPT);
    body.append("seeds", cleanedSeed);

    if (TAGSCRIPT.trim() === "") {
        let response = new ApiResponse({
            output: "",
            actions: {},
            extras: {
                debug: {},
            },
        });
        document.getElementById("output").value = " ";

        loadActionTable(response.actions);
        loadDebugTable(response.extras.debug);
    } else {
        let response = fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: body,
            origin: "https://benz206.github.io:443",
        }).then((res) => res.json());

        response.then(function (resp) {
            console.log(resp);
            response = new ApiResponse(resp);
            document.getElementById("output").value = decodeTagScript(
                response.body
            );

            loadActionTable(response.actions);
            loadDebugTable(response.extras.debug);

            const counter = document.getElementById("counter");
            counter.innerHTML = `Playground - Processed ${response.uses[1].toLocaleString()} different Tags`;
        });
    }

    BUTTON.removeAttribute("disabled");
    isProcessing = false;
}

BUTTON.addEventListener("click", processTagScript);

editor.addKeyMap({
    "Cmd-Enter": processTagScript,
    "Ctrl-Enter": processTagScript,
});
