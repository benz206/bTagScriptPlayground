import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "./components/Layout.jsx";
import { CodeMirrorEditor } from "./components/CodeMirrorEditor.jsx";
import {
    randomAllSeeds,
    randomArgs,
    randomChannel,
    randomTarget,
    randomUser,
} from "./lib/randomize.js";
import { decodeTagScript, processTagScriptRemote } from "./lib/tagscriptApi.js";

function readBool(key, fallback) {
    const v = window.localStorage.getItem(key);
    if (v === null) return fallback;
    if (v === "true") return true;
    if (v === "false") return false;
    if (v === true) return true;
    if (v === false) return false;
    return fallback;
}

function isInt(str) {
    if (typeof str !== "string") return false;
    const num = Number(str);
    return Number.isInteger(num) && num > 0;
}

function parseCarlId(str) {
    if (isInt(str)) return str;
    const tagID = str.split("/").pop();
    if (isInt(tagID)) return tagID;
    return "1479390";
}

function actionRowFor(action, value, allActions) {
    if (action === "blacklist") {
        const isError = Boolean(allActions?.requires);
        return {
            action: "blacklist",
            value: `Blacklisting the following IDS: ${value.items.join(
                ", "
            )}, replying with "${
                value.response
            }" when the user/role/channel is blacklisted.`,
            status: isError ? "error" : "success",
        };
    }
    if (action === "commands") {
        return {
            action: "command",
            value: `The following commands are used with their associated values: ${value.join(
                ", "
            )}`,
            status: "success",
        };
    }
    if (action === "delete") {
        return {
            action: "delete",
            value: "Deleting the message",
            status: "success",
        };
    }
    if (action === "embed") {
        return {
            action: "embed",
            value: `Embedding the following embed json: ${JSON.stringify(
                value
            )}`,
            status: "success",
        };
    }
    if (action === "overrides") {
        return {
            action: "override",
            value: "Overriding command permissions.",
            status: "success",
        };
    }
    if (action === "reactions") {
        return {
            action: "reaction",
            value: `Adding the following reactions: ${value.join(", ")}`,
            status: "success",
        };
    }
    if (action === "requires") {
        const isError = Boolean(allActions?.blacklist);
        return {
            action: "require",
            value: `Requiring the following IDS: ${value.items.join(
                ", "
            )}, replying with "${
                value.response
            }" when the requirements aren't met.`,
            status: isError ? "error" : "success",
        };
    }
    if (action === "target") {
        return {
            action: "redirect",
            value: `Redirecting the message to the following channel: ${value.channel}`,
            status: "success",
        };
    }
    return null;
}

export function App() {
    const initialSeeds = useMemo(() => randomAllSeeds(), []);

    const [storageMode, setStorageMode] = useState(() =>
        readBool("useLocal", false) ? "local" : "session"
    );
    const [tagscript, setTagscript] = useState("");

    const [args, setArgs] = useState(initialSeeds.args);
    const [channel, setChannel] = useState(initialSeeds.channel);
    const [user, setUser] = useState(initialSeeds.user);
    const [target, setTarget] = useState(initialSeeds.target);
    const [useTarget, setUseTarget] = useState(true);

    const [output, setOutput] = useState("");
    const [actions, setActions] = useState({});
    const [debug, setDebug] = useState({});
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [usesCount, setUsesCount] = useState(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [carlUrl, setCarlUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        const mode = readBool("useLocal", false) ? "local" : "session";
        setStorageMode(mode);
        const stored =
            mode === "local"
                ? window.localStorage.getItem("tagscript")
                : window.sessionStorage.getItem("tagscript");
        setTagscript(stored ?? "");
    }, []);

    useEffect(() => {
        if (storageMode === "local") {
            window.localStorage.setItem("useLocal", "true");
            window.localStorage.setItem("useSession", "false");
            window.localStorage.setItem("tagscript", tagscript);
            window.sessionStorage.removeItem("tagscript");
        } else {
            window.localStorage.setItem("useLocal", "false");
            window.localStorage.setItem("useSession", "true");
            window.sessionStorage.setItem("tagscript", tagscript);
            window.localStorage.removeItem("tagscript");
        }
    }, [storageMode, tagscript]);

    const seed = useMemo(() => {
        return {
            user,
            target: useTarget ? target : user,
            args,
            channel,
        };
    }, [args, channel, target, useTarget, user]);

    const { actionRows, nextErrors, nextWarnings } = useMemo(() => {
        const rows = [];
        const e = [];
        const w = [];

        for (const [a, v] of Object.entries(actions ?? {})) {
            const row = actionRowFor(a, v, actions);
            if (!row) continue;
            if (a === "blacklist" && actions?.requires) {
                e.push("You cannot have both a blacklist and a require block.");
            }
            if (a === "requires" && actions?.blacklist) {
                e.push("You cannot have both a blacklist and a require block.");
            }
            rows.push(row);
        }

        return { actionRows: rows, nextErrors: e, nextWarnings: w };
    }, [actions]);

    useEffect(() => {
        setErrors(nextErrors);
        setWarnings(nextWarnings);
    }, [nextErrors, nextWarnings]);

    const onProcess = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            if (tagscript.trim() === "") {
                setOutput("");
                setActions({});
                setDebug({});
                setUsesCount(null);
                return;
            }
            const resp = await processTagScriptRemote({ tagscript, seed });
            setOutput(decodeTagScript(resp.body ?? ""));
            setActions(resp.actions ?? {});
            setDebug(resp.extras?.debug ?? {});
            const count = Array.isArray(resp.uses) ? resp.uses[1] : null;
            setUsesCount(typeof count === "number" ? count : null);
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, seed, tagscript]);

    const clearActions = useCallback(() => {
        setActions({});
        setErrors([]);
        setWarnings([]);
    }, []);

    const clearDebug = useCallback(() => {
        setDebug({});
        setErrors([]);
        setWarnings([]);
    }, []);

    const clearLocal = useCallback(() => {
        window.localStorage.removeItem("tagscript");
        window.localStorage.removeItem("useLocal");
        window.localStorage.removeItem("useSession");
        setTagscript("");
    }, []);

    const clearSession = useCallback(() => {
        window.sessionStorage.removeItem("tagscript");
        window.sessionStorage.removeItem("useLocal");
        window.sessionStorage.removeItem("useSession");
        setTagscript("");
    }, []);

    const clearAll = useCallback(() => {
        window.localStorage.removeItem("tagscript");
        window.localStorage.removeItem("useLocal");
        window.localStorage.removeItem("useSession");
        window.sessionStorage.removeItem("tagscript");
        window.sessionStorage.removeItem("useLocal");
        window.sessionStorage.removeItem("useSession");
        setTagscript("");
    }, []);

    const importFromCarl = useCallback(async () => {
        if (isImporting) return;
        setIsImporting(true);
        try {
            const tagID = parseCarlId(carlUrl);
            const url =
                "https://mighty-sea-55702.herokuapp.com/https://carl.gg/api/v1/tags/" +
                tagID;
            const headers = new Headers();
            headers.append("origin", "btagscriptplayground");
            const resp = await fetch(url, { method: "GET", headers });
            const data = await resp.json();
            setTagscript(String(data.content ?? ""));
            setCarlUrl("");
        } catch {
            try {
                const url =
                    "https://mighty-sea-55702.herokuapp.com/https://carl.gg/api/v1/tags/1479390";
                const headers = new Headers();
                headers.append("origin", "btagscriptplayground");
                const resp = await fetch(url, { method: "GET", headers });
                const data = await resp.json();
                setTagscript(String(data.content ?? ""));
            } finally {
                setCarlUrl("");
            }
        } finally {
            setIsImporting(false);
        }
    }, [carlUrl, isImporting]);

    const title = usesCount
        ? `Playground - Processed ${usesCount.toLocaleString()} different Tags`
        : "Playground";

    return (
        <Layout active="playground">
            <div className="page-header">
                <h3 className="page-title" id="counter">
                    {title}
                </h3>
            </div>

            <div className="row">
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Editor</h4>
                            <p className="card-description">
                                Put your tagscript here! Please be patient, this
                                may take a while to process the first time
                                around.
                            </p>
                            <div className="form-group">
                                <CodeMirrorEditor
                                    value={tagscript}
                                    onChange={setTagscript}
                                    onProcess={onProcess}
                                />
                            </div>
                            <div className="form-group">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tag URL or ID"
                                        aria-label="Import Carl Tag"
                                        aria-describedby="basic-addon2"
                                        value={carlUrl}
                                        onChange={(e) =>
                                            setCarlUrl(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                importFromCarl();
                                        }}
                                    />
                                    <div className="input-group-append">
                                        <button
                                            className="btn btn-sm btn-primary icon-btn d-flex justify-content-center align-items-center"
                                            type="button"
                                            disabled={isImporting}
                                            onClick={importFromCarl}
                                        >
                                            <span
                                                className="disabled-icon spinner-border spinner-border-sm"
                                                role="status"
                                                aria-hidden="true"
                                                hidden={!isImporting}
                                            ></span>
                                            <i className="icon mdi mdi-play-circle btn-icon-prepend"></i>
                                            <span
                                                className="text"
                                                hidden={isImporting}
                                            >
                                                Import
                                            </span>
                                            <span
                                                className="disabled-text"
                                                hidden={!isImporting}
                                            >
                                                Loading...
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-block btn-md btn-success mr-2 icon-btn d-flex justify-content-center align-items-center"
                                disabled={isProcessing}
                                onClick={onProcess}
                            >
                                <span
                                    className="disabled-icon spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                    hidden={!isProcessing}
                                ></span>
                                <i className="icon mdi mdi-play-circle btn-icon-prepend"></i>
                                <span className="text" hidden={isProcessing}>
                                    Process
                                </span>
                                <span
                                    className="disabled-text"
                                    hidden={!isProcessing}
                                >
                                    Loading...
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Output</h4>
                            <p className="card-description">
                                Your tagscript output will show here! Please
                                note that this runs on a different engine from
                                carl-bot, that means new blocks are added and
                                you can see them{" "}
                                <a
                                    href="https://btagscript.readthedocs.io/en/latest/APIReference/block.html"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    here
                                </a>
                                , an example of a common variable name is count.
                            </p>
                            <form className="forms-sample">
                                <div className="form-group">
                                    <textarea
                                        className="form-control"
                                        rows={10}
                                        placeholder="Your output will show up here automatically"
                                        readOnly
                                        value={output}
                                    ></textarea>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Actions</h4>
                            <p className="card-description">
                                Any and all actions that your tagscript may do
                                will show up here!
                            </p>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Action</th>
                                            <th>Values</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actionRows.map((r, idx) => (
                                            <tr key={`${r.action}-${idx}`}>
                                                <td>{r.action}</td>
                                                <td>{r.value}</td>
                                                <td>
                                                    <div
                                                        className={`badge ${
                                                            r.status === "error"
                                                                ? "badge-danger"
                                                                : "badge-success"
                                                        }`}
                                                    >
                                                        {r.status === "error"
                                                            ? "Error"
                                                            : "Success"}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <br />
                            <p className="text-danger" id="errors">
                                {errors.length
                                    ? `Errors: ${errors.join(", ")}`
                                    : "Errors: None"}
                            </p>
                            <p className="text-warning" id="warnings">
                                {warnings.length
                                    ? `Warnings: ${warnings.join(", ")}`
                                    : "Warnings: None"}
                            </p>
                            <button
                                type="button"
                                className="btn btn-block btn-md btn-danger mr-2 icon-btn d-flex justify-content-center align-items-center"
                                onClick={clearActions}
                            >
                                <i className="icon mdi mdi-close btn-icon-prepend"></i>
                                <span className="text">Clear</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Debug</h4>
                            <p className="card-description">
                                All variables used in your tag will appear here,
                                along with their final value.
                            </p>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Variable</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(debug ?? {})
                                            .filter(
                                                ([name]) =>
                                                    ![
                                                        "channel",
                                                        "user",
                                                        "target",
                                                        "args",
                                                    ].includes(name)
                                            )
                                            .map(([name, value]) => (
                                                <tr key={name}>
                                                    <td>{name}</td>
                                                    <td>{String(value)}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                type="button"
                                className="btn btn-block btn-md btn-danger mr-2 icon-btn d-flex justify-content-center align-items-center"
                                onClick={clearDebug}
                            >
                                <i className="icon mdi mdi-close btn-icon-prepend"></i>
                                <span className="text">Clear</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-4 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Seeds</h4>
                            <p className="card-description">
                                Seeds are predefined variables that are passed
                                to the engine, set them here.
                            </p>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-danger text-white">
                                    {`{args}`}
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={args}
                                    onChange={(e) => setArgs(e.target.value)}
                                    placeholder="Put your arguments here!"
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-block btn-md btn-danger mr-2 icon-btn d-flex justify-content-center align-items-center"
                                onClick={() => setArgs(randomArgs())}
                            >
                                <i className="icon mdi mdi-comment-question-outline btn-icon-prepend"></i>
                                <span className="text">Randomize</span>
                            </button>
                            <br />
                            <h4>Channel</h4>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-warning text-white">
                                    Name
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={channel.name}
                                    onChange={(e) =>
                                        setChannel((c) => ({
                                            ...c,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Channel name"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-warning text-white">
                                    ID
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={channel.id}
                                    onChange={(e) =>
                                        setChannel((c) => ({
                                            ...c,
                                            id: e.target.value,
                                        }))
                                    }
                                    placeholder="Channel ID"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-warning text-white">
                                    NSFW
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={channel.nsfw}
                                    onChange={(e) =>
                                        setChannel((c) => ({
                                            ...c,
                                            nsfw: e.target.value,
                                        }))
                                    }
                                    placeholder="Channel NSFW"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-warning text-white">
                                    Mention
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={channel.mention}
                                    onChange={(e) =>
                                        setChannel((c) => ({
                                            ...c,
                                            mention: e.target.value,
                                        }))
                                    }
                                    placeholder="Channel Mention"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-warning text-white">
                                    Topic
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={channel.topic}
                                    onChange={(e) =>
                                        setChannel((c) => ({
                                            ...c,
                                            topic: e.target.value,
                                        }))
                                    }
                                    placeholder="Channel Topic"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-warning text-white">
                                    Slowmode
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={channel.slowmode}
                                    onChange={(e) =>
                                        setChannel((c) => ({
                                            ...c,
                                            slowmode: e.target.value,
                                        }))
                                    }
                                    placeholder="Channel Mention"
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-block btn-md btn-warning mr-2 icon-btn d-flex justify-content-center align-items-center"
                                onClick={() => setChannel(randomChannel())}
                            >
                                <i className="icon mdi mdi-comment-question-outline btn-icon-prepend"></i>
                                <span className="text">Randomize</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">User</h4>
                            <p className="card-description">
                                The user who "invoked the tag", remember that
                                this runs on a different engine and so{" "}
                                {"{user}"} is technically not a valid block,
                                consider using {"{user(name)}"}.
                            </p>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-primary text-white">
                                    Name
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.name}
                                    onChange={(e) =>
                                        setUser((u) => ({
                                            ...u,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Nickname"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-primary text-white">
                                    Username
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.username}
                                    onChange={(e) =>
                                        setUser((u) => ({
                                            ...u,
                                            username: e.target.value,
                                        }))
                                    }
                                    placeholder="Username#Discriminator"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-primary text-white">
                                    ID
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.id}
                                    onChange={(e) =>
                                        setUser((u) => ({
                                            ...u,
                                            id: e.target.value,
                                        }))
                                    }
                                    placeholder="ID"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-primary text-white">
                                    Created At
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.createdAt}
                                    onChange={(e) =>
                                        setUser((u) => ({
                                            ...u,
                                            createdAt: e.target.value,
                                        }))
                                    }
                                    placeholder="Created At"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-primary text-white">
                                    Joined At
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.joinedAt}
                                    onChange={(e) =>
                                        setUser((u) => ({
                                            ...u,
                                            joinedAt: e.target.value,
                                        }))
                                    }
                                    placeholder="Created At"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-primary text-white">
                                    Mention
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.mention}
                                    onChange={(e) =>
                                        setUser((u) => ({
                                            ...u,
                                            mention: e.target.value,
                                        }))
                                    }
                                    placeholder="Mention String"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-primary text-white">
                                    Color
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.color}
                                    onChange={(e) =>
                                        setUser((u) => ({
                                            ...u,
                                            color: e.target.value,
                                        }))
                                    }
                                    placeholder="Color"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-primary text-white">
                                    Role IDs
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.roleIDs}
                                    onChange={(e) =>
                                        setUser((u) => ({
                                            ...u,
                                            roleIDs: e.target.value,
                                        }))
                                    }
                                    placeholder="A list of roleids"
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-block btn-md btn-primary mr-2 icon-btn d-flex justify-content-center align-items-center"
                                onClick={() => setUser(randomUser())}
                            >
                                <i className="icon mdi mdi-comment-question-outline btn-icon-prepend"></i>
                                <span className="text">Randomize</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Target</h4>
                            <div className="form-check form-check-info">
                                <label className="form-check-label">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={useTarget}
                                        onChange={(e) =>
                                            setUseTarget(e.target.checked)
                                        }
                                    />
                                    Use Target (When a user's mentioned)
                                </label>
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-info text-white">
                                    Name
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={target.name}
                                    onChange={(e) =>
                                        setTarget((t) => ({
                                            ...t,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Nickname"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-info text-white">
                                    Username
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={target.username}
                                    onChange={(e) =>
                                        setTarget((t) => ({
                                            ...t,
                                            username: e.target.value,
                                        }))
                                    }
                                    placeholder="Username#Discriminator"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-info text-white">
                                    ID
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={target.id}
                                    onChange={(e) =>
                                        setTarget((t) => ({
                                            ...t,
                                            id: e.target.value,
                                        }))
                                    }
                                    placeholder="ID"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-info text-white">
                                    Created At
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={target.createdAt}
                                    onChange={(e) =>
                                        setTarget((t) => ({
                                            ...t,
                                            createdAt: e.target.value,
                                        }))
                                    }
                                    placeholder="Created At"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-info text-white">
                                    Joined At
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={target.joinedAt}
                                    onChange={(e) =>
                                        setTarget((t) => ({
                                            ...t,
                                            joinedAt: e.target.value,
                                        }))
                                    }
                                    placeholder="Created At"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-info text-white">
                                    Mention
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={target.mention}
                                    onChange={(e) =>
                                        setTarget((t) => ({
                                            ...t,
                                            mention: e.target.value,
                                        }))
                                    }
                                    placeholder="Mention String"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-info text-white">
                                    Color
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={target.color}
                                    onChange={(e) =>
                                        setTarget((t) => ({
                                            ...t,
                                            color: e.target.value,
                                        }))
                                    }
                                    placeholder="Color"
                                />
                            </div>
                            <div className="input-group-prepend">
                                <span className="input-group-text bg-info text-white">
                                    Role IDs
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={target.roleIDs}
                                    onChange={(e) =>
                                        setTarget((t) => ({
                                            ...t,
                                            roleIDs: e.target.value,
                                        }))
                                    }
                                    placeholder="A list of roleids"
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-block btn-md btn-info mr-2 icon-btn d-flex justify-content-center align-items-center"
                                onClick={() => setTarget(randomTarget())}
                            >
                                <i className="icon mdi mdi-comment-question-outline btn-icon-prepend"></i>
                                <span className="text">Randomize</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Control Panel</h4>
                            <p className="card-description">
                                Here are some other things you may want to edit.
                            </p>
                            <button
                                type="button"
                                className="btn btn-block btn-lg btn-danger mr-2 icon-btn d-flex justify-content-center align-items-center"
                                onClick={() => {
                                    const all = randomAllSeeds();
                                    setArgs(all.args);
                                    setChannel(all.channel);
                                    setUser(all.user);
                                    setTarget(all.target);
                                }}
                            >
                                <i className="icon mdi mdi-comment-question-outline btn-icon-prepend"></i>
                                <span className="text">
                                    Randomize All Seeds.
                                </span>
                            </button>
                            <div className="form-group">
                                <div className="form-check form-check-primary">
                                    <label className="form-check-label">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={storageMode === "session"}
                                            onChange={(e) =>
                                                e.target.checked &&
                                                setStorageMode("session")
                                            }
                                        />
                                        Session Storage (Recommended if you
                                        don't know what you're doing)
                                    </label>
                                </div>
                                <div className="form-check form-check-success">
                                    <label className="form-check-label">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={storageMode === "local"}
                                            onChange={(e) =>
                                                e.target.checked &&
                                                setStorageMode("local")
                                            }
                                        />
                                        Local Storage (Not recommended)
                                    </label>
                                </div>
                            </div>
                            <div className="dropdown">
                                <button
                                    className="btn btn-block btn-lg btn-warning mr-2 icon-btn d-flex justify-content-center align-items-center dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuOutlineButton1"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    <i className="icon mdi mdi-close btn-icon-prepend"></i>
                                    <span className="text">Clear</span>
                                </button>
                                <div
                                    className="dropdown-menu"
                                    aria-labelledby="dropdownMenuOutlineButton1"
                                >
                                    <p
                                        className="dropdown-item"
                                        onClick={clearSession}
                                    >
                                        Session
                                    </p>
                                    <p
                                        className="dropdown-item"
                                        onClick={clearLocal}
                                    >
                                        Local
                                    </p>
                                    <div className="dropdown-divider"></div>
                                    <p
                                        className="dropdown-item"
                                        onClick={clearAll}
                                    >
                                        All
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
