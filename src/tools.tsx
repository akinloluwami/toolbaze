import type { IconProps } from "node_modules/solar-icon-set/dist/types";
import type { ReactNode } from "react";
import * as SolarIconSet from "solar-icon-set";

type ToolCategory = "image" | "video" | "text" | "utility" | "dev";
export interface Tool {
  icon: React.ComponentType<IconProps> | ReactNode;
  title: ReactNode | string;
  route: string;
  category: ToolCategory;
  wip?: boolean;
}

export default [
  {
    icon: SolarIconSet.PaletteRound,
    title: "Image Palette Generator",
    route: "/image-palette-generator",
    category: "image",
  },
  {
    icon: SolarIconSet.GalleryDownload,
    title: "Image Compressor",
    route: "/image-compressor",
    category: "image",
  },
  {
    title: "Video Trimmer",
    route: "/video-trimmer",
    icon: SolarIconSet.VideoFrameCut2,
    wip: true,
    category: "video",
  },
  {
    title: "Lorem Ipsum Generator",
    route: "/lorem-ipsum",
    icon: SolarIconSet.TextField,
    category: "video",
  },
  {
    title: "Word Counter",
    route: "/word-counter",
    icon: SolarIconSet.Document,
    category: "text",
  },
  {
    title: "Text Case Converter",
    route: "/text-case-converter",
    icon: SolarIconSet.TextBold,
    category: "text",
  },
  {
    title: "Image Cropper",
    route: "/image-cropper",
    icon: SolarIconSet.Crop,
    category: "image",
  },
  {
    title: "Color Picker",
    route: "/color-picker",
    icon: SolarIconSet.Pallete2,
    category: "image",
  },
  {
    title: "Text Difference Checker",
    route: "/diff-checker",
    icon: SolarIconSet.TextFieldFocus,
    category: "text",
  },
  {
    title: "UUID Generator",
    route: "/uuid-generator",
    icon: SolarIconSet.Hashtag,
    category: "dev",
  },
  {
    title: "Unit Converter",
    route: "/unit-converter",
    icon: SolarIconSet.RefreshCircle,
    category: "utility",
  },
  {
    title: "Color Code Converter",
    route: "/color-code-converter",
    icon: SolarIconSet.Hashtag,
    category: "image"
  }
] satisfies Tool[];
