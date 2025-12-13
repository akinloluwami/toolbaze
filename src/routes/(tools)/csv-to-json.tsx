import ContentLayout from "@/components/shared/content-layout";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
// import { CopyButton } from "@/components/shared";
import Modal from "@/components/shared/modal";
import { csvtojson } from "@/utils/convertcsvtojson";
import { FaSpinner } from "react-icons/fa";

export const Route = createFileRoute("/(tools)/csv-to-json")({
  component: RouteComponent,
});

function RouteComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [convertState, setConvertState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jsonResult, setJsonResult] = useState<object | null>(null);
  const [downloadingState, setDownloadingState] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      readFile(selectedFile);
    } else {
      setIsModalOpen(true);
      setFile(null);
    }
  };
  const handleClearFile = () => {
    setCsvContent(null);
    setFile(null);
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const readFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      console.log(content);
    };
    reader.onerror = () => {
      alert("Failed to readfile");
      setCsvContent(null);
    };
    reader.readAsText(file);
  };

  const handleConvert = async () => {
    if (csvContent !== null) {
      setConvertState(true);
      setLoading(true);
      const result = await csvtojson(csvContent);
      setJsonResult(result);
      setLoading(false);
    }
  };
  const handleDownload = () => {
    if (!jsonResult) return;
    const jsonString = JSON.stringify(jsonResult, null, 2);
    const blob = new Blob([jsonString]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name.replace(".csv", "") || "Output"}.json`;
    document.body.appendChild(link);
    link.click();
    setDownloadingState(true);
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleNew = () => {
    setFile(null);
    setCsvContent(null);
    setConvertState(false);
    setJsonResult(null);
    setDownloadingState(false);
    setLoading(false);
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Invalid File selected"
      >
        <p>Please Ensure the file you selected is a valid **.csv** file.</p>
        <button
          onClick={handleCloseModal}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </Modal>
      <ContentLayout title="CSV to JSON converter">
        {convertState ? (
          loading ? (
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
              <p className="mt-2 text-gray-600">converting...</p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 border rounded">
              <p>The conversion is complete</p>
              {jsonResult && (
                <pre className="overflow-auto max-h-40 mt-2 text-sm">
                  {JSON.stringify(jsonResult, null, 2)}
                </pre>
              )}
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white mt-4 font-bold py-2 px-6 rounded-md transition-colors duration-200"
              >
                {downloadingState ? "downloading..." : "download"}
              </button>
              <button
                onClick={handleNew}
                className="bg-blue-600 hover:bg-blue-700 ml-5 text-white mt-4 font-bold py-2 px-6 rounded-md transition-colors duration-200"
              >
                New Conversion
              </button>
            </div>
          )
        ) : (
          !jsonResult && (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
              <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                  Upload CSV
                </h2>
                {file ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      File selected:{" "}
                      <span className="font-medium">{file.name}</span>
                    </p>
                    <button
                      onClick={handleClearFile}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <label htmlFor="file-input" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                        <span className="text-blue-500 font-medium">
                          Click to Upload
                        </span>
                      </div>
                    </label>
                    <input
                      type="file"
                      id="file-input"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
                {csvContent && (
                  <div className="mt-4 p-4 bg-gray-50 border rounded">
                    <h3 className="font-semibold">CSV Content Preview</h3>
                    <pre className="overflow-auto max-h-40 mt-2 text-sm">
                      {csvContent}
                    </pre>
                    <button
                      onClick={handleConvert}
                      className="bg-blue-600 hover:bg-blue-700 text-white mt-4 font-bold py-2 px-6 rounded-md transition-colors duration-200"
                    >
                      Convert
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </ContentLayout>
    </>
  );
}
