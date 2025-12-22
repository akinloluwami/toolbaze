import { CopyButton } from "@/components/shared";

type ColorCodeListProps = {
    entries: Record<string, string | number>;
};

export const ColorCodeList = ({ entries }: ColorCodeListProps) => {
    return (
        <div className="space-y-3">
            {Object.entries(entries)
                .filter(([key]) => key !== "name")
                .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <p className="uppercase font-medium text-sm w-16">{key}</p>
                            <p className="text-sm font-mono truncate">{String(value)}</p>
                        </div>
                        <CopyButton textToCopy={String(value)} variant="icon" />
                    </div>
                ))}
        </div>
    );
}
