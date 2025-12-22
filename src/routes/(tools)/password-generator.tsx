import ContentLayout from "@/components/shared/content-layout";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { RefreshCw, Trash2, Shield, AlertCircle } from "lucide-react";
import { CopyButton, RangeSlider, NumberInput } from "@/components/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(tools)/password-generator")({
  component: RouteComponent,
});

interface IPasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

interface IPasswordHistoryItem {
  id: string;
  password: string;
  strength: number;
  timestamp: Date;
}

type PasswordStrength = "weak" | "fair" | "good" | "strong" | "excellent";

const localStorageKey = "passwordHistory";

function RouteComponent() {
  const [password, setPassword] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordHistory, setPasswordHistory] = useState<
    IPasswordHistoryItem[]
  >(() => {
    // Initialize from localStorage
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((item: IPasswordHistoryItem) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.error("Failed to load password history:", error);
    }
    return [];
  });
  const [options, setOptions] = useState<IPasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  });

  const charSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    ambiguous: "il1Lo0O",
  };

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;

    // Length contribution (max 40 points)
    strength += Math.min(pwd.length * 2, 40);

    // Character variety (max 40 points)
    if (/[a-z]/.test(pwd)) strength += 10;
    if (/[A-Z]/.test(pwd)) strength += 10;
    if (/[0-9]/.test(pwd)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;

    // Pattern penalties
    if (/(.)\1{2,}/.test(pwd)) strength -= 10; // Repeated characters
    if (/(?:abc|bcd|cde|123|234|345|678|789)/i.test(pwd)) strength -= 10; // Sequential

    // Bonus for length > 16
    if (pwd.length >= 16) strength += 10;
    if (pwd.length >= 20) strength += 10;

    return Math.max(0, Math.min(100, strength));
  };

  const getStrengthLabel = (strength: number): PasswordStrength => {
    if (strength < 20) return "weak";
    if (strength < 40) return "fair";
    if (strength < 60) return "good";
    if (strength < 80) return "strong";
    return "excellent";
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 20) return "bg-red-500";
    if (strength < 40) return "bg-orange-500";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const generatePassword = (): string => {
    let charset = "";
    if (options.includeUppercase) charset += charSets.uppercase;
    if (options.includeLowercase) charset += charSets.lowercase;
    if (options.includeNumbers) charset += charSets.numbers;
    if (options.includeSymbols) charset += charSets.symbols;

    // Remove ambiguous characters if needed
    if (options.excludeAmbiguous && charset) {
      charset = charset
        .split("")
        .filter((char) => !charSets.ambiguous.includes(char))
        .join("");
    }

    if (!charset) {
      return "Please select at least one character type";
    }

    let generatedPassword = "";
    const cryptoArray = new Uint32Array(options.length);
    window.crypto.getRandomValues(cryptoArray);

    for (let i = 0; i < options.length; i++) {
      generatedPassword += charset[cryptoArray[i] % charset.length];
    }

    return generatedPassword;
  };

  const handleGeneratePassword = (addToHistory = false) => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);

    // Add to history only when explicitly requested
    if (
      addToHistory &&
      newPassword &&
      newPassword.length > 0 &&
      !newPassword.includes("Please select")
    ) {
      const historyItem: IPasswordHistoryItem = {
        id: Date.now().toString(),
        password: newPassword,
        strength,
        timestamp: new Date(),
      };
      setPasswordHistory((prev) => [historyItem, ...prev.slice(0, 9)]);
    }
  };

  const clearHistory = () => {
    setPasswordHistory([]);
    try {
      localStorage.removeItem(localStorageKey);
    } catch (error) {
      console.error(
        "Failed to clear password history from localStorage:",
        error
      );
    }
  };

  const loadFromHistory = (historyItem: IPasswordHistoryItem) => {
    setPassword(historyItem.password);
    setPasswordStrength(historyItem.strength);
  };

  // Save password history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(passwordHistory));
    } catch (error) {
      console.error("Failed to save password history:", error);
    }
  }, [passwordHistory]);

  // Generate initial password on mount (without adding to history)
  useEffect(() => {
    const initialPassword = generatePassword();
    setPassword(initialPassword);
    setPasswordStrength(calculatePasswordStrength(initialPassword));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const strengthLabel = getStrengthLabel(passwordStrength);
  const strengthColor = getStrengthColor(passwordStrength);

  const atLeastOneOptionSelected =
    options.includeUppercase ||
    options.includeLowercase ||
    options.includeNumbers ||
    options.includeSymbols;

  return (
    <ContentLayout title="Password Generator">
      <div className="space-y-6">
        {/* Generated Password Display */}
        <div className="border-2 border-black rounded-xl overflow-hidden bg-white">
          <div className="bg-black text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={20} />
                <p className="font-semibold">Generated Password</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider">
                  {strengthLabel}
                </span>
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    strengthColor.replace("bg-", "bg-")
                  )}
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-lg break-all">
                {password || "Click generate to create a password"}
              </div>
              <CopyButton
                textToCopy={password}
                disabled={!password}
                size="lg"
                className="shrink-0"
              />
            </div>

            {/* Strength Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Password Strength</span>
                <span className="font-bold">{passwordStrength}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    strengthColor
                  )}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Weak</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Strong</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Password Options */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <RefreshCw size={18} />
              Customization Options
            </h3>

            <div className="space-y-6">
              {/* Length Slider */}
              <div>
                <RangeSlider
                  label="Password Length"
                  value={options.length}
                  onChange={(value) =>
                    setOptions((prev) => ({ ...prev, length: value }))
                  }
                  min={4}
                  max={64}
                  step={1}
                  showValue={true}
                  valueUnit=""
                  className="mb-2"
                />
              </div>

              {/* Character Type Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Character Types
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={options.includeUppercase}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeUppercase: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Uppercase (A-Z)</span>
                      <p className="text-xs text-gray-500">
                        Include capital letters
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={options.includeLowercase}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeLowercase: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Lowercase (a-z)</span>
                      <p className="text-xs text-gray-500">
                        Include lowercase letters
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={options.includeNumbers}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeNumbers: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Numbers (0-9)</span>
                      <p className="text-xs text-gray-500">
                        Include numeric digits
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={options.includeSymbols}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeSymbols: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Symbols (!@#$%)</span>
                      <p className="text-xs text-gray-500">
                        Include special characters
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  Advanced Options
                </p>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        excludeAmbiguous: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-medium">Exclude Ambiguous</span>
                    <p className="text-xs text-gray-500">
                      Avoid similar characters (i, l, 1, L, o, 0, O)
                    </p>
                  </div>
                </label>
              </div>

              {/* Warning if no options selected */}
              {!atLeastOneOptionSelected && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle size={16} className="text-orange-600 mt-0.5" />
                  <p className="text-xs text-orange-800">
                    Please select at least one character type to generate a
                    password.
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={() => handleGeneratePassword(true)}
                disabled={!atLeastOneOptionSelected}
                className="w-full flex items-center justify-center gap-2 py-6 text-lg"
              >
                <RefreshCw size={20} />
                Generate New Password
              </Button>
            </div>
          </div>

          {/* Password History */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Password History
              </h3>
              {passwordHistory.length > 0 && (
                <Button
                  onClick={clearHistory}
                  className="flex items-center gap-2 text-sm py-1 px-3 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 size={14} />
                  Clear
                </Button>
              )}
            </div>

            {passwordHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield size={48} className="text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">
                  Your generated passwords will appear here
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Last 10 passwords are saved
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {passwordHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group border border-gray-200 rounded-lg p-3 hover:border-black transition-all cursor-pointer"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">
                          {item.password}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <CopyButton
                        textToCopy={item.password}
                        variant="icon"
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            getStrengthColor(item.strength)
                          )}
                          style={{ width: `${item.strength}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        {getStrengthLabel(item.strength)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Tips */}
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            Password Security Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>
                Use a minimum of 12-16 characters for strong passwords
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>Enable all character types for maximum security</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>Use unique passwords for different accounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>
                Consider using a password manager to store your passwords
                securely
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>
                Change passwords regularly, especially for sensitive accounts
              </span>
            </li>
          </ul>
        </div>
      </div>
    </ContentLayout>
  );
}
