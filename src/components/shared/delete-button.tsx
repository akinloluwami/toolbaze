import React from "react";
import { Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeleteButtonProps = {
    onClick: () => void;
    className?: string;
    variant?: "default" | "icon" | "minimal";
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    disabled?: boolean;
    label?: string;
};

export const DeleteButton = ({
    onClick,
    className = "",
    variant = "default",
    size = "md",
    showLabel = true,
    disabled = false,
    label = "Delete",
}: DeleteButtonProps) => {
    const sizeClasses = {
        sm: "py-1 px-2 text-xs",
        md: "py-2 px-3 text-sm",
        lg: "py-2 px-4 text-base",
    };

    const iconSizes = {
        sm: 14,
        md: 16,
        lg: 18,
    };

    if (variant === "icon") {
        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`p-2 transition-colors rounded-lg bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                title={label}
                aria-label={label}
            >
                <Trash size={iconSizes[size]} />
            </button>
        );
    }

    if (variant === "minimal") {
        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`flex items-center gap-2 transition-colors text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                aria-label={label}
            >
                <Trash size={iconSizes[size]} />
                {showLabel && <span className="text-sm">{label}</span>}
            </button>
        );
    }

    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 ${sizeClasses[size]} min-w-[90px] overflow-hidden relative transition-colors bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            <Trash size={iconSizes[size]} />
            {showLabel && label}
        </Button>
    );
};
