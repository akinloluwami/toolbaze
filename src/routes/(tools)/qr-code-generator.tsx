import ContentLayout from "@/components/shared/content-layout";
import { CopyButton, DownloadButton, NumberInput } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import type { Options } from "qr-code-styling";

export const Route = createFileRoute("/(tools)/qr-code-generator")({
  component: RouteComponent,
});

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
const ERROR_LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

function RouteComponent() {
  const [value, setValue] = useState("https://toolbaze.com");
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("M");
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  const hasContent = value.trim().length > 0;

  const qrOptions = useMemo<Options>(
    () => ({
      width: size,
      height: size,
      margin,
      type: "canvas",
      data: hasContent ? value : " ",
      qrOptions: {
        errorCorrectionLevel,
      },
      dotsOptions: {
        color: foregroundColor,
        type: "rounded",
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      cornersSquareOptions: {
        color: foregroundColor,
        type: "extra-rounded",
      },
      cornersDotOptions: {
        color: foregroundColor,
        type: "dot",
      },
    }),
    [
      size,
      margin,
      hasContent,
      value,
      errorCorrectionLevel,
      foregroundColor,
      backgroundColor,
    ],
  );

  useEffect(() => {
    if (!qrContainerRef.current) return;

    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling(qrOptions);
    }

    qrContainerRef.current.innerHTML = "";
    qrCodeRef.current.append(qrContainerRef.current);
    qrCodeRef.current.update(qrOptions);
  }, [qrOptions]);

  const downloadQrCode = () => {
    if (!qrCodeRef.current || !hasContent) return;
    qrCodeRef.current.download({ name: "qr-code", extension: "png" });
  };

  const handleReset = () => {
    setValue("https://toolbaze.com");
    setSize(320);
    setMargin(2);
    setForegroundColor("#000000");
    setBackgroundColor("#ffffff");
    setErrorCorrectionLevel("M");
  };

  return (
    <ContentLayout title="QR Code Generator">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-gray-200 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600">Content</label>
              <Textarea
                className="mt-2 min-h-28 resize-none"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Enter text or URL"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <NumberInput
                label="Size (px)"
                value={size}
                onChange={(event) =>
                  setSize(Math.min(1024, Math.max(128, parseInt(event.target.value) || 128)))
                }
                min={128}
                max={1024}
              />
              <NumberInput
                label="Margin"
                value={margin}
                onChange={(event) =>
                  setMargin(Math.min(20, Math.max(0, parseInt(event.target.value) || 0)))
                }
                min={0}
                max={20}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Error correction</p>
              <div className="grid grid-cols-4 gap-2">
                {ERROR_LEVELS.map((level) => (
                  <Button
                    key={level}
                    onClick={() => setErrorCorrectionLevel(level)}
                    className={
                      errorCorrectionLevel === level
                        ? ""
                        : "!bg-white !text-black border border-black hover:!bg-black/5"
                    }
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-gray-600">
                Foreground
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(event) => setForegroundColor(event.target.value)}
                  className="mt-2 w-full h-11 border border-gray-200 rounded-lg p-1 cursor-pointer"
                />
              </label>
              <label className="text-sm font-medium text-gray-600">
                Background
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                  className="mt-2 w-full h-11 border border-gray-200 rounded-lg p-1 cursor-pointer"
                />
              </label>
            </div>

            <Button
              onClick={handleReset}
              className="!bg-white !text-black border border-black hover:!bg-black/5 w-full"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="p-8 rounded-2xl border border-gray-200 min-h-[520px] flex flex-col items-center justify-center text-center gap-6">
            {hasContent ? (
              <>
                <div
                  ref={qrContainerRef}
                  className="w-full max-w-[360px] rounded-xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center p-4"
                />
                <div className="flex flex-wrap gap-3 justify-center">
                  <DownloadButton onClick={downloadQrCode} disabled={!hasContent}>
                    Download PNG
                  </DownloadButton>
                  <CopyButton textToCopy={value} showLabel />
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">
                Enter content to generate your QR code.
              </p>
            )}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
