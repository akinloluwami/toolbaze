import iro from "@jaames/iro";

import { useEffect, useRef, useState } from "react";
import { getLuminosity } from "@/utils/get-luminosity";
import { createFileRoute } from "@tanstack/react-router";
import { ColorChip, ColorCodeList } from "@/components/shared";
import ContentLayout from "@/components/shared/content-layout";
import { convertHexColorCode } from "@/utils/convert-hex-color-code";

export const Route = createFileRoute("/(tools)/color-picker")({
    component: RouteComponent,
});

function RouteComponent() {
    // Default Config
    const paletteSize = 5;
    const [color, setColor] = useState('#fff');

    const colorPickerRef = useRef<HTMLDivElement>(null);
    const colorPickerInstance = useRef<iro.ColorPicker | null>(null);

    const [colorCode, setColorCode] = useState(convertHexColorCode(color));
    const [palette, setPalette] = useState<string[]>([]);
    const [selectedPaletteIndex, setSelectedPaletteIndex] = useState<number | null>(null);

    useEffect(() => {
        const container = colorPickerRef.current;
        if (container) {
            container.innerHTML = "";

            // Determine size based on screen width
            const getPickerWidth = () => {
                if (window.innerWidth < 640)
                    return Math.min(window.innerWidth - 32, 280);
                if (window.innerWidth < 1024) return 350;
                return 500;
            };

            // @ts-ignore
            const colorPicker = new iro.ColorPicker(container, {
                width: getPickerWidth(),
                color: color,
            });

            colorPicker.on("color:change", (color: iro.Color) => {
                setColor(color.hexString);
                setColorCode(convertHexColorCode(color.hexString));
            });

            colorPickerInstance.current = colorPicker;

            // Auto-generate a color
            autoGenerateColor();
        }
    }, []);

    const autoGenerateColor = () => {
        // Generate a random hex color
        const r = Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, "0");
        const g = Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, "0");
        const b = Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, "0");
        const hex = `#${r}${g}${b}`;

        setColor(hex);
        setColorCode(convertHexColorCode(hex));
        // If the picker instance exists, update it immediately
        if (colorPickerInstance.current) {
            colorPickerInstance.current.color.set(hex);
        }
    };

    const addToPalette = () => {
        setPalette((prev) => {
            if (prev.length >= paletteSize) return prev;
            if (prev.includes(color)) return prev;
            return [...prev, color];
        });
    };

    const removeFromPalette = (idx: number) => {
        setPalette((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
        <ContentLayout title="Color Picker">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 w-full">
                {/* COLOR PICKER HTML REFERENCE */}
                <div ref={colorPickerRef} className="w-fit mx-auto lg:mx-0" />

                <div className="w-full">
                    <div
                        className="h-24 lg:h-20 w-full rounded-lg flex items-center justify-center mb-4"
                        style={{
                            backgroundColor: color,
                            color: getLuminosity(color) > 0.7 ? "black" : "white",
                        }}
                    >
                        <p className="text-lg lg:text-xl font-semibold px-4 text-center">
                            {colorCode.name}
                        </p>
                    </div>

                    {/* Color codes */}
                    <ColorCodeList entries={colorCode as Record<string, string | number>} />

                    <div className="mt-3">
                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                            <button
                                type="button"
                                className="w-full sm:w-auto px-3 py-2 rounded bg-black text-white text-sm hover:opacity-90"
                                onClick={autoGenerateColor}
                                aria-label="Auto generate a random color"
                            >
                                Auto Generate
                            </button>
                            <button
                                type="button"
                                className="w-full sm:w-auto px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100"
                                onClick={addToPalette}
                                disabled={palette.length >= paletteSize}
                                aria-label="Add current color to palette"
                            >
                                Add to Palette ({palette.length}/{paletteSize})
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mb-4">
                            Tip: this tool auto-generates a color on load, click a swatch to view its codes, or use the copy button to copy any value. Palette capped at {paletteSize} colors.
                        </p>

                        {/* Palette */}
                        <div role="list" aria-label="Palette" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                            {palette.map((p, idx) => (
                                <ColorChip
                                    key={p}
                                    color={p}
                                    onDelete={() => removeFromPalette(idx)}
                                    onClick={() =>
                                        setSelectedPaletteIndex((cur) => (cur === idx ? null : idx))
                                    }
                                    isSelected={selectedPaletteIndex === idx}
                                />
                            ))}
                            {palette.length === 0 && (
                                <p className="text-sm text-gray-500">Palette empty!</p>
                            )}
                        </div>

                        {/* Selected palette color codes */}
                        {selectedPaletteIndex !== null && palette[selectedPaletteIndex] && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Palette color</p>
                                <ColorCodeList
                                    entries={convertHexColorCode(palette[selectedPaletteIndex]) as Record<string, string | number>}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
}
