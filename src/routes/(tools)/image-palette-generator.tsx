import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon, X, ChevronDown } from "lucide-react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import ColorThief from "colorthief";
import Modal from "@/components/shared/modal";
import { convertHexColorCode } from "@/utils/convert-hex-color-code";
import { getLuminosity } from "@/utils/get-luminosity";
import { Tooltip } from "react-tooltip";
import ContentLayout from "@/components/shared/content-layout";
import {
    FileDropZone,
    ColorCard,
    EmptyState,
    LoadingSpinner,
} from "@/components/shared";

export const Route = createFileRoute("/(tools)/image-palette-generator")({
    component: RouteComponent,
});

type ExportFormat = "json" | "css" | "scss" | "tailwind" | "array";

function RouteComponent() {
    const [image, setImage] = useState<string | null>(null);
    const [colors, setColors] = useState<string[]>([]);
    const [fullPalette, setFullPalette] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    const extractColors = useCallback(
        (src: string) => {
            if (loading) return;

            setLoading(true);
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = src;

            img.onload = () => {
                try {
                    const colorThief = new ColorThief();
                    const palette = colorThief.getPalette(img, 10) as [
                        number,
                        number,
                        number,
                    ][];
                    const hexColors = palette.map(
                        ([r, g, b]) =>
                            `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`,
                    );
                    setFullPalette(hexColors);
                    setColors(hexColors.slice(0, 6));
                } catch (err) {
                    console.error("Failed to extract palette:", err);
                    setFullPalette([]);
                    setColors([]);
                } finally {
                    setLoading(false);
                }
            };

            img.onerror = () => {
                console.error("Image failed to load.");
                setLoading(false);
            };
        },
        [loading],
    );

    const handleFileSelect = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setImage(result);
            extractColors(result);
        };
        reader.readAsDataURL(file);
    };

    const addNewColor = () => {
        if (colors.length < fullPalette.length) {
            setColors((prev) => [...prev, fullPalette[prev.length]]);
        }
    };

    const convertedColor = useMemo(() => {
        if (!isModalOpen || !selectedColor) return null;
        if (!/^#[0-9A-Fa-f]{6}$/.test(selectedColor)) return null;

        return convertHexColorCode(selectedColor);
    }, [isModalOpen, selectedColor]);

    const textColor =
        getLuminosity(selectedColor || "") > 0.5 ? "black" : "white";

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                exportMenuRef.current &&
                !exportMenuRef.current.contains(event.target as Node)
            ) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const exportPalette = (format: ExportFormat) => {
        let content = "";
        let filename = "";
        let mimeType = "text/plain";

        switch (format) {
            case "json":
                content = JSON.stringify({ colors }, null, 2);
                filename = "palette.json";
                mimeType = "application/json";
                break;

            case "css":
                content = `:root {
${colors.map((color, i) => `  --color-${i + 1}: ${color};`).join("\n")}
}`;
                filename = "palette.css";
                mimeType = "text/css";
                break;

            case "scss":
                content = colors
                    .map((color, i) => `$color-${i + 1}: ${color};`)
                    .join("\n");
                filename = "palette.scss";
                mimeType = "text/plain";
                break;

            case "tailwind":
                const tailwindColors = colors.reduce(
                    (acc, color, i) => {
                        acc[`palette-${i + 1}`] = color;
                        return acc;
                    },
                    {} as Record<string, string>,
                );
                content = `// Add to your tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(tailwindColors, null, 8)}
    }
  }
}`;
                filename = "tailwind-colors.js";
                mimeType = "text/javascript";
                break;

            case "array":
                content = `const palette = ${JSON.stringify(colors, null, 2)};`;
                filename = "palette.js";
                mimeType = "text/javascript";
                break;
        }

        // Create and download the file
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    const copyAllColors = () => {
        navigator.clipboard.writeText(colors.join(", "));
        setShowExportMenu(false);
    };

    return (
        <>
            <Modal
                isOpen={isModalOpen && !!selectedColor}
                onClose={() => setIsModalOpen(false)}
                title="Color Details"
            >
                <Tooltip id="tooltip" />

                <div className="space-y-3">
                    {convertedColor &&
                        Object.entries(convertedColor).map(([key, value]) => (
                            <div
                                key={key}
                                className="w-full h-14 rounded-lg flex items-center justify-between px-5 uppercase font-medium cursor-pointer hover:scale-[1.02] transition-transform"
                                style={{ backgroundColor: selectedColor!, color: textColor }}
                                data-tooltip-id="tooltip"
                                data-tooltip-content="Click to copy"
                                onClick={() => {
                                    navigator.clipboard.writeText(value);
                                }}
                            >
                                <p className="font-semibold">{key}</p>
                                <p className="font-mono">{value}</p>
                            </div>
                        ))}
                </div>
            </Modal>
            <ContentLayout title="Image Palette Generator">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Upload Section */}
                    <div className="w-full lg:w-[60%]">
                        {!image ? (
                            <FileDropZone
                                onFileSelect={handleFileSelect}
                                accept={{ "image/*": [] }}
                                loading={loading}
                                height="h-[600px]"
                            />
                        ) : (
                            <div className="w-full border-2 border-dashed border-gray-300 h-[600px] rounded-xl flex items-center justify-center relative overflow-hidden">
                                <button
                                    onClick={() => {
                                        setImage(null);
                                        setColors([]);
                                        setFullPalette([]);
                                    }}
                                    className="absolute top-4 right-4 size-9 flex items-center justify-center bg-white hover:bg-red-50 text-red-600 transition-colors rounded-lg shadow-md z-10"
                                >
                                    <X size={20} />
                                </button>
                                {loading ? (
                                    <LoadingSpinner
                                        size="lg"
                                        message="Extracting colors..."
                                        submessage="Please wait"
                                    />
                                ) : (
                                    <img
                                        src={image}
                                        alt="Uploaded Preview"
                                        className="max-h-full max-w-full object-contain rounded-xl"
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Palette Section */}
                    <div className="w-full lg:w-[40%]">
                        <div className="flex flex-col gap-y-4 h-full">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        Color Palette
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {colors.length > 0
                                            ? `${colors.length} colors extracted`
                                            : "Upload an image to get started"}
                                    </p>
                                </div>
                                {colors.length > 0 && (
                                    <div className="flex gap-x-px relative" ref={exportMenuRef}>
                                        <button
                                            className="bg-black text-white px-4 py-2.5 rounded-l-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors font-medium text-sm"
                                            disabled={colors.length === 0}
                                            onClick={copyAllColors}
                                        >
                                            Copy All
                                        </button>
                                        <button
                                            className="bg-black text-white px-2.5 py-2.5 rounded-r-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                                            disabled={colors.length === 0}
                                            onClick={() => setShowExportMenu(!showExportMenu)}
                                        >
                                            <ChevronDown size={18} />
                                        </button>

                                        {/* Export Menu Dropdown */}
                                        <AnimatePresence>
                                            {showExportMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20"
                                                >
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => exportPalette("json")}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                                        >
                                                            Export as JSON
                                                        </button>
                                                        <button
                                                            onClick={() => exportPalette("css")}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                                        >
                                                            Export as CSS
                                                        </button>
                                                        <button
                                                            onClick={() => exportPalette("scss")}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                                        >
                                                            Export as SCSS
                                                        </button>
                                                        <button
                                                            onClick={() => exportPalette("tailwind")}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                                        >
                                                            Export for Tailwind
                                                        </button>
                                                        <button
                                                            onClick={() => exportPalette("array")}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                                        >
                                                            Export as Array
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-y-3 flex-1">
                                {colors.length === 0 && !loading && (
                                    <EmptyState
                                        icon={<PlusIcon size={32} className="opacity-50" />}
                                        title="No colors yet"
                                        description="Upload an image to extract its color palette"
                                        className="border-2 border-dashed border-gray-300 rounded-xl h-[545px]"
                                    />
                                )}

                                <AnimatePresence>
                                    {colors.map((color, index) => (
                                        <motion.div
                                            key={color}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ColorCard
                                                color={color}
                                                showCopyButton={false}
                                                onClick={() => {
                                                    setIsModalOpen(true);
                                                    setSelectedColor(color);
                                                }}
                                                className="cursor-pointer hover:border-black hover:shadow-md transition-all h-16"
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {!!image && colors.length > 0 && (
                                    <button
                                        className="text-sm bg-gray-100 hover:bg-gray-200 transition-colors w-full py-3 rounded-lg flex items-center justify-center gap-x-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-medium border border-gray-200"
                                        onClick={addNewColor}
                                        disabled={
                                            colors.length >= fullPalette.length || loading || !image
                                        }
                                    >
                                        <PlusIcon size={18} />
                                        {colors.length >= fullPalette.length
                                            ? "All colors extracted"
                                            : "Add Another Color"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ContentLayout>
        </>
    );
}
