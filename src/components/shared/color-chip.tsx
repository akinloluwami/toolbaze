import { cn } from "@/lib/utils";
import { CopyButton, DeleteButton } from "@/components/shared";
import { getLuminosity } from "@/utils/get-luminosity";

type ColorChipProps = {
    color: string;
    onDelete?: () => void;
    onClick?: () => void;
    className?: string;
    showCode?: boolean;
    isSelected?: boolean;
};

export const ColorChip = ({ color, onDelete, onClick, className, showCode = true, isSelected = false }: ColorChipProps) => {

    const textColor = getLuminosity(color) > 0.7 ? "#000000" : "#ffffff";

    return (
        <div
            role="listitem"
            aria-selected={isSelected}
            className={cn(
                "flex items-center justify-between rounded-lg p-3 shadow-sm transition hover:shadow-md min-h-12",
                onClick ? "cursor-pointer hover:scale-[1.01]" : "",
                isSelected ? "ring-2 ring-offset-2 ring-black/20" : "",
                className
            )}
            style={{ backgroundColor: color }}
            onClick={onClick}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={
                onClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onClick();
                        }
                    }
                    : undefined
            }
        >
            {/* Color code */}
            {showCode && (
                <span
                    className="font-mono text-sm truncate"
                    style={{ color: textColor }}
                    title={color}
                >
                    {color}
                </span>
            )}

            {/* Actions (stop click bubbling to avoid selecting the chip when clicking an action) */}
            <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
                <CopyButton textToCopy={color} variant="icon" size="md" className="p-1" />
                {onDelete && (
                    <DeleteButton onClick={onDelete} variant="icon" size="md" className="p-1" />
                )}
            </div>
        </div>
    );
};
