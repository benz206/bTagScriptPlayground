"use client";

import { useState } from "react";
import { Check, Copy, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabItem, TabPanel } from "@/components/ui/tabs";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { displayValue, type TagResult } from "@/lib/tagscript";

export function ResultsPanel({
    result,
    busy,
    error,
    elapsed,
    clear,
}: {
    result: TagResult | null;
    busy: boolean;
    error: string;
    elapsed: number | null;
    clear: (section: "actions" | "debug") => void;
}) {
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");
    async function copy() {
        try {
            await navigator.clipboard.writeText(result?.body ?? "");
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopyError(
                "Copy is unavailable. Select the output text to copy it manually.",
            );
        }
    }
    const actions = Object.entries(result?.actions ?? {});
    const debug = Object.entries(result?.extras.debug ?? {}).filter(
        ([key]) => !["user", "target", "channel", "args"].includes(key),
    );
    return (
        <section className="flex min-h-[460px] flex-col border-b border-border lg:min-h-0 lg:border-r lg:border-b-0">
            <div className="pane-head">
                <h2 className="text-[13px] font-medium">Output</h2>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <span
                        className={cn(
                            "size-1.5 rounded-full",
                            busy
                                ? "animate-pulse bg-ctp-yellow"
                                : error
                                  ? "bg-ctp-red"
                                  : result
                                    ? "bg-ctp-green"
                                    : "bg-faint",
                        )}
                    />
                    {busy
                        ? "Running"
                        : error
                          ? "Failed"
                          : result
                            ? "Complete"
                            : "Ready"}
                </span>
            </div>
            <Tabs defaultValue="response" className="flex min-h-0 flex-1 flex-col">
                <div className="px-3 pt-3">
                    <TabsList className="w-full">
                        <TabItem value="response" label="Response" />
                        <TabItem
                            value="actions"
                            label={`Actions${actions.length ? ` · ${actions.length}` : ""}`}
                        />
                        <TabItem
                            value="debug"
                            label={`Debug${debug.length ? ` · ${debug.length}` : ""}`}
                        />
                    </TabsList>
                </div>
                <div
                    className="min-h-0 flex-1 overflow-y-auto p-4"
                    aria-live="polite"
                    aria-busy={busy}
                >
                    {busy && (
                        <p className="mb-4 flex items-center gap-2 text-[13px] text-muted-foreground">
                            <LoaderCircle
                                size={14}
                                className="animate-spin text-ctp-mauve"
                            />
                            Sending your script to the TagScript engine…
                        </p>
                    )}
                    {error && (
                        <p
                            role="alert"
                            className="mb-4 rounded-md border border-ctp-red/30 bg-ctp-red/8 p-3 text-[13px] text-ctp-red"
                        >
                            {error}
                        </p>
                    )}
                    <TabPanel value="response">
                        {result ? (
                            <div className="flex gap-3 rounded-md px-1 py-1">
                                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-(--accent-from) to-(--accent-to) font-mono text-sm font-bold text-(--on-accent)">
                                    b
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[13px] font-semibold">
                                            TagScript
                                        </span>
                                        <span className="rounded bg-ctp-blue/15 px-1 font-mono text-[10px] leading-4 font-semibold text-ctp-blue">
                                            BOT
                                        </span>
                                    </div>
                                    <pre className="mt-1 font-sans text-sm leading-6 break-words whitespace-pre-wrap">
                                        {result.body ||
                                            "This tag returned an empty response."}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            !busy &&
                            !error && (
                                <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                                    <kbd className="rounded-md border border-border bg-chrome px-2 py-1 font-mono text-[12px] text-muted-foreground">
                                        ⌘ ↵
                                    </kbd>
                                    <h3 className="mt-4 text-[13px] font-medium">
                                        Nothing has run yet
                                    </h3>
                                    <p className="mt-1 max-w-60 text-[12px] leading-5 text-muted-foreground">
                                        Run your tag and the bot’s reply shows
                                        up here.
                                    </p>
                                </div>
                            )
                        )}
                    </TabPanel>
                    {(
                        [
                            ["actions", actions],
                            ["debug", debug],
                        ] as const
                    ).map(([name, rows]) => (
                        <TabPanel value={name} key={name}>
                            {name === "actions" &&
                            result?.actions.blacklist &&
                            result?.actions.requires ? (
                                <p className="mb-3 text-xs text-destructive">
                                    A tag cannot use both blacklist and require
                                    blocks.
                                </p>
                            ) : null}
                            {rows.length ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        {name === "actions"
                                                            ? "Action"
                                                            : "Variable"}
                                                    </TableHead>
                                                    <TableHead>Value</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rows.map(([key, value]) => (
                                                    <TableRow key={key}>
                                                        <TableCell className="align-top font-mono text-xs">
                                                            {key}
                                                        </TableCell>
                                                        <TableCell>
                                                            <pre className="max-w-80 whitespace-pre-wrap break-words text-xs">
                                                                {displayValue(
                                                                    value,
                                                                )}
                                                            </pre>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        leadingIcon={Trash2}
                                        className="mt-4"
                                        onClick={() => clear(name)}
                                    >
                                        Clear {name}
                                    </Button>
                                </>
                            ) : (
                                <p className="py-16 text-center text-[13px] text-muted-foreground">
                                    {result
                                        ? `No ${name === "actions" ? "actions" : "variables"} returned by this tag.`
                                        : `Run a tag to inspect its ${name}.`}
                                </p>
                            )}
                        </TabPanel>
                    ))}
                </div>
            </Tabs>
            <div className="flex h-10 shrink-0 items-center justify-between border-t border-border pr-2 pl-4">
                <span className="font-mono text-[11px] text-muted-foreground">
                    {elapsed === null
                        ? "Waiting for your first run"
                        : `Completed in ${elapsed} ms`}
                </span>
                <Button
                    variant="ghost"
                    size="compact"
                    leadingIcon={copied ? Check : Copy}
                    disabled={!result}
                    onClick={copy}
                >
                    {copied ? "Copied" : "Copy output"}
                </Button>
            </div>
            {copyError && (
                <p role="alert" className="px-4 pb-3 text-xs text-destructive">
                    {copyError}
                </p>
            )}
        </section>
    );
}
