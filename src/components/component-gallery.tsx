"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRight, Check, FileCode2, Leaf, Plus } from "lucide-react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { AskUserQuestions } from "@/components/ui/ask-user-questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CardGroup,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { CarouselDots } from "@/components/ui/carousel-dots";
import { ChatMessage } from "@/components/ui/chat-message";
import { CheckboxGroup, CheckboxItem } from "@/components/ui/checkbox-group";
import { ColorPickerPopover } from "@/components/ui/color-picker";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import {
    CommandMenu,
    CommandMenuInput,
    CommandMenuList,
    CommandMenuEmpty,
} from "@/components/ui/command-menu";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownTrigger,
    DropdownContent,
} from "@/components/ui/dropdown";
import { MenuItem } from "@/components/ui/menu-item";
import { FileThumbnail } from "@/components/ui/file-thumbnail";
import { InputCopy } from "@/components/ui/input-copy";
import { InputGroup, InputField } from "@/components/ui/input-group";
import { InputMessage } from "@/components/ui/input-message";
import MobileDrawer from "@/components/ui/mobile-drawer";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Sidebar,
    SidebarProvider,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabItem, TabPanel } from "@/components/ui/tabs";
import {
    TabsSubtle,
    TabsSubtleItem,
    TabsSubtlePanel,
} from "@/components/ui/tabs-subtle";
import { ThinkingIndicator } from "@/components/ui/thinking-indicator";
import {
    ThinkingSteps,
    ThinkingStepsHeader,
    ThinkingStepsContent,
    ThinkingStep,
} from "@/components/ui/thinking-steps";
import { Tooltip } from "@/components/ui/tooltip";
import { Elevated } from "@/lib/elevated";

const commandItems = [
    { value: "welcome", label: "Welcome tag", icon: FileCode2 },
    { value: "roll", label: "Dice roll", icon: Plus },
];
const slides = [
    "Start with an idea.",
    "Give it some context.",
    "See where it goes.",
];

function Demo({
    name,
    slug,
    children,
}: {
    name: string;
    slug?: string;
    children: ReactNode;
}) {
    return (
        <section
            data-component={name}
            className="workspace-panel flex min-h-44 flex-col"
        >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-sm font-medium">{name}</h2>
                <a
                    href={`https://www.fluidfunctionalism.com/docs/${slug ?? name.toLowerCase()}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${name} documentation`}
                    className="text-muted-foreground"
                >
                    <ArrowUpRight size={14} />
                </a>
            </div>
            <div className="flex flex-1 flex-col justify-center p-5">
                {children}
            </div>
        </section>
    );
}

export function ComponentGallery() {
    const [checked, setChecked] = useState(new Set([0]));
    const [color, setColor] = useState("#7c9265");
    const [choice, setChoice] = useState("Welcome");
    const [command, setCommand] = useState("");
    const [dropdown, setDropdown] = useState("Choose an action");
    const [name, setName] = useState("My first tag");
    const [draft, setDraft] = useState("");
    const [message, setMessage] = useState("Your message will appear here.");
    const [drawer, setDrawer] = useState(false);
    const [radio, setRadio] = useState("local");
    const [select, setSelect] = useState("User");
    const [slider, setSlider] = useState(60);
    const [enabled, setEnabled] = useState(true);
    const [subtle, setSubtle] = useState(0);
    const [slide, setSlide] = useState(0);
    const [answer, setAnswer] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [card, setCard] = useState(0);
    const [clicks, setClicks] = useState(0);
    const [navigation, setNavigation] = useState(0);
    return (
        <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <Badge color="green">30 components</Badge>
                <p className="text-xs text-muted-foreground">
                    Live examples · Official registry sources · Radix primitives
                </p>
                <a
                    className="ml-auto text-xs underline underline-offset-4"
                    href="https://www.fluidfunctionalism.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    Explore Fluid Functionalism
                </a>
            </div>
            <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Demo name="Button">
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => setClicks(clicks + 1)}>
                            Try me{clicks ? ` · ${clicks}` : ""}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setClicks(0)}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="ghost"
                            leadingIcon={Leaf}
                            onClick={() => setClicks(clicks + 1)}
                        >
                            Grow
                        </Button>
                    </div>
                </Demo>
                <Demo name="Badge">
                    <div className="flex flex-wrap gap-2">
                        <Badge color="green">Ready</Badge>
                        <Badge color="amber" variant="dot">
                            Draft
                        </Badge>
                        <Badge color="red">Needs a little work</Badge>
                    </div>
                </Demo>
                <Demo name="Switch">
                    <Switch
                        label="Enable notifications"
                        checked={enabled}
                        onToggle={() => setEnabled(!enabled)}
                    />
                </Demo>
                <Demo name="Slider">
                    <Slider
                        label="Volume"
                        value={slider}
                        onChange={(value) => setSlider(Number(value))}
                        showValue
                        formatValue={(value) => `${value}%`}
                    />
                </Demo>
                <Demo name="CheckboxGroup" slug="checkbox-group">
                    <CheckboxGroup checkedIndices={checked}>
                        {[
                            "Syntax highlighting",
                            "Browser storage",
                            "Keyboard shortcuts",
                        ].map((label, index) => (
                            <CheckboxItem
                                key={label}
                                index={index}
                                label={label}
                                checked={checked.has(index)}
                                onToggle={() =>
                                    setChecked((previous) => {
                                        const next = new Set(previous);
                                        if (next.has(index)) next.delete(index);
                                        else next.add(index);
                                        return next;
                                    })
                                }
                            />
                        ))}
                    </CheckboxGroup>
                </Demo>
                <Demo name="RadioGroup" slug="radio-group">
                    <RadioGroup value={radio} onValueChange={setRadio}>
                        <RadioItem
                            index={0}
                            value="local"
                            label="Keep it in this browser"
                        />
                        <RadioItem
                            index={1}
                            value="session"
                            label="Just for this session"
                        />
                    </RadioGroup>
                </Demo>
                <Demo name="InputGroup" slug="input-group">
                    <InputGroup>
                        <InputField
                            index={0}
                            label="Tag name"
                            value={name}
                            onChange={setName}
                        />
                        <InputField
                            index={1}
                            label="Description"
                            value={command}
                            onChange={setCommand}
                            placeholder="What does your tag do?"
                        />
                    </InputGroup>
                </Demo>
                <Demo name="InputCopy" slug="input-copy">
                    <InputCopy
                        label="A tiny tag to take with you"
                        value="Hello, {user(name)}!"
                    />
                </Demo>
                <Demo name="Select">
                    <Select value={select} onValueChange={setSelect}>
                        <SelectTrigger aria-label="Seed type" />
                        <SelectContent>
                            {["User", "Channel", "Target"].map(
                                (value, index) => (
                                    <SelectItem
                                        key={value}
                                        index={index}
                                        value={value}
                                    >
                                        {value}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </Demo>
                <Demo name="Combobox">
                    <Combobox
                        items={["Welcome", "Dice roll", "Calculator"]}
                        value={choice}
                        onValueChange={setChoice}
                    >
                        <ComboboxInput
                            aria-label="Search example tags"
                            placeholder="Search examples…"
                            clearable
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>No matching tags.</ComboboxEmpty>
                            <ComboboxList>
                                {(item) => {
                                    const value =
                                        typeof item === "string"
                                            ? item
                                            : item.value;
                                    return (
                                        <ComboboxItem key={value} value={value}>
                                            {typeof item === "string"
                                                ? item
                                                : item.label}
                                        </ComboboxItem>
                                    );
                                }}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </Demo>
                <Demo name="Dropdown">
                    <DropdownMenu>
                        <DropdownTrigger
                            render={
                                <Button variant="secondary">{dropdown}</Button>
                            }
                        />
                        <DropdownContent>
                            {[
                                "Duplicate tag",
                                "Move to collection",
                                "Archive tag",
                            ].map((label, index) => (
                                <MenuItem
                                    key={label}
                                    index={index}
                                    label={label}
                                    onSelect={() => setDropdown(label)}
                                />
                            ))}
                        </DropdownContent>
                    </DropdownMenu>
                </Demo>
                <Demo name="ColorPicker" slug="color-picker">
                    <ColorPickerPopover
                        value={color}
                        onValueChange={setColor}
                        triggerLabel="Pick your color"
                        triggerShowValue
                        hideEyedropper
                    />
                </Demo>
                <Demo name="Tabs">
                    <Tabs defaultValue="write">
                        <TabsList>
                            <TabItem value="write" label="Write" />
                            <TabItem value="run" label="Run" />
                            <TabItem value="refine" label="Refine" />
                        </TabsList>
                        {["write", "run", "refine"].map((value, index) => (
                            <TabPanel key={value} value={value}>
                                <p className="pt-5 text-sm text-muted-foreground">
                                    {slides[index]}
                                </p>
                            </TabPanel>
                        ))}
                    </Tabs>
                </Demo>
                <Demo name="TabsSubtle" slug="tabs-subtle">
                    <TabsSubtle
                        selectedIndex={subtle}
                        onSelect={setSubtle}
                        idPrefix="demo-tabs"
                    >
                        <TabsSubtleItem index={0} label="Overview" />
                        <TabsSubtleItem index={1} label="Details" />
                    </TabsSubtle>
                    {[
                        "A quieter way to navigate.",
                        "A moving highlight follows your selection.",
                    ].map((text, index) => (
                        <TabsSubtlePanel
                            key={text}
                            index={index}
                            selectedIndex={subtle}
                            idPrefix="demo-tabs"
                        >
                            <p className="pt-4 text-sm text-muted-foreground">
                                {text}
                            </p>
                        </TabsSubtlePanel>
                    ))}
                </Demo>
                <Demo name="Tooltip">
                    <div className="flex justify-center">
                        <Tooltip content="A little context, right when you need it.">
                            <Button variant="secondary">
                                Hover or focus me
                            </Button>
                        </Tooltip>
                    </div>
                </Demo>
                <Demo name="Accordion">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="one" index={0}>
                            <AccordionTrigger>
                                What makes it fluid?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="p-3 text-sm text-muted-foreground">
                                    Spring motion and proximity highlights
                                    respond to your next move.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="two" index={1}>
                            <AccordionTrigger>
                                Can I use the keyboard?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="p-3 text-sm text-muted-foreground">
                                    Yes. Tab to a control, then use Enter,
                                    Space, or arrow keys.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Demo>
                <Demo name="Dialog">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary">
                                Open a little space
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    A little room to focus.
                                </DialogTitle>
                                <DialogDescription>
                                    Press Escape or use the close button when
                                    you’re done.
                                </DialogDescription>
                            </DialogHeader>
                            <p className="pt-6 leading-7 text-muted-foreground">
                                Dialogs keep the task in focus while preserving
                                the workspace behind it.
                            </p>
                        </DialogContent>
                    </Dialog>
                </Demo>
                <Demo name="MobileDrawer" slug="mobile-drawer">
                    <Button variant="secondary" onClick={() => setDrawer(true)}>
                        Open drawer
                    </Button>
                    <MobileDrawer
                        open={drawer}
                        onClose={() => setDrawer(false)}
                    >
                        <div className="space-y-5 p-6">
                            <h3 className="text-xl font-medium">
                                A little more space.
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                A navigation surface for compact screens.
                            </p>
                            <Button onClick={() => setDrawer(false)}>
                                Back to the gallery
                            </Button>
                        </div>
                    </MobileDrawer>
                </Demo>
                <Demo name="Table">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tag</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {["Welcome", "Dice roll"].map((tag) => (
                                <TableRow key={tag}>
                                    <TableCell>{tag}</TableCell>
                                    <TableCell>
                                        <Badge color="green" size="compact">
                                            Ready
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Demo>
                <Demo name="Card">
                    <CardGroup border="outlined" separated>
                        {["An idea", "A possibility"].map((title, index) => (
                            <Card
                                key={title}
                                label={`Select ${title}`}
                                selected={card === index}
                                onClick={() => setCard(index)}
                            >
                                <CardHeader>
                                    <CardTitle>{title}</CardTitle>
                                    <CardDescription>
                                        Click to make it yours.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </CardGroup>
                </Demo>
                <Demo name="CarouselDots" slug="carousel-dots">
                    <p className="mb-6 text-center text-sm">{slides[slide]}</p>
                    <CarouselDots
                        count={slides.length}
                        value={slide}
                        onValueChange={setSlide}
                    />
                </Demo>
                <Demo name="ScrollArea" slug="scrollbars">
                    <ScrollArea className="h-36">
                        <div className="space-y-4 p-2">
                            {Array.from({ length: 12 }, (_, index) => (
                                <p
                                    key={index}
                                    className="text-sm text-muted-foreground"
                                >
                                    {String(index + 1).padStart(2, "0")} —
                                    There’s always room for another idea.
                                </p>
                            ))}
                        </div>
                    </ScrollArea>
                </Demo>
                <Demo name="Sidebar">
                    <SidebarProvider
                        persist={false}
                        shortcut={null}
                        className="!min-h-0"
                        width="100%"
                    >
                        <Sidebar
                            collapsible="none"
                            rail={false}
                            className="!w-full"
                        >
                            <SidebarContent>
                                <SidebarMenu>
                                    {["Workspace", "Your tags", "Settings"].map(
                                        (label, index) => (
                                            <SidebarMenuItem key={label}>
                                                <SidebarMenuButton
                                                    isActive={
                                                        navigation === index
                                                    }
                                                    onClick={() =>
                                                        setNavigation(index)
                                                    }
                                                >
                                                    {label}
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ),
                                    )}
                                </SidebarMenu>
                            </SidebarContent>
                        </Sidebar>
                    </SidebarProvider>
                </Demo>
                <Demo name="CommandMenu" slug="command-menu">
                    <CommandMenu
                        items={commandItems}
                        onSelect={(item) => setCommand(item.label)}
                    >
                        <CommandMenuInput
                            placeholder="Find a tag…"
                            aria-label="Search gallery commands"
                        />
                        <CommandMenuList>
                            <CommandMenuEmpty>No tags found.</CommandMenuEmpty>
                        </CommandMenuList>
                    </CommandMenu>
                    <p
                        className="mt-3 text-xs text-muted-foreground"
                        aria-live="polite"
                    >
                        {command
                            ? `Selected: ${command}`
                            : "Type to filter. Enter to select."}
                    </p>
                </Demo>
                <Demo name="ChatMessage" slug="chat-message">
                    <div className="space-y-4">
                        <ChatMessage from="user">Hello, TagScript.</ChatMessage>
                        <ChatMessage from="assistant">
                            Hello! Let’s make something useful.
                        </ChatMessage>
                    </div>
                </Demo>
                <Demo name="InputMessage" slug="input-message">
                    <InputMessage
                        value={draft}
                        onValueChange={setDraft}
                        onSend={(value) => {
                            setMessage(value);
                            setDraft("");
                        }}
                        placeholder="Try the message composer…"
                        textareaProps={{ "aria-label": "Gallery message" }}
                    />
                    <p
                        className="mt-3 break-words text-xs text-muted-foreground"
                        aria-live="polite"
                    >
                        {message}
                    </p>
                </Demo>
                <Demo name="FileThumbnail" slug="file-thumbnail">
                    <div className="flex items-center gap-4">
                        {file && <FileThumbnail file={file} size={60} />}
                        <label className="cursor-pointer text-xs text-muted-foreground">
                            Preview a local file
                            <input
                                type="file"
                                aria-label="Preview a local file"
                                className="mt-3 block max-w-full text-xs"
                                onChange={(event) =>
                                    setFile(event.target.files?.[0] ?? null)
                                }
                            />
                        </label>
                    </div>
                </Demo>
                <Demo name="ThinkingIndicator" slug="thinking-indicator">
                    <ThinkingIndicator />
                    <p className="mt-2 text-xs text-muted-foreground">
                        An activity indicator demo. No request is running.
                    </p>
                </Demo>
                <Demo name="ThinkingSteps" slug="thinking-steps">
                    <ThinkingSteps defaultOpen>
                        <ThinkingStepsHeader>
                            Example execution
                        </ThinkingStepsHeader>
                        <ThinkingStepsContent>
                            <ThinkingStep
                                label="Read the script"
                                status="complete"
                            />
                            <ThinkingStep
                                label="Resolve the context"
                                status="complete"
                            />
                            <ThinkingStep
                                label="Return the response"
                                status="complete"
                                isLast
                            />
                        </ThinkingStepsContent>
                    </ThinkingSteps>
                </Demo>
                <Demo name="AskUserQuestions" slug="ask-user-questions">
                    {answer ? (
                        <div>
                            <Badge color="green">
                                <Check size={12} className="mr-1" />
                                {answer}
                            </Badge>
                            <Button
                                variant="ghost"
                                className="mt-3"
                                onClick={() => setAnswer("")}
                            >
                                Try again
                            </Button>
                        </div>
                    ) : (
                        <AskUserQuestions
                            questions={[
                                {
                                    id: "idea",
                                    title: "What would you like to build?",
                                    options: [
                                        {
                                            id: "A welcome tag",
                                            title: "A welcome tag",
                                        },
                                        {
                                            id: "A little game",
                                            title: "A little game",
                                        },
                                    ],
                                    allowOther: false,
                                },
                            ]}
                            onComplete={(answers) =>
                                setAnswer(
                                    answers.idea.selectedIds[0] ??
                                        "Ready to begin",
                                )
                            }
                        />
                    )}
                </Demo>
            </div>
            <div className="mt-6">
                <Elevated offset={1} className="rounded-2xl p-6">
                    <h2 className="font-medium">
                        Built on a shared surface system.
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        All 30 components use the same theme, typography, and
                        elevation. Try dark mode in workspace settings.
                    </p>
                </Elevated>
            </div>
        </>
    );
}
