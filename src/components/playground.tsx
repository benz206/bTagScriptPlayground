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
    FlaskConical,
    GitFork,
    Grid2X2,
    Leaf,
    MoreHorizontal,
    Play,
    Plus,
    Search,
    Settings2,
    Sparkles,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import {
    Sidebar,
    SidebarProvider,
    useSidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
} from "@/components/ui/sidebar";
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
    CardGroup,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
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
            <div className="h-[340px] p-6 text-muted-foreground">
                Loading editor…
            </div>
        ),
    },
);
const ComponentGallery = dynamic(() =>
    import("./component-gallery").then((m) => m.ComponentGallery),
);
type View = "playground" | "examples" | "guide" | "components";
type StorageMode = "local" | "session" | "off";

export function Playground() {
    return (
        <MotionConfig reducedMotion="user">
            <ShapeProvider>
                <TooltipProvider>
                    <SidebarProvider
                        width="228px"
                        persist={false}
                        shortcut={null}
                    >
                        <Workspace />
                    </SidebarProvider>
                </TooltipProvider>
            </ShapeProvider>
        </MotionConfig>
    );
}

function Workspace() {
    const { setOpenMobile } = useSidebar();
    const [view, updateView] = useState<View>("playground");
    function setView(next: View) {
        updateView(next);
        setOpenMobile(false);
    }
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
    const [theme, setTheme] = useState("light");
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Browser storage is only available after hydration; restore the legacy script once.
        /* eslint-disable react-hooks/set-state-in-effect */
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
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

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
        {
            value: "components",
            label: "Browse Fluid components",
            icon: Grid2X2,
        },
        { value: "settings", label: "Workspace settings", icon: Settings2 },
        { value: "import", label: "Import a Carl tag", icon: Upload },
    ];

    return (
        <>
            <a
                href="#workspace"
                className="sr-only z-50 rounded bg-background p-3 focus:not-sr-only focus:fixed"
            >
                Skip to workspace
            </a>
            <Sidebar rail={false} className="bg-background">
                <SidebarHeader className="px-6 py-7">
                    <a
                        href="#workspace"
                        onClick={() => setView("playground")}
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Braces size={21} />
                        </div>
                        <div className="text-[15px] font-semibold tracking-tight">
                            bTagScript
                            <span className="block text-[10px] font-normal tracking-[.2em] text-muted-foreground">
                                PLAYGROUND
                            </span>
                        </div>
                    </a>
                </SidebarHeader>
                <SidebarContent className="px-3">
                    <Button
                        variant="tertiary"
                        className="mb-7 w-full justify-start text-muted-foreground"
                        leadingIcon={Search}
                        onClick={() => {
                            setOpenMobile(false);
                            setPalette(true);
                        }}
                    >
                        Quick search{" "}
                        <kbd className="ml-auto text-[10px]">⌘ K</kbd>
                    </Button>
                    <SidebarGroup>
                        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                        <SidebarMenu>
                            {(
                                [
                                    {
                                        id: "playground",
                                        label: "Playground",
                                        icon: Braces,
                                    },
                                    {
                                        id: "examples",
                                        label: "Examples",
                                        icon: FileCode2,
                                    },
                                    {
                                        id: "guide",
                                        label: "Quick guide",
                                        icon: BookOpen,
                                    },
                                    {
                                        id: "components",
                                        label: "Components",
                                        icon: Grid2X2,
                                    },
                                ] as const
                            ).map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        icon={item.icon}
                                        isActive={view === item.id}
                                        onClick={() => setView(item.id)}
                                    >
                                        {item.label}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                    <SidebarGroup className="mt-7">
                        <SidebarGroupLabel>
                            Start with an idea
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {examples.slice(0, 3).map((example, index) => (
                                <SidebarMenuItem key={example.name}>
                                    <SidebarMenuButton
                                        onClick={() => loadExample(index)}
                                    >
                                        <span className="mr-1 text-muted-foreground">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        {example.name}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="gap-4 p-5">
                    <div className="rounded-xl border border-border p-4">
                        <Leaf size={18} className="mb-3 text-primary" />
                        <p className="text-xs font-medium">
                            Room to experiment.
                        </p>
                        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                            Small ideas turn into useful tags.
                            <br />
                            Make something yours.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        leadingIcon={Settings2}
                        className="justify-start"
                        onClick={() => {
                            setOpenMobile(false);
                            setSettings(true);
                        }}
                    >
                        Workspace settings
                    </Button>
                    <a
                        href="https://github.com/benz206/bTagScriptPlayground"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 text-xs text-muted-foreground"
                    >
                        <GitFork size={14} />
                        View on GitHub
                        <ArrowUpRight size={13} className="ml-auto" />
                    </a>
                </SidebarFooter>
            </Sidebar>
            <div className="min-w-0 flex-1">
                <header className="flex h-[76px] items-center justify-between border-b border-border px-5 lg:px-9">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="md:hidden" />
                        <span className="text-xs text-muted-foreground">
                            Workspace
                        </span>
                        <span className="text-border">/</span>
                        <span className="text-xs capitalize">
                            {view === "guide" ? "Quick guide" : view}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant="dot"
                            color="green"
                            className="hidden sm:inline-flex"
                        >
                            A space for your tags
                        </Badge>
                        <Tooltip content="Workspace settings">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Workspace settings"
                                onClick={() => {
                                    setOpenMobile(false);
                                    setSettings(true);
                                }}
                            >
                                <Settings2 size={16} />
                            </Button>
                        </Tooltip>
                    </div>
                </header>
                <main
                    id="workspace"
                    className="mx-auto max-w-[1600px] px-5 py-8 lg:px-9 lg:py-10"
                >
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <p className="eyebrow mb-3">
                                {view === "playground"
                                    ? "Write. Run. Refine."
                                    : "Explore the possibilities"}
                            </p>
                            <h1 className="text-3xl font-medium tracking-[-.045em] sm:text-[36px]">
                                {view === "playground"
                                    ? "Good tags start here."
                                    : view === "examples"
                                      ? "A place to begin."
                                      : view === "guide"
                                        ? "Meet your playground."
                                        : "Fluid, by design."}
                            </h1>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {view === "playground"
                                    ? "Give your ideas a little room to run."
                                    : view === "components"
                                      ? "Every component in the current Fluid Functionalism registry, ready to try."
                                      : "A little inspiration for whatever you’re building next."}
                            </p>
                        </div>
                        {view === "playground" && (
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    leadingIcon={Upload}
                                    onClick={() => setImportOpen(true)}
                                >
                                    Import tag
                                </Button>
                                <Button
                                    leadingIcon={Play}
                                    loading={busy}
                                    disabled={!ready || !script.trim()}
                                    onClick={run}
                                >
                                    Run tag{" "}
                                    <kbd className="ml-3 hidden text-[10px] opacity-60 sm:inline">
                                        ⌘ ↵
                                    </kbd>
                                </Button>
                            </div>
                        )}
                    </div>
                    {notice && (
                        <div
                            role="status"
                            className="mb-5 flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3 text-xs"
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
                    {view === "playground" && (
                        <>
                            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
                                <div className="min-w-0">
                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <section className="workspace-panel">
                                            <div className="panel-heading">
                                                <div className="flex items-center gap-2">
                                                    <FileCode2
                                                        size={16}
                                                        className="text-muted-foreground"
                                                    />
                                                    <h2 className="font-medium">
                                                        my-tag.tagscript
                                                    </h2>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownTrigger
                                                        render={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label="Script options"
                                                            >
                                                                <MoreHorizontal
                                                                    size={16}
                                                                />
                                                            </Button>
                                                        }
                                                    />
                                                    <DropdownContent>
                                                        <MenuItem
                                                            index={0}
                                                            label="Export script"
                                                            icon={
                                                                ArrowDownToLine
                                                            }
                                                            onSelect={
                                                                exportScript
                                                            }
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
                                                                setElapsed(
                                                                    null,
                                                                );
                                                            }}
                                                        />
                                                    </DropdownContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                                                <Badge size="compact">
                                                    TagScript
                                                </Badge>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Your next good idea ↓
                                                </span>
                                            </div>
                                            <ScriptEditor
                                                value={script}
                                                onChange={setScript}
                                                fontSize={fontSize}
                                            />
                                            <div className="flex min-h-12 items-center justify-between border-t border-border px-5 text-[11px] text-muted-foreground">
                                                <span>
                                                    {script.split("\n").length}{" "}
                                                    lines · {script.length}{" "}
                                                    characters
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Check size={12} />
                                                    {storage === "off"
                                                        ? "Autosave off"
                                                        : storage === "local"
                                                          ? "Saved in browser"
                                                          : "Saved for session"}
                                                </span>
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
                                    </div>
                                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <Sparkles
                                                size={16}
                                                className="text-primary"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                A blank page isn’t always the
                                                best starting point.
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="compact"
                                            trailingIcon={ArrowUpRight}
                                            onClick={() => setView("examples")}
                                        >
                                            Try an example
                                        </Button>
                                    </div>
                                </div>
                                <SeedPanel
                                    seeds={seeds}
                                    setSeeds={setSeeds}
                                    useTarget={useTarget}
                                    setUseTarget={setUseTarget}
                                />
                            </div>
                            <footer className="mt-8 flex flex-wrap justify-between gap-2 text-[10px] text-muted-foreground">
                                <span>
                                    Made for the little things that make your
                                    server yours.
                                </span>
                                <span>
                                    Powered by bTagScript · Crafted with Fluid
                                    Functionalism
                                </span>
                            </footer>
                        </>
                    )}
                    {view === "examples" && (
                        <CardGroup
                            columns={1}
                            separated
                            border="outlined"
                            className="grid gap-4 md:!grid-cols-2"
                        >
                            {examples.map((example, index) => (
                                <Card
                                    key={example.name}
                                    label={`Load ${example.name}`}
                                    onClick={() => loadExample(index)}
                                >
                                    <CardHeader>
                                        <Badge color="green">
                                            {example.category}
                                        </Badge>
                                        <CardTitle className="mt-4">
                                            {example.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {example.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-7">
                                            {example.code}
                                        </pre>
                                        <span className="mt-5 flex items-center gap-2 text-xs">
                                            Open in playground{" "}
                                            <ArrowUpRight size={14} />
                                        </span>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardGroup>
                    )}
                    {view === "guide" && (
                        <div className="max-w-3xl space-y-7">
                            <div className="workspace-panel p-6">
                                <FlaskConical className="mb-5 text-primary" />
                                <h2 className="text-xl font-medium">
                                    A safe place to test your ideas.
                                </h2>
                                <p className="mt-3 leading-7 text-muted-foreground">
                                    Write a tag, give it some context, and run
                                    it. The playground sends your script and
                                    seeds to the bTagScript engine. It shows the
                                    response, actions, and variables without
                                    executing Discord commands.
                                </p>
                            </div>
                            <Accordion
                                type="single"
                                collapsible
                                defaultValue="seeds"
                            >
                                {[
                                    [
                                        "seeds",
                                        "What are seeds?",
                                        "Seeds provide the user, channel, target, and arguments that a Discord bot would normally supply. Edit them in Set the scene. Unless enabled separately, target uses the same values as user.",
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
                                        "The response appears in Output. Actions shows what the bot would do, and Debug lists the variables returned by the engine. Run with the button or Command/Control + Enter. Network and engine errors appear beside the editor.",
                                    ],
                                ].map(([id, title, text], index) => (
                                    <AccordionItem
                                        key={id}
                                        value={id}
                                        index={index}
                                    >
                                        <AccordionTrigger>
                                            {title}
                                        </AccordionTrigger>
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
                    )}
                    {view === "components" && <ComponentGallery />}
                </main>
            </div>
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
        </>
    );
}
