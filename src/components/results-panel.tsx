"use client";

import { useState } from "react";
import { Braces, Check, Copy, Terminal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabItem, TabPanel } from "@/components/ui/tabs";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { ChatMessage } from "@/components/ui/chat-message";
import { ThinkingIndicator } from "@/components/ui/thinking-indicator";
import {
    ThinkingSteps,
    ThinkingStepsHeader,
    ThinkingStepsContent,
    ThinkingStep,
} from "@/components/ui/thinking-steps";
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
        <section className="workspace-panel flex min-h-[490px] flex-col">
            <div className="panel-heading">
                <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-muted-foreground" />
                    <h2 className="font-medium">Output</h2>
                </div>
                <Badge
                    variant="dot"
                    color={
                        busy
                            ? "amber"
                            : error
                              ? "red"
                              : result
                                ? "green"
                                : "gray"
                    }
                >
                    {busy
                        ? "Running"
                        : error
                          ? "Failed"
                          : result
                            ? "Complete"
                            : "Ready"}
                </Badge>
            </div>
            <Tabs defaultValue="response" className="flex flex-1 flex-col">
                <div className="px-4 pt-4">
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
                <div className="flex-1 p-5" aria-live="polite" aria-busy={busy}>
                    {busy && (
                        <div className="mb-4">
                            <ThinkingIndicator />
                            <p className="text-xs text-muted-foreground">
                                Sending your script to the TagScript engine…
                            </p>
                        </div>
                    )}
                    {error && (
                        <p
                            role="alert"
                            className="mb-4 rounded-xl bg-destructive-light p-4 text-sm text-destructive"
                        >
                            {error}
                        </p>
                    )}
                    <TabPanel value="response">
                        {result ? (
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent font-mono text-primary">
                                        b.
                                    </div>
                                    <span className="text-xs font-medium">
                                        TagScript
                                    </span>
                                    <Badge size="compact">BOT</Badge>
                                </div>
                                <ChatMessage from="assistant">
                                    <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7">
                                        {result.body ||
                                            "This tag returned an empty response."}
                                    </pre>
                                </ChatMessage>
                            </div>
                        ) : (
                            !busy &&
                            !error && (
                                <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground">
                                        <Braces size={24} strokeWidth={1.3} />
                                    </div>
                                    <h3 className="font-medium">
                                        A little code. A little possibility.
                                    </h3>
                                    <p className="mt-2 max-w-56 text-xs leading-6 text-muted-foreground">
                                        Run your tag to see what it says.
                                        <br />
                                        Your response will appear right here.
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
                                <p className="py-16 text-center text-sm text-muted-foreground">
                                    {result
                                        ? `No ${name === "actions" ? "actions" : "variables"} returned by this tag.`
                                        : `Run a tag to inspect its ${name}.`}
                                </p>
                            )}
                        </TabPanel>
                    ))}
                </div>
            </Tabs>
            {result && (
                <div className="border-t border-border px-4 py-2">
                    <ThinkingSteps>
                        <ThinkingStepsHeader>
                            Execution details
                        </ThinkingStepsHeader>
                        <ThinkingStepsContent>
                            <ThinkingStep
                                label="Request sent"
                                description="Script and seed context submitted."
                                status="complete"
                            />
                            <ThinkingStep
                                label="Response received"
                                description={`${elapsed} ms · ${actions.length} actions · ${debug.length} variables`}
                                status="complete"
                                isLast
                            />
                        </ThinkingStepsContent>
                    </ThinkingSteps>
                </div>
            )}
            <div className="flex min-h-12 items-center justify-between border-t border-border px-5">
                <span className="text-[11px] text-muted-foreground">
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
                <p role="alert" className="px-5 pb-3 text-xs text-destructive">
                    {copyError}
                </p>
            )}
        </section>
    );
}
