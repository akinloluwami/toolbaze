import ContentLayout from "@/components/shared/content-layout";
import { CopyButton } from "@/components/shared";
import { ButtonGroup } from "@/components/shared/button-group";
import { NumberInput } from "@/components/shared/number-input";
import { createFileRoute } from "@tanstack/react-router";
import cronstrue from "cronstrue";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export const Route = createFileRoute("/(tools)/cron-generator")({
    component: RouteComponent,
});

type CronType = "minute" | "hour" | "day" | "month" | "weekday";

const tabs: { id: CronType; label: string }[] = [
    { id: "minute", label: "Minute" },
    { id: "hour", label: "Hour" },
    { id: "day", label: "Day" },
    { id: "month", label: "Month" },
    { id: "weekday", label: "Weekday" },
];

function RouteComponent() {
    const [cron, setCron] = useState({
        minute: "*",
        hour: "*",
        day: "*",
        month: "*",
        weekday: "*",
    });
    const [description, setDescription] = useState("");
    const [activeTab, setActiveTab] = useState<CronType>("minute");

    const cronString = `${cron.minute} ${cron.hour} ${cron.day} ${cron.month} ${cron.weekday}`;

    useEffect(() => {
        try {
            setDescription(cronstrue.toString(cronString));
        } catch (e) {
            setDescription("Invalid cron expression");
        }
    }, [cronString]);

    const updateCron = (type: CronType, value: string) => {
        setCron((prev) => ({ ...prev, [type]: value }));
    };


    return (
        <ContentLayout title="Cron Expression Generator">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Preview Section */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-4">
                    <div className="flex items-center justify-center gap-4">
                        <code className="text-4xl font-mono font-bold text-gray-800 bg-gray-50 px-6 py-3 rounded-lg border border-gray-100">
                            {cronString}
                        </code>
                        <CopyButton textToCopy={cronString} variant="icon" />
                    </div>
                    <p className="text-xl text-gray-600 font-medium">{description}</p>
                </div>

                {/* Configuration Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 overflow-x-auto">
                        <ButtonGroup
                            items={tabs.map((tab) => ({
                                label: tab.label,
                                onClick: () => setActiveTab(tab.id),
                                variant: activeTab === tab.id ? "default" : "ghost",
                            }))}
                        />
                    </div>

                    <div className="p-6 min-h-[300px]">
                        {activeTab === "minute" && (
                            <MinuteConfig
                                value={cron.minute}
                                onChange={(v) => updateCron("minute", v)}
                            />
                        )}
                        {activeTab === "hour" && (
                            <HourConfig
                                value={cron.hour}
                                onChange={(v) => updateCron("hour", v)}
                            />
                        )}
                        {activeTab === "day" && (
                            <DayConfig
                                value={cron.day}
                                onChange={(v) => updateCron("day", v)}
                            />
                        )}
                        {activeTab === "month" && (
                            <MonthConfig
                                value={cron.month}
                                onChange={(v) => updateCron("month", v)}
                            />
                        )}
                        {activeTab === "weekday" && (
                            <WeekdayConfig
                                value={cron.weekday}
                                onChange={(v) => updateCron("weekday", v)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
}

// Configuration Components

function MinuteConfig({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-6">
            <RadioOption
                label="Every minute"
                checked={value === "*"}
                onChange={() => onChange("*")}
            />

            <div className="flex items-center gap-4">
                <RadioOption
                    label="Every"
                    checked={value.includes("/")}
                    onChange={() => onChange("*/5")}
                />
                <div className="w-32">
                    <NumberInput
                        min={1}
                        max={59}
                        value={value.includes("/") ? value.split("/")[1] : 5}
                        onChange={(e) => onChange(`*/${e.target.value}`)}
                        disabled={!value.includes("/")}
                        unit="mins"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <RadioOption
                        label="Specific minutes (choose one or many)"
                        checked={!value.includes("/") && value !== "*"}
                        onChange={() => onChange("0")}
                    />
                    {!value.includes("/") && value !== "*" && (
                        <button
                            onClick={() => onChange("*")}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div
                    className={`grid grid-cols-10 gap-2 ${value === "*" || value.includes("/") ? "opacity-50 pointer-events-none" : ""}`}
                >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <button
                            type="button"
                            key={m}
                            onClick={() => {
                                const current =
                                    value === "*" || value.includes("/") ? [] : value.split(",");
                                const newVal = current.includes(m.toString())
                                    ? current.filter((v) => v !== m.toString())
                                    : [...current, m.toString()];
                                onChange(newVal.length ? newVal.join(",") : "*");
                            }}
                            className={twMerge(
                                "h-8 flex items-center justify-center rounded text-xs border transition-colors",
                                !value.includes("/") &&
                                    value !== "*" &&
                                    value.split(",").includes(m.toString())
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function HourConfig({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-6">
            <RadioOption
                label="Every hour"
                checked={value === "*"}
                onChange={() => onChange("*")}
            />

            <div className="flex items-center gap-4">
                <RadioOption
                    label="Every"
                    checked={value.includes("/")}
                    onChange={() => onChange("*/2")}
                />
                <div className="w-32">
                    <NumberInput
                        min={1}
                        max={23}
                        value={value.includes("/") ? value.split("/")[1] : 2}
                        onChange={(e) => onChange(`*/${e.target.value}`)}
                        disabled={!value.includes("/")}
                        unit="hours"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <RadioOption
                        label="Specific hours (choose one or many)"
                        checked={!value.includes("/") && value !== "*"}
                        onChange={() => onChange("0")}
                    />
                    {!value.includes("/") && value !== "*" && (
                        <button
                            onClick={() => onChange("*")}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div
                    className={`grid grid-cols-8 gap-2 ${value === "*" || value.includes("/") ? "opacity-50 pointer-events-none" : ""}`}
                >
                    {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                        <button
                            type="button"
                            key={h}
                            onClick={() => {
                                const current =
                                    value === "*" || value.includes("/") ? [] : value.split(",");
                                const newVal = current.includes(h.toString())
                                    ? current.filter((v) => v !== h.toString())
                                    : [...current, h.toString()];
                                onChange(newVal.length ? newVal.join(",") : "*");
                            }}
                            className={twMerge(
                                "h-9 flex items-center justify-center rounded text-sm border transition-colors",
                                !value.includes("/") &&
                                    value !== "*" &&
                                    value.split(",").includes(h.toString())
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {h}:00
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DayConfig({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-6">
            <RadioOption
                label="Every day"
                checked={value === "*"}
                onChange={() => onChange("*")}
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <RadioOption
                        label="Specific days of month"
                        checked={value !== "*"}
                        onChange={() => onChange("1")}
                    />
                    {value !== "*" && (
                        <button
                            onClick={() => onChange("*")}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div
                    className={`grid grid-cols-7 gap-2 ${value === "*" ? "opacity-50 pointer-events-none" : ""}`}
                >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <button
                            type="button"
                            key={d}
                            onClick={() => {
                                const current = value === "*" ? [] : value.split(",");
                                const newVal = current.includes(d.toString())
                                    ? current.filter((v) => v !== d.toString())
                                    : [...current, d.toString()];
                                onChange(newVal.length ? newVal.join(",") : "*");
                            }}
                            className={twMerge(
                                "h-9 flex items-center justify-center rounded text-sm border transition-colors",
                                value !== "*" && value.split(",").includes(d.toString())
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MonthConfig({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    return (
        <div className="space-y-6">
            <RadioOption
                label="Every month"
                checked={value === "*"}
                onChange={() => onChange("*")}
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <RadioOption
                        label="Specific months"
                        checked={value !== "*"}
                        onChange={() => onChange("1")}
                    />
                    {value !== "*" && (
                        <button
                            onClick={() => onChange("*")}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div
                    className={`grid grid-cols-4 gap-3 ${value === "*" ? "opacity-50 pointer-events-none" : ""}`}
                >
                    {months.map((m, i) => (
                        <button
                            type="button"
                            key={m}
                            onClick={() => {
                                const current = value === "*" ? [] : value.split(",");
                                const newVal = current.includes((i + 1).toString())
                                    ? current.filter((v) => v !== (i + 1).toString())
                                    : [...current, (i + 1).toString()];
                                onChange(newVal.length ? newVal.join(",") : "*");
                            }}
                            className={twMerge(
                                "h-10 flex items-center justify-center rounded text-sm font-medium border transition-colors",
                                value !== "*" && value.split(",").includes((i + 1).toString())
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function WeekdayConfig({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
        <div className="space-y-6">
            <RadioOption
                label="Every weekday"
                checked={value === "*"}
                onChange={() => onChange("*")}
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <RadioOption
                        label="Specific days of week"
                        checked={value !== "*"}
                        onChange={() => onChange("0")}
                    />
                    {value !== "*" && (
                        <button
                            onClick={() => onChange("*")}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div
                    className={`grid grid-cols-7 gap-2 ${value === "*" ? "opacity-50 pointer-events-none" : ""}`}
                >
                    {days.map((d, i) => (
                        <button
                            type="button"
                            key={d}
                            onClick={() => {
                                const current = value === "*" ? [] : value.split(",");
                                const newVal = current.includes(i.toString())
                                    ? current.filter((v) => v !== i.toString())
                                    : [...current, i.toString()];
                                onChange(newVal.length ? newVal.join(",") : "*");
                            }}
                            className={twMerge(
                                "h-9 flex items-center justify-center rounded text-sm font-medium border transition-colors",
                                value !== "*" && value.split(",").includes(i.toString())
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RadioOption({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="radio"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 text-black border-gray-300 focus:ring-black"
            />
            <span className="text-gray-700">{label}</span>
        </label>
    );
}
