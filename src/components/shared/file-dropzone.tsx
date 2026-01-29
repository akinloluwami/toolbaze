import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2Icon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildMimeMatcher } from "@/utils/build-mimetype-matcher";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  loading?: boolean;
  preview?: string | null;
  onRemove?: () => void;
  className?: string;
  previewComponent?: React.ReactNode;
  height?: string;
  showRemoveButton?: boolean;
  disabled?: boolean;
  multiple?: boolean;
}

export const FileDropZone = ({
  onFileSelect,
  accept = { "image/*": [] },
  maxSize = 200 * 1024 * 1024, // 200MB default
  loading = false,
  preview = null,
  onRemove,
  className = "",
  previewComponent,
  height = "h-[500px]",
  showRemoveButton = true,
  disabled = false,
  multiple = false,
}: FileDropZoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > maxSize) {
        alert(
          `File is too large. Please select a file smaller than ${formatFileSize(maxSize)}.`,
        );
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect, maxSize],
  );

  useEffect(() => {

    const isSupportedMime = buildMimeMatcher(accept);

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items

      if (!items) return;

      // Find the first image file in the clipboard
      for (const item of items) {
        if (isSupportedMime(item.type)) {
          const file = item.getAsFile();
          if (file) {
            if (file.size > maxSize) {
              alert(
                `File is too large. Please select a file smaller than ${formatFileSize(maxSize)}.`,
              );
              return;
            }
            onFileSelect(file);
            break;
          }
        }
      }

    };

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [onFileSelect, accept, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    disabled: disabled || loading,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " MB";
    else return (bytes / 1048576).toFixed(0) + " MB";
  };

  const acceptedFormats = Object.keys(accept)
    .map((key) => key.split("/")[1]?.toUpperCase() || key)
    .join(", ");


  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer transition-all relative",
        height,
        isDragActive && "border-black bg-gray-50",
        !preview && !loading && "hover:border-black hover:bg-gray-50/50",
        disabled && "opacity-50 cursor-not-allowed",
        preview && "border-solid",
        className,
      )}
    >
      <input {...getInputProps()} />

      {/* Remove button */}
      {showRemoveButton && preview && onRemove && !loading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-4 right-4 size-9 flex items-center justify-center bg-white hover:bg-red-50 text-red-600 transition-colors rounded-lg shadow-md z-10"
        >
          <X size={20} />
        </button>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center">
          <Loader2Icon className="animate-spin text-black mb-4" size={48} />
          <p className="text-black font-semibold text-lg">Loading...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      )}

      {/* Preview state */}
      {!loading && preview && !previewComponent && (
        <img
          src={preview}
          alt="Preview"
          className="max-h-full max-w-full object-contain rounded-xl"
        />
      )}

      {/* Custom preview component */}
      {!loading && preview && previewComponent && previewComponent}

      {/* Empty state */}
      {!loading && !preview && (
        <div className="text-center px-6">
          <div className="bg-black p-5 rounded-full mb-6 inline-flex">
            <Upload className="text-white" size={32} />
          </div>
          <p className="font-semibold text-gray-900 text-lg mb-2">
            {isDragActive
              ? "Drop file here"
              : "Click to upload or drag and drop"}
          </p>
          <p className="text-sm text-gray-500">
            {acceptedFormats} (max {formatFileSize(maxSize)})
          </p>
        </div>
      )}
    </div>
  );
};
