import ContentLayout from "@/components/shared/content-layout";
import { Button } from "@/components/ui/button";
import { CopyButton, RangeSlider, NumberInput, DownloadButton } from "@/components/shared";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(tools)/password-generator")({
  component: RouteComponent,
});

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
  similar: "il1Lo0O",
};

function generatePassword(options: PasswordOptions): string {
  let charset = "";
  if (options.uppercase) charset += CHAR_SETS.uppercase;
  if (options.lowercase) charset += CHAR_SETS.lowercase;
  if (options.numbers) charset += CHAR_SETS.numbers;
  if (options.symbols) charset += CHAR_SETS.symbols;

  if (options.excludeSimilar) {
    const similarChars = CHAR_SETS.similar.split("");
    charset = charset
      .split("")
      .filter((char) => !similarChars.includes(char))
      .join("");
  }

  if (charset.length === 0) return "";

  let password = "";
  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < options.length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
}

// entropy calculation
function calculateEntropy(password: string): number {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32; // Rough estimate for symbols

  if (poolSize === 0) return 0;
  return Math.log2(Math.pow(poolSize, password.length));
}

function getStrengthLabel(entropy: number): { label: string; color: string; percent: number; textColor: string } {
  if (entropy < 28) return { label: "Very Weak", color: "bg-red-500", percent: 20, textColor: "text-red-600" };
  if (entropy < 36) return { label: "Weak", color: "bg-orange-500", percent: 40, textColor: "text-orange-600" };
  if (entropy < 60) return { label: "Good", color: "bg-yellow-500", percent: 60, textColor: "text-yellow-600" };
  if (entropy < 128) return { label: "Strong", color: "bg-green-500", percent: 80, textColor: "text-green-600" };
  return { label: "Very Strong", color: "bg-emerald-600", percent: 100, textColor: "text-emerald-700" };
}

function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="font-medium text-gray-700">{label}</span>
      <div
        className={cn(
          "w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out",
          checked ? "bg-black" : "bg-gray-300"
        )}
      >
        <div
          className={cn(
            "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
    </div>
  );
}

function RouteComponent() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  });

  const [password, setPassword] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);

  const handleGenerate = useCallback(() => {
    if (mode === "bulk") {
      const newBulk = Array.from({ length: bulkCount }, () => generatePassword(options));
      setBulkPasswords(newBulk);
    } else {
      const newPassword = generatePassword(options);
      setPassword(newPassword);
      if (newPassword && !history.includes(newPassword)) {
        setHistory((prev) => [newPassword, ...prev.slice(0, 9)]);
      }
    }
  }, [options, mode, bulkCount, history]);

  // Initial generation
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate when specific options change
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length, options.excludeSimilar, options.uppercase, options.lowercase, options.numbers, options.symbols, mode]);


  const entropy = calculateEntropy(password);
  const strength = getStrengthLabel(entropy);

  const updateOption = (key: keyof PasswordOptions, value: any) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: value };
      if (!next.uppercase && !next.lowercase && !next.numbers && !next.symbols) {
        return prev;
      }
      return next;
    });
  };

  const downloadBulk = () => {
    if (bulkPasswords.length === 0) return;
    const content = bulkPasswords.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `passwords-${bulkPasswords.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ContentLayout title="Password Generator">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-gray-200 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Configuration
              </h3>

              <div className="space-y-6">
                {/* Mode Switch */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setMode("single")}
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                      mode === "single" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setMode("bulk")}
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                      mode === "bulk" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Bulk
                  </button>
                </div>

                <RangeSlider
                  label="Password Length"
                  value={options.length}
                  onChange={(v) => updateOption("length", v)}
                  min={8}
                  max={64}
                  valueUnit=" chars"
                />

                {mode === "bulk" && (
                  <NumberInput
                    label="Quantity"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={100}
                  />
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">Character Sets</p>
                  <Switch
                    label="Uppercase (A-Z)"
                    checked={options.uppercase}
                    onCheckedChange={(v) => updateOption("uppercase", v)}
                  />
                  <Switch
                    label="Lowercase (a-z)"
                    checked={options.lowercase}
                    onCheckedChange={(v) => updateOption("lowercase", v)}
                  />
                  <Switch
                    label="Numbers (0-9)"
                    checked={options.numbers}
                    onCheckedChange={(v) => updateOption("numbers", v)}
                  />
                  <Switch
                    label="Symbols (!@#$%...)"
                    checked={options.symbols}
                    onCheckedChange={(v) => updateOption("symbols", v)}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">Restrictions</p>
                  <Switch
                    label="Exclude Similar (i, l, 1...)"
                    checked={options.excludeSimilar}
                    onCheckedChange={(v) => updateOption("excludeSimilar", v)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-3 space-y-6">
          {mode === "single" ? (
            <>
              {/* Main Result Card */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                  <div
                    className={cn("h-full transition-all duration-500", strength.color)}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>

                <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase tracking-wider">
                  {strength.label}
                </div>

                <div className="mb-8 w-full break-all">
                  <span className="text-4xl md:text-5xl font-mono font-bold text-gray-800 tracking-tight">
                    {password}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 justify-center w-full">
                  <Button
                    onClick={handleGenerate}
                    className="flex items-center gap-2"

                  >
                    <RefreshCw className="size-5" />
                    Regenerate
                  </Button>

                  <CopyButton
                    textToCopy={password}
                    variant="default"
                    showLabel={true}
                  />
                </div>
              </div>

              {/* History */}
              {history.length > 1 && (
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200/60">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Extra</h4>
                  <div className="space-y-2">
                    {history.slice(1, 6).map((histPwd, idx) => (
                      <div key={`${histPwd}-${idx}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 group hover:border-gray-300 transition-colors">
                        <span className="font-mono text-gray-600 truncate mr-4">{histPwd}</span>
                        <CopyButton
                          textToCopy={histPwd}
                          variant="icon"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Bulk Result
            <div className="bg-white p-6 rounded-2xl border border-gray-200 min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Multiple Passwords</h3>
                <div className="flex gap-2">
                  <Button onClick={handleGenerate} className="flex gap-2 items-center">
                    <RefreshCw className="w-4 h-4" />
                    Regenerate All
                  </Button>
                  <DownloadButton onClick={downloadBulk}>
                    Export .txt
                  </DownloadButton>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-2">
                {bulkPasswords.map((pwd, idx) => {
                  const s = getStrengthLabel(calculateEntropy(pwd));
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="font-mono text-gray-700 text-sm truncate">{pwd}</span>
                        <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white border", s.textColor, "border-gray-100")}>
                          {s.label}
                        </span>
                      </div>
                      <CopyButton textToCopy={pwd} variant="icon" size="sm" className="opacity-0 group-hover:opacity-100 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
