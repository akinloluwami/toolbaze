import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';

import ContentLayout from '@/components/shared/content-layout'
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/shared";

export const Route = createFileRoute('/(tools)/color-code-converter')({
  component: RouteComponent,
})


interface ColorValue {
  r: number;
  g: number;
  b: number;
  a?: number;
}

interface ColorConversion {
  name: string;
  toBase: (input: string) => ColorValue | null;
  fromBase: (color: ColorValue) => string;
  placeholder?: string;
}


// 'toBase' will convert to the base format will connects all colors {r,g,b,a}
// 'fromBase' will convert from the base({r,g,b,a}) to any color format
const colorFormats: Record<string, ColorConversion> = {
  hex: {
    name: "HEX",
    placeholder: "Enter HEX Code (E.g.#FFFFFF or #666666)",
    toBase: (input) => {
      const hex = input.replace('#', '').trim();
      if (hex.length !== 6 && hex.length !== 8) return null;
      
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const a = hex.length === 8 ? Math.round((parseInt(hex.substring(6, 8), 16) / 255) * 100) / 100 : 1;
      
      return { r, g, b, a };
    },
    fromBase: (color) => {
      const toHex = (n: number) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
      if (color.a !== undefined && color.a < 1) {
        return `${hex}${toHex(color.a * 255)}`;
      }
      return hex;
    }
  },
  
  rgb: {
    name: "RGB/RGBA",
    placeholder: "Enter Value (E.g rgb(255, 100, 100) or rgba(255, 100, 100, 0.5))",
    toBase: (input) => {
      const cleaned = input.replace(/\s+/g, '').toLowerCase();
      const match = cleaned.match(/^rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)$/);
      
      if (!match) return null;
      
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const a = match[4] ? Math.round(parseFloat(match[4]) * 100) / 100 : 1;
      
      if (r > 255 || g > 255 || b > 255 || a > 1) return null;
      
      return { r, g, b, a };
    },
    fromBase: (color) => {
      if (color.a !== undefined && color.a < 1) {
        const alphaRounded = Math.round(color.a * 100) / 100;
        return `RGBA(${color.r}, ${color.g}, ${color.b}, ${alphaRounded})`;
      }
      return `RGB(${color.r}, ${color.g}, ${color.b})`;
    }
  },
  hsl: {
    name: "HSL/HSLA",
    placeholder: "Enter Value (E.g hsl(120, 100%, 50%) or hsla(120, 100%, 50%, 0.5))",
    toBase: (input) => {
      const cleaned = input.replace(/\s+/g, '').toLowerCase();
      const match = cleaned.match(/^hsla?\((\d+),(\d+)%,(\d+)%(?:,([\d.]+))?\)$/);
      
      if (!match) return null;
      
      const h = parseInt(match[1]) / 360;
      const s = parseInt(match[2]) / 100;
      const l = parseInt(match[3]) / 100;
      const a = match[4] ? Math.round(parseFloat(match[4]) * 100) / 100 : 1;
      
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a
      };
    },
    fromBase: (color) => {
      const r = color.r / 255;
      const g = color.g / 255;
      const b = color.b / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      const hDeg = Math.round(h * 360);
      const sPercent = Math.round(s * 100);
      const lPercent = Math.round(l * 100);
      
      if (color.a !== undefined && color.a < 1) {
        const alphaRounded = Math.round(color.a * 100) / 100;
        return `HSLA(${hDeg}, ${sPercent}%, ${lPercent}%, ${alphaRounded})`;
      }
      return `HSL(${hDeg}, ${sPercent}%, ${lPercent}%)`;
    }
  }
};


function RouteComponent() {
  const [fromFormat, setFromFormat] = useState<string>(Object.keys(colorFormats)[0])
  const [inputValue, setInputValue] = useState("")
  const [results, setResults] = useState<Record<string, string>>({});


   const handleConvert = (value: string, from: string) => {

    if (!value) {
      setResults({})
      return;
    }
  
    const baseValue = colorFormats[from].toBase(value)

     if (!baseValue) {
    setResults({});
    return;
  }

    const converted: Record<string, string> = {};

    Object.keys(colorFormats).forEach((key) => {
      if (key !== from) {
        converted[key] = colorFormats[key].fromBase(baseValue);
      }
    });

    setResults(converted);
  };

  const handleFromFormatChange = (format: string) => {
    setFromFormat(format);
    setInputValue("")
    setResults({})
  };

   const handleInputChange = (value: string) => {
    setInputValue(value);
    handleConvert(value, fromFormat);
  };

  return  <ContentLayout title="Color Code Converter">

     <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">From:</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={colorFormats[fromFormat].placeholder}
                    className="flex-1 text-base sm:text-lg py-4 sm:py-6"
                  />
                    <select
                value={fromFormat}
                onChange={(e) => handleFromFormatChange(e.target.value)}
                className="px-4 py-3 sm:py-2 border-2 border-gray-300 rounded-lg text-sm sm:text-base font-medium focus:outline-none focus:border-black w-full sm:w-auto"
              >
                {Object.entries(colorFormats).map(([key, unit]) => (
                  <option key={key} value={key}>
                    {unit.name}
                  </option>
                ))}
              </select>
                  </div>



                  </div>


                   {/* Results Section */}
          {Object.keys(results).length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-base sm:text-lg font-semibold">
                Converted Values:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(results).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-medium text-gray-700 text-sm sm:text-base truncate">
                        {colorFormats[key].name}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-black break-all text-right">
                        {value}
                      </span>
                      <CopyButton textToCopy={value as string} variant="icon" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {!inputValue && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-base sm:text-lg px-4">
                Enter a value above to convert between different color formats.
              </p>
            </div>
          )}

                  </div>
                  
  </ContentLayout>
}
