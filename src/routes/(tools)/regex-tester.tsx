import ContentLayout from "@/components/shared/content-layout";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CopyButton } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/(tools)/regex-tester")({
  component: RouteComponent,
});

interface RegexPreset {
  name: string;
  pattern: string;
  description: string;
}

type RegexResult =
  | { valid: false; error: string }
  | {
      valid: true;
      matches: string[];
      count: number;
      test?: boolean;
      fullMatches?: RegExpExecArray[];
    }
  | null;

const presets: RegexPreset[] = [
  {
    name: "Email",
    pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    description: "Basic email validation",
  },
  {
    name: "Phone (US)",
    pattern: "^\\+?1?[-.]?\\(?([0-9]{3})\\)?[-.]?([0-9]{3})[-.]?([0-9]{4})$",
    description: "US phone number format",
  },
  {
    name: "URL",
    pattern:
      "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$",
    description: "HTTP/HTTPS URL",
  },
  {
    name: "Hex Color",
    pattern: "^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$",
    description: "Hex color code",
  },
  {
    name: "IPv4",
    pattern: "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$",
    description: "IPv4 address",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
    description: "ISO date format",
  },
];

function RouteComponent() {
  const [pattern, setPattern] = useState<string>("");
  const [testString, setTestString] = useState<string>("");
  const [flags, setFlags] = useState({
    g: false,
    i: false,
    m: false,
  });

  const regexResult = useMemo<RegexResult>(() => {
    if (!pattern) return null;

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join("");

      const regex = new RegExp(pattern, flagString);
      const matches = testString.match(regex);

      if (flags.g && matches) {
        // Global flag - find all matches
        const allMatches: RegExpExecArray[] = [];
        let match;
        const globalRegex = new RegExp(pattern, flagString);
        while ((match = globalRegex.exec(testString)) !== null) {
          allMatches.push(match);
          if (!flags.g) break;
        }
        return {
          valid: true,
          matches: allMatches.map((m) => m[0]),
          count: allMatches.length,
          fullMatches: allMatches,
        };
      }

      return {
        valid: true,
        matches: matches || [],
        count: matches ? matches.length : 0,
        test: regex.test(testString),
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Invalid regex",
      };
    }
  }, [pattern, testString, flags]);

  const highlightedText = useMemo(() => {
    if (!pattern || !testString || !regexResult?.valid) return testString;

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join("");

      const regex = new RegExp(pattern, flagString);
      const parts: { text: string; isMatch: boolean }[] = [];
      let lastIndex = 0;

      if (flags.g) {
        const globalRegex = new RegExp(pattern, flagString);
        let match;
        while ((match = globalRegex.exec(testString)) !== null) {
          if (match.index > lastIndex) {
            parts.push({
              text: testString.slice(lastIndex, match.index),
              isMatch: false,
            });
          }
          parts.push({ text: match[0], isMatch: true });
          lastIndex = match.index + match[0].length;
          if (!flags.g) break;
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          if (match.index > 0) {
            parts.push({
              text: testString.slice(0, match.index),
              isMatch: false,
            });
          }
          parts.push({ text: match[0], isMatch: true });
          lastIndex = match.index + match[0].length;
        }
      }

      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false });
      }

      return parts;
    } catch {
      return testString;
    }
  }, [pattern, testString, flags, regexResult]);

  const applyPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
  };

  const toggleFlag = (flag: "g" | "i" | "m") => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  return (
    <ContentLayout title="Regex Tester">
      <div className="space-y-6">
        {/* Pattern Input */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Regex Pattern</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pattern
              </label>
              <Input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter your regex pattern (e.g., \d{3}-\d{4})"
                className="font-mono w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flags
              </label>
              <div className="flex gap-4">
                {(["g", "i", "m"] as const).map((flag) => (
                  <label
                    key={flag}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={flags[flag]}
                      onChange={() => toggleFlag(flag)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">
                      <span className="font-mono font-semibold">{flag}</span> -{" "}
                      {flag === "g"
                        ? "Global"
                        : flag === "i"
                          ? "Case insensitive"
                          : "Multiline"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Test String */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Test String</h3>
          <Textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against your regex pattern..."
            rows={6}
            className="font-mono text-sm"
          />
        </div>

        {/* Results */}
        {pattern && testString && (
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Results</h3>
            {!regexResult?.valid ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">Invalid Regex</p>
                <p className="text-red-600 text-sm mt-1">
                  {regexResult?.error}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1">
                    <p className="text-blue-700 font-medium">Matches Found</p>
                    <p className="text-blue-900 text-2xl font-bold mt-1">
                      {regexResult.count}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex-1">
                    <p className="text-green-700 font-medium">Test Result</p>
                    <p className="text-green-900 text-2xl font-bold mt-1">
                      {regexResult.test || regexResult.count > 0
                        ? "Pass"
                        : "Fail"}
                    </p>
                  </div>
                </div>

                {regexResult.count > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Matched Strings:
                    </p>
                    <div className="space-y-2">
                      {regexResult.matches.map((match: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <span className="font-mono text-sm">{match}</span>
                          <CopyButton
                            textToCopy={match}
                            variant="icon"
                            showLabel={false}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Highlighted Matches:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap wrap-break-word">
                    {typeof highlightedText === "string"
                      ? highlightedText
                      : highlightedText.map((part, idx) => (
                          <span
                            key={idx}
                            className={
                              part.isMatch ? "bg-yellow-300 font-semibold" : ""
                            }
                          >
                            {part.text}
                          </span>
                        ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Common Patterns */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Common Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{preset.name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {preset.description}
                </p>
                <p className="font-mono text-xs text-gray-500 mt-2 truncate">
                  {preset.pattern}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
