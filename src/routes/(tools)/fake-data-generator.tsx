import ContentLayout from "@/components/shared/content-layout";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { CopyButton, DownloadButton } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { loremIpsum } from "lorem-ipsum";

export const Route = createFileRoute("/(tools)/fake-data-generator")({
  component: RouteComponent,
});

interface Field {
  id: number;
  name: string;
  type: string;
}

function generateValue(type: string): string | number | boolean {
  switch (type) {
    case "text":
      return loremIpsum({
        count: 1,
        units: "sentences",
        sentenceLowerBound: 5,
        sentenceUpperBound: 15,
      });

    case "name":
      const names = [
        "Adebayo",
        "Chinonso",
        "Emeka",
        "Folake",
        "Ngozi",
        "Oluwaseun",
        "Chidi",
        "Amara",
        "Tunde",
        "Blessing",
        "Kehinde",
        "Adeola",
        "Chioma",
        "Ifeanyi",
        "Aisha",
        "Ibrahim",
        "Fatima",
        "Yusuf",
      ];
      return names[Math.floor(Math.random() * names.length)];

    case "number":
      return Math.floor(Math.random() * 1000);

    case "email":
      const emailNames = [
        "john",
        "jane",
        "alex",
        "sarah",
        "mike",
        "emma",
        "david",
        "lisa",
      ];
      const domains = ["example.com", "test.com", "demo.com", "sample.org"];
      return `${emailNames[Math.floor(Math.random() * emailNames.length)]}${Math.floor(Math.random() * 100)}@${domains[Math.floor(Math.random() * domains.length)]}`;

    case "phone":
      const prefixes = [70, 71, 80, 81, 90, 91];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const remaining8Digits = Math.floor(Math.random() * 90000000 + 10000000);
      return `+234${prefix}${remaining8Digits}`;

    case "date":
      const start = new Date(2020, 0, 1);
      const end = new Date();
      const date = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      return date.toISOString().split("T")[0];

    case "boolean":
      return Math.random() > 0.5;

    case "uuid":
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );

    case "url":
      const protocols = ["https://"];
      const sites = ["example.com", "test.com", "demo.org", "sample.net"];
      return `${protocols[0]}${sites[Math.floor(Math.random() * sites.length)]}`;

    case "color":
      return `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;

    default:
      return "";
  }
}

function RouteComponent() {
  const [fields, setFields] = useState<Field[]>([
    { id: 1, name: "email", type: "email" },
  ]);
  const [recordCount, setRecordCount] = useState<number>(10);
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [outputFormat, setOutputFormat] = useState<"json" | "csv">("json");
  const [nextId, setNextId] = useState(2);

  const dataTypes = [
    "text",
    "name",
    "number",
    "email",
    "phone",
    "date",
    "boolean",
    "uuid",
    "url",
    "color",
  ];

  const addField = () => {
    setFields([...fields, { id: nextId, name: "", type: "text" }]);
    setNextId(nextId + 1);
  };

  const removeField = (id: number) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const updateField = (id: number, key: "name" | "type", value: string) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const generateData = () => {
    const data = Array.from({ length: recordCount }, () => {
      const record: any = {};
      fields.forEach((field) => {
        if (field.name.trim()) {
          record[field.name] = generateValue(field.type);
        }
      });
      return record;
    });
    setGeneratedData(data);
  };

  const getOutputString = () => {
    if (generatedData.length === 0) return "";

    if (outputFormat === "json") {
      return JSON.stringify(generatedData, null, 2);
    } else {
      // CSV format
      const headers = fields.map((f) => f.name).filter((n) => n.trim());
      const rows = generatedData.map((record) =>
        headers.map((h) => JSON.stringify(record[h] ?? "")).join(",")
      );
      return [headers.join(","), ...rows].join("\n");
    }
  };

  const downloadData = () => {
    if (generatedData.length === 0) return;

    const content = getOutputString();
    const blob = new Blob([content], {
      type: outputFormat === "json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fake-data.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ContentLayout title="Fake Data Generator">
      <div className="space-y-6">
        {/* Field Configuration */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Configure Fields</h3>
            <Button onClick={addField} className="flex items-center gap-2">
              <Plus size={16} />
              Add
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg"
              >
                <Input
                  type="text"
                  placeholder="Field name (e.g., username)"
                  value={field.name}
                  onChange={(e) =>
                    updateField(field.id, "name", e.target.value)
                  }
                  className="flex-1 min-w-0"
                />
                <select
                  value={field.type}
                  onChange={(e) =>
                    updateField(field.id, "type", e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {fields.length > 1 && (
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generation Controls */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Generate Data</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-full sm:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Records
              </label>
              <Input
                type="number"
                value={recordCount}
                onChange={(e) =>
                  setRecordCount(
                    Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                  )
                }
                min={1}
                max={100}
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) =>
                  setOutputFormat(e.target.value as "json" | "csv")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <Button
              onClick={generateData}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <RefreshCw size={16} />
              Generate
            </Button>
          </div>
        </div>

        {/* Output */}
        {generatedData.length > 0 && (
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Generated Data ({generatedData.length} records)
              </h3>
              <div className="flex gap-2">
                <CopyButton textToCopy={getOutputString()} showLabel={true} />
                <DownloadButton onClick={downloadData}>Download</DownloadButton>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {getOutputString()}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
