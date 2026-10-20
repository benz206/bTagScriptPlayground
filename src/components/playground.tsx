"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
import {
    ArrowDownToLine,
    ArrowUpRight,
    BookOpen,
    Braces,
    Check,
    FileCode2,
    GitFork,
    LoaderCircle,
    Moon,
    MoreHorizontal,
    Play,
    Plus,
    Search,
    Settings2,
    Sun,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownTrigger,
    DropdownContent,
} from "@/components/ui/dropdown";
import { MenuItem } from "@/components/ui/menu-item";
import { InputGroup, InputField } from "@/components/ui/input-group";
import { InputCopy } from "@/components/ui/input-copy";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import {
    CommandMenu,
    CommandMenuDialog,
    CommandMenuInput,
    CommandMenuList,
    CommandMenuEmpty,
    CommandMenuFooter,
} from "@/components/ui/command-menu";
import { ShapeProvider } from "@/lib/shape-context";
import { cn } from "@/lib/utils";
import {
    examples,
    initialSeeds,
    importCarlTag,
    runTag,
    type TagResult,
} from "@/lib/tagscript";
import { SeedPanel } from "./seed-panel";
import { ResultsPanel } from "./results-panel";

const ScriptEditor = dynamic(
    () => import("./script-editor").then((m) => m.ScriptEditor),
    {
        ssr: false,
        loading: () => (
            <div className="p-6 font-mono text-[12px] text-muted-foreground">
                Loading editor…
            </div>
        ),
    },
);
type View = "playground" | "examples" | "guide";
type StorageMode = "local" | "session" | "off";

export function Playground() {
    return (
        <MotionConfig reducedMotion="user">
            <ShapeProvider>
                <TooltipProvider>
                    <Workspace />
                </TooltipProvider>
            </ShapeProvider>
        </MotionConfig>
    );
}

function Workspace() {
    const [view, setView] = useState<View>("playground");
    const [script, setScript] = useState(examples[0].code);
    const [seeds, setSeeds] = useState(initialSeeds);
    const [useTarget, setUseTarget] = useState(false);
    const [result, setResult] = useState<TagResult | null>(null);
    const [busy, setBusy] = useState(false);
    const running = useRef(false);
    const [error, setError] = useState("");
    const [elapsed, setElapsed] = useState<number | null>(null);
    const [settings, setSettings] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [importValue, setImportValue] = useState("");
    const [importError, setImportError] = useState("");
    const [importing, setImporting] = useState(false);
    const [palette, setPalette] = useState(false);
    const [storage, setStorage] = useState<StorageMode>("local");
    const [ready, setReady] = useState(false);
    const [notice, setNotice] = useState("");
    const [fontSize, setFontSize] = useState(14);
    const [theme, updateTheme] = useState("light");
    const fileInput = useRef<HTMLInputElement>(null);

    function setTheme(value: string) {
        updateTheme(value);
        document.documentElement.classList.toggle("dark", value === "dark");
        try {
            localStorage.setItem("btag-theme", value);
        } catch {
            // Theme switching still works when browser storage is unavailable.
        }
    }

    useEffect(() => {
        // Browser storage is only available after hydration; restore the legacy script once.
        /* eslint-disable react-hooks/set-state-in-effect */
        updateTheme(
            document.documentElement.classList.contains("dark")
                ? "dark"
                : "light",
        );
        try {
            const savedMode = localStorage.getItem("btag-storage");
            const mode: StorageMode =
                savedMode === "session" || savedMode === "off"
                    ? savedMode
                    : savedMode === "local"
                      ? "local"
                      : localStorage.getItem("useSession") === "true"
                        ? "session"
                        : "local";
            const saved =
                mode === "off"
                    ? null
                    : (mode === "local"
                          ? localStorage
                          : sessionStorage
                      ).getItem("tagscript");
            if (saved !== null) setScript(saved);
            setStorage(mode);
        } catch {
            setNotice(
                "Browser storage is unavailable. Export your script to keep a copy.",
            );
        }
        setReady(true);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, []);
    useEffect(() => {
        if (!ready) return;
        try {
            localStorage.setItem("btag-storage", storage);
            if (storage !== "off")
                (storage === "local" ? localStorage : sessionStorage).setItem(
                    "tagscript",
                    script,
                );
            if (storage !== "local") localStorage.removeItem("tagscript");
            if (storage !== "session") sessionStorage.removeItem("tagscript");
        } catch {
            // Report storage failures from this synchronization effect.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNotice("Could not save your script. Export it to keep a copy.");
        }
    }, [script, storage, ready]);

    const run = useCallback(async () => {
        if (running.current) return;
        if (!script.trim()) {
            setResult(null);
            setElapsed(null);
            setError("Write a tag before running it.");
            return;
        }
        running.current = true;
        setBusy(true);
        setError("");
        setResult(null);
        setElapsed(null);
        const started = performance.now();
        try {
            setResult(await runTag(script, seeds, useTarget));
            setElapsed(Math.round(performance.now() - started));
        } catch (err) {
            setError(
                err instanceof TypeError
                    ? "The TagScript engine could not be reached. Check your connection and try again. Your script is still here."
                    : err instanceof Error
                      ? err.message
                      : "The tag could not be processed.",
            );
        } finally {
            running.current = false;
            setBusy(false);
        }
    }, [script, seeds, useTarget]);
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key === "Enter" &&
                view === "playground" &&
                !importOpen &&
                !settings &&
                !palette
            ) {
                event.preventDefault();
                void run();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [run, view, importOpen, settings, palette]);

    function loadExample(index: number) {
        setScript(examples[index].code);
        setResult(null);
        setError("");
        setElapsed(null);
        setView("playground");
    }
    function exportScript() {
        const url = URL.createObjectURL(
            new Blob([script], { type: "text/plain" }),
        );
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "my-tag.tagscript";
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    async function importTag() {
        if (importing) return;
        setImporting(true);
        setImportError("");
        try {
            setScript(await importCarlTag(importValue));
            setResult(null);
            setError("");
            setElapsed(null);
            setImportOpen(false);
            setView("playground");
            setImportValue("");
        } catch (err) {
            setImportError(
                err instanceof TypeError
                    ? "Carl import could not be reached. Paste your script or import a file instead."
                    : err instanceof Error
                      ? err.message
                      : "Import failed.",
            );
        } finally {
            setImporting(false);
        }
    }
    const commands = [
        { value: "playground", label: "Open playground", icon: Braces },
        { value: "examples", label: "Explore examples", icon: FileCode2 },
        { value: "guide", label: "Read the guide", icon: BookOpen },
        { value: "settings", label: "Workspace settings", icon: Settings2 },
        { value: "import", label: "Import a Carl tag", icon: Upload },
    ];

    const views = [
        { id: "playground", label: "Playground" },
        { id: "examples", label: "Examples" },
        { id: "guide", label: "Guide" },
    ] as const;
    const viewTabs = views.map((item) => (
        <button
            key={item.id}
            type="button"
            aria-current={view === item.id ? "page" : undefined}
            onClick={() => setView(item.id)}
            className={cn(
                "h-7 rounded-md px-2.5 text-[13px] transition-colors",
                view === item.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground",
            )}
        >
            {item.label}
        </button>
    ));

    return (
        <div className="flex min-h-dvh flex-col lg:h-dvh">
            <a
                href="#workspace"
                className="sr-only z-50 rounded bg-background p-3 focus:not-sr-only focus:fixed"
            >
                Skip to workspace
            </a>
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
                <a
                    href="#workspace"
                    onClick={() => setView("playground")}
                    className="mr-2 flex items-center gap-2"
                >
                    <span className="grid size-6 place-items-center rounded-md bg-linear-to-br from-(--accent-from) to-(--accent-to) font-mono text-[13px] font-bold text-(--on-accent)">
                        b
                    </span>
                    <span className="hidden text-[14px] font-semibold tracking-tight sm:inline">
                        bTagScript
                    </span>
                    <span className="hidden rounded border border-border px-1.5 font-mono text-[10px] leading-4 text-muted-foreground sm:inline">
                        playground
                    </span>
                </a>
                <nav aria-label="Views" className="hidden gap-0.5 md:flex">
                    {viewTabs}
                </nav>
                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setPalette(true)}
                        className="mr-1 hidden h-8 items-center gap-6 rounded-md border border-border bg-background pr-1.5 pl-2.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong lg:flex"
                    >
                        <span className="flex items-center gap-2">
                            <Search size={14} />
                            Jump to…
                        </span>
                        <kbd className="rounded border border-border px-1.5 font-mono text-[11px] text-faint">
                            ⌘K
                        </kbd>
                    </button>
                    <Tooltip
                        content={
                            theme === "dark"
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                    >
                        <Button
                            variant="ghost"
                            size="icon-compact"
                            aria-label={
                                theme === "dark"
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"
                            }
                            disabled={!ready}
                            onClick={() =>
                                setTheme(theme === "dark" ? "light" : "dark")
                            }
                        >
                            {theme === "dark" ? (
                                <Sun size={15} />
                            ) : (
                                <Moon size={15} />
                            )}
                        </Button>
                    </Tooltip>
                    <Tooltip content="Workspace settings">
                        <Button
                            variant="ghost"
                            size="icon-compact"
                            aria-label="Workspace settings"
                            onClick={() => setSettings(true)}
                        >
                            <Settings2 size={15} />
                        </Button>
                    </Tooltip>
                    <span className="mx-1.5 h-5 w-px bg-border" />
                    <Button
                        variant="secondary"
                        size="compact"
                        leadingIcon={Upload}
                        aria-label="Import tag"
                        onClick={() => setImportOpen(true)}
                    >
                        <span className="hidden sm:inline">Import tag</span>
                    </Button>
                    <button
                        type="button"
                        disabled={!ready || busy || !script.trim()}
                        onClick={run}
                        className="ml-1 inline-flex h-7 items-center gap-1.5 rounded-md bg-linear-to-r from-(--accent-from) to-(--accent-to) px-3 text-[12px] font-medium whitespace-nowrap text-(--on-accent) transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {busy ? (
                            <LoaderCircle size={13} className="animate-spin" />
                        ) : (
                            <Play size={13} fill="currentColor" />
                        )}
                        Run tag
                        <kbd className="hidden font-mono text-[10px] opacity-60 sm:inline">
                            ⌘↵
                        </kbd>
                    </button>
                </div>
            </header>
            <nav
                aria-label="Views"
                className="flex shrink-0 gap-0.5 border-b border-border px-3 py-1.5 md:hidden"
            >
                {viewTabs}
            </nav>
            {notice && (
                <div
                    role="status"
                    className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-ctp-mauve/8 py-1 pr-2 pl-4 text-[12px]"
                >
                    {notice}
                    <Button
                        variant="ghost"
                        size="compact"
                        onClick={() => setNotice("")}
                    >
                        Dismiss
                    </Button>
                </div>
            )}
            <main
                id="workspace"
                className="min-h-0 flex-1 bg-background lg:overflow-hidden"
            >
                {view === "playground" && (
                    <div className="grid lg:h-full lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_340px]">
                        <h1 className="sr-only">Playground</h1>
                        <section className="flex h-[420px] flex-col border-b border-border lg:h-auto lg:min-h-0 lg:border-r lg:border-b-0">
                            <div className="flex h-11 shrink-0 items-stretch justify-between border-b border-border bg-chrome pr-2">
                                <div className="relative flex items-center gap-2 border-r border-border bg-background px-4 font-mono text-[12px]">
                                    <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-(--accent-from) to-(--accent-to)" />
                                    <FileCode2
                                        size={13}
                                        className="text-ctp-mauve"
                                    />
                                    <h2>my-tag.tagscript</h2>
                                </div>
                                <div className="flex items-center">
                                    <DropdownMenu>
                                        <DropdownTrigger
                                            render={
                                                <Button
                                                    variant="ghost"
                                                    size="icon-compact"
                                                    aria-label="Script options"
                                                >
                                                    <MoreHorizontal size={15} />
                                                </Button>
                                            }
                                        />
                                        <DropdownContent>
                                            <MenuItem
                                                index={0}
                                                label="Export script"
                                                icon={ArrowDownToLine}
                                                onSelect={exportScript}
                                            />
                                            <MenuItem
                                                index={1}
                                                label="Import a file"
                                                icon={Upload}
                                                onSelect={() =>
                                                    fileInput.current?.click()
                                                }
                                            />
                                            <MenuItem
                                                index={2}
                                                label="New blank tag"
                                                icon={Plus}
                                                onSelect={() => {
                                                    setScript("");
                                                    setResult(null);
                                                    setError("");
                                                    setElapsed(null);
                                                }}
                                            />
                                        </DropdownContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="min-h-0 flex-1">
                                <ScriptEditor
                                    value={script}
                                    onChange={setScript}
                                    fontSize={fontSize}
                                />
                            </div>
                        </section>
                        <ResultsPanel
                            result={result}
                            busy={busy}
                            error={error}
                            elapsed={elapsed}
                            clear={(section) =>
                                setResult((current) =>
                                    current
                                        ? section === "actions"
                                            ? {
                                                  ...current,
                                                  actions: {},
                                              }
                                            : {
                                                  ...current,
                                                  extras: {
                                                      debug: {},
                                                  },
                                              }
                                        : null,
                                )
                            }
                        />
                        <SeedPanel
                            seeds={seeds}
                            setSeeds={setSeeds}
                            useTarget={useTarget}
                            setUseTarget={setUseTarget}
                        />
                    </div>
                )}
                {view === "examples" && (
                    <div className="h-full overflow-y-auto">
                        <div className="mx-auto max-w-5xl px-5 py-10 lg:py-14">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Examples
                            </h1>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                                Start from a working tag. Opening one replaces
                                what’s in the editor.
                            </p>
                            <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
                                {examples.map((example, index) => (
                                    <button
                                        key={example.name}
                                        type="button"
                                        onClick={() => loadExample(index)}
                                        className="group flex flex-col bg-background p-5 text-left transition-colors hover:bg-chrome"
                                    >
                                        <span className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                                            {String(index + 1).padStart(2, "0")}{" "}
                                            · {example.category}
                                            <ArrowUpRight
                                                size={14}
                                                className="text-faint transition-colors group-hover:text-ctp-mauve"
                                            />
                                        </span>
                                        <h2 className="mt-3 font-medium">
                                            {example.name}
                                        </h2>
                                        <p className="mt-1 text-[13px] text-muted-foreground">
                                            {example.description}
                                        </p>
                                        <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-chrome p-3 font-mono text-[12px] leading-6">
                                            {example.code}
                                        </pre>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {view === "guide" && (
                    <div className="h-full overflow-y-auto">
                        <div className="mx-auto max-w-2xl px-5 py-10 lg:py-14">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Guide
                            </h1>
                            <p className="mt-3 leading-7 text-muted-foreground">
                                Write a tag, give it some context, and run it.
                                The playground sends your script and seeds to
                                the bTagScript engine. It shows the response,
                                actions, and variables without executing
                                Discord commands.
                            </p>
                            <Accordion
                                type="single"
                                collapsible
                                defaultValue="seeds"
                                className="mt-8 w-full"
                            >
                                {[
                                    [
                                        "seeds",
                                        "What are seeds?",
                                        "Seeds provide the user, channel, target, and arguments that a Discord bot would normally supply. Edit them in the Seeds pane. Unless enabled separately, target uses the same values as user.",
                                    ],
                                    [
                                        "save",
                                        "Where does my script go?",
                                        "Scripts autosave in this browser by default. Workspace settings lets you choose session storage or turn autosave off. Export a script from the editor menu for a portable copy. Running a tag sends its text and seeds to the external TagScript engine.",
                                    ],
                                    [
                                        "import",
                                        "How do I import a tag?",
                                        "Use Import tag with a Carl tag ID or link, or import a local .txt or .tagscript file. Carl imports depend on the existing external proxy. If it is unavailable, paste the script or use a file.",
                                    ],
                                    [
                                        "run",
                                        "What happens when I run a tag?",
                                        "The response appears in Output. Actions shows what the bot would do, and Debug lists the variables returned by the engine. Run with the button or Command/Control + Enter. Network and engine errors appear in the Output pane.",
                                    ],
                                ].map(([id, title, text], index) => (
                                    <AccordionItem
                                        key={id}
                                        value={id}
                                        index={index}
                                    >
                                        <AccordionTrigger>{title}</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="px-3 pb-4 text-sm leading-7 text-muted-foreground">
                                                {text}
                                            </p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                            <Button
                                asChild
                                variant="secondary"
                                trailingIcon={ArrowUpRight}
                                className="mt-8"
                            >
                                <a
                                    href="https://btagscript.readthedocs.io/en/latest/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Full TagScript documentation
                                </a>
                            </Button>
                        </div>
                    </div>
                )}
            </main>
            <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-border px-4 font-mono text-[11px] text-muted-foreground">
                <span>
                    {script.split("\n").length} lines · {script.length} chars
                </span>
                <span className="flex items-center gap-1">
                    <Check size={11} />
                    {storage === "off"
                        ? "Autosave off"
                        : storage === "local"
                          ? "Saved in browser"
                          : "Saved for session"}
                </span>
                <span className="ml-auto hidden sm:inline">
                    bTagScript engine
                </span>
                <a
                    href="https://github.com/benz206/bTagScriptPlayground"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 transition-colors hover:text-foreground max-sm:ml-auto"
                >
                    <GitFork size={11} />
                    GitHub
                </a>
            </footer>
            <input
                ref={fileInput}
                type="file"
                accept=".txt,.tagscript,text/plain"
                className="hidden"
                aria-label="Import script file"
                onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                        setScript(await file.text());
                        setResult(null);
                        setError("");
                        setElapsed(null);
                        setView("playground");
                        setNotice(`Imported ${file.name}`);
                    } catch {
                        setNotice("This file could not be read.");
                    }
                    event.target.value = "";
                }}
            />
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bring your tag along.</DialogTitle>
                        <DialogDescription>
                            Import an existing Carl tag by ID or public link.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 pt-5">
                        <InputGroup>
                            <InputField
                                index={0}
                                label="Carl tag ID or URL"
                                placeholder="https://carl.gg/t/1479390"
                                value={importValue}
                                onChange={setImportValue}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") void importTag();
                                }}
                            />
                        </InputGroup>
                        {importError && (
                            <p
                                role="alert"
                                className="text-xs text-destructive"
                            >
                                {importError}
                            </p>
                        )}
                        <Button
                            className="w-full"
                            leadingIcon={Upload}
                            loading={importing}
                            onClick={importTag}
                        >
                            Import tag
                        </Button>
                        <p className="text-xs leading-5 text-muted-foreground">
                            Uses the existing Carl import service. You can also
                            import a local file from the editor menu.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={settings} onOpenChange={setSettings}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Make yourself at home.</DialogTitle>
                        <DialogDescription>
                            Your workspace, your way.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-6">
                        <div>
                            <p className="eyebrow mb-2">Save your work</p>
                            <RadioGroup
                                value={storage}
                                onValueChange={(value) =>
                                    setStorage(value as StorageMode)
                                }
                            >
                                <RadioItem
                                    index={0}
                                    value="local"
                                    label="In this browser"
                                />
                                <RadioItem
                                    index={1}
                                    value="session"
                                    label="For this session"
                                />
                                <RadioItem
                                    index={2}
                                    value="off"
                                    label="Don’t autosave"
                                />
                            </RadioGroup>
                        </div>
                        <div className="flex items-center justify-between gap-5">
                            <label className="text-sm" id="theme-label">
                                Appearance
                            </label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger aria-labelledby="theme-label" />
                                <SelectContent>
                                    <SelectItem index={0} value="light">
                                        Light
                                    </SelectItem>
                                    <SelectItem index={1} value="dark">
                                        Dark
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Slider
                            label="Editor font size"
                            value={fontSize}
                            min={12}
                            max={20}
                            step={1}
                            onChange={(value) => setFontSize(Number(value))}
                            showValue
                            formatValue={(value) => `${value}px`}
                        />
                        <InputCopy
                            label="Run your tag"
                            value="Command / Control + Enter"
                        />
                        <Button
                            variant="tertiary"
                            onClick={() => {
                                try {
                                    for (const store of [
                                        localStorage,
                                        sessionStorage,
                                    ])
                                        for (const key of [
                                            "tagscript",
                                            "useLocal",
                                            "useSession",
                                        ])
                                            store.removeItem(key);
                                    setScript("");
                                    setResult(null);
                                    setNotice("Saved script cleared.");
                                    setSettings(false);
                                } catch {
                                    setNotice(
                                        "Browser storage could not be cleared.",
                                    );
                                }
                            }}
                        >
                            Clear saved script
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <CommandMenuDialog open={palette} onOpenChange={setPalette}>
                <CommandMenu
                    items={commands}
                    onSelect={(item) => {
                        if (item.value === "settings") setSettings(true);
                        else if (item.value === "import") setImportOpen(true);
                        else setView(item.value as View);
                    }}
                >
                    <CommandMenuInput placeholder="Where would you like to go?" />
                    <CommandMenuList>
                        <CommandMenuEmpty>
                            No matching commands.
                        </CommandMenuEmpty>
                    </CommandMenuList>
                    <CommandMenuFooter />
                </CommandMenu>
            </CommandMenuDialog>
        </div>
    );
}
