"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputField } from "@/components/ui/input-group";
import {
    TabsSubtle,
    TabsSubtleItem,
    TabsSubtlePanel,
} from "@/components/ui/tabs-subtle";
import { Switch } from "@/components/ui/switch";
import { ColorPickerPopover } from "@/components/ui/color-picker";
import { randomPerson, randomChannel, type Seeds } from "@/lib/tagscript";

const labels: Record<string, string> = {
    name: "Display name",
    username: "Username",
    id: "ID",
    createdAt: "Created at (Unix)",
    joinedAt: "Joined at (Unix)",
    mention: "Mention",
    color: "Role color",
    roleIDs: "Role IDs",
    nsfw: "NSFW",
    topic: "Topic",
    slowmode: "Slowmode (seconds)",
};
export function SeedPanel({
    seeds,
    setSeeds,
    useTarget,
    setUseTarget,
}: {
    seeds: Seeds;
    setSeeds: (value: Seeds) => void;
    useTarget: boolean;
    setUseTarget: (value: boolean) => void;
}) {
    const [tab, setTab] = useState(0);
    const groups = ["user", "channel", "target"] as const;
    const group = groups[tab];
    const update = (key: string, value: string) =>
        setSeeds({ ...seeds, [group]: { ...seeds[group], [key]: value } });
    return (
        <section className="workspace-panel">
            <div className="panel-heading">
                <div>
                    <h2 className="font-medium">Set the scene</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        The people and place behind your tag.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Randomize all seeds"
                    onClick={() =>
                        setSeeds({
                            args: "Hello world",
                            user: randomPerson(),
                            target: randomPerson(),
                            channel: randomChannel(),
                        })
                    }
                >
                    <Shuffle size={16} />
                </Button>
            </div>
            <div className="p-4">
                <InputGroup>
                    <InputField
                        index={0}
                        label="Arguments · {args}"
                        value={seeds.args}
                        onChange={(args) => setSeeds({ ...seeds, args })}
                    />
                </InputGroup>
            </div>
            <div className="border-t border-border px-4 pt-3">
                <TabsSubtle
                    selectedIndex={tab}
                    onSelect={setTab}
                    idPrefix="seed-tabs"
                >
                    {["User", "Channel", "Target"].map((label, index) => (
                        <TabsSubtleItem
                            key={label}
                            index={index}
                            label={label}
                        />
                    ))}
                </TabsSubtle>
            </div>
            {groups.map((name, index) => (
                <TabsSubtlePanel
                    key={name}
                    idPrefix="seed-tabs"
                    index={index}
                    selectedIndex={tab}
                >
                    <div className="space-y-3 p-4">
                        {name === "target" && (
                            <Switch
                                label="Use a separate target"
                                checked={useTarget}
                                onToggle={() => setUseTarget(!useTarget)}
                            />
                        )}
                        {name === "target" && !useTarget ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Your target follows the user. Enable a separate
                                target to customize it.
                            </p>
                        ) : (
                            <>
                                <InputGroup>
                                    {Object.entries(seeds[name])
                                        .filter(
                                            ([key]) =>
                                                key !== "color" &&
                                                key !== "nsfw",
                                        )
                                        .map(([key, value], i) => (
                                            <InputField
                                                key={key}
                                                index={i}
                                                label={labels[key]}
                                                value={value}
                                                onChange={(next) =>
                                                    update(key, next)
                                                }
                                            />
                                        ))}
                                </InputGroup>
                                {name !== "channel" && (
                                    <ColorPickerPopover
                                        value={`#${seeds[name].color}`}
                                        onValueChange={(_, parsed) =>
                                            update(
                                                "color",
                                                parsed.hex.replace("#", ""),
                                            )
                                        }
                                        triggerLabel="Role color"
                                        hideEyedropper
                                    />
                                )}
                                {name === "channel" && (
                                    <Switch
                                        label="NSFW channel"
                                        checked={seeds.channel.nsfw === "true"}
                                        onToggle={() =>
                                            update(
                                                "nsfw",
                                                seeds.channel.nsfw === "true"
                                                    ? "false"
                                                    : "true",
                                            )
                                        }
                                    />
                                )}
                                <Button
                                    variant="tertiary"
                                    leadingIcon={Shuffle}
                                    className="w-full"
                                    onClick={() =>
                                        setSeeds({
                                            ...seeds,
                                            [name]:
                                                name === "channel"
                                                    ? randomChannel()
                                                    : randomPerson(),
                                        })
                                    }
                                >
                                    Randomize {name}
                                </Button>
                            </>
                        )}
                    </div>
                </TabsSubtlePanel>
            ))}
        </section>
    );
}
