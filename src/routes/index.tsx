import { Input } from "@/components/modified-ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import tools from "@/tools";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as SolarIconSet from "solar-icon-set";
import Modal from "@/components/shared/modal";
import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { SiGithub } from "react-icons/si";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const posthog = usePostHog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    setIsSubmitting(true);

    try {
      // Submit to Formspree
      const response = await fetch("https://api.formdrop.co/f/3983bb88", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "Tool name": toolName,
          "Tool description": toolDescription,
        }),
      });

      if (response.ok) {
        // Track in PostHog
        posthog?.capture("tool-request", {
          tool_name: toolName,
          tool_description: toolDescription,
          timestamp: new Date().toISOString(),
        });

        setToolName("");
        setToolDescription("");
        setIsModalOpen(false);
        setShowToast(true);
      } else {
        console.error("Failed to submit tool request");
      }
    } catch (error) {
      console.error("Error submitting tool request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-3 py-4 bg-white/60 backdrop-blur-md border-b border-purple-500/20 z-10">
        <div className="flex-1">
          <div className="flex items-center">
            <img src="./favicon.ico" />
            <p className="text-2xl font-bold text-gray-800">
              Toolbaze{" "}
              <span className="px-2 py-1 rounded-full bg-black/10 text-black/70 border border-black text-xs">
                v0.1
              </span>{" "}
            </p>
          </div>
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-gray-600 text-xs font-semibold">
              A growing collection of essential design, development, and
              everyday tools — all in one place.
            </p>
            <a
              href="https://github.com/akinloluwami/toolbaze"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog?.capture("github_click")}
              className="flex md:hidden items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-xs w-fit"
            >
              <SiGithub size={16} />
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <a
            href="https://github.com/akinloluwami/toolbaze"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => posthog?.capture("github_click")}
            className="flex items-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            <SiGithub size={18} />
            <span>Star on GitHub</span>
          </a>
        </div>
      </header>
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-6 mt-10">
          {tools.map((tool, index) =>
            tool.wip ? (
              <div
                key={index}
                className="p-6 border relative border-black/30 bg-black/5 opacity-75 cursor-not-allowed rounded-lg flex items-center lg:justify-between lg:flex-col gap-4"
              >
                <tool.icon size={40} iconStyle="LineDuotone" />
                <p className="text-gray-600 text-center font-semibold text-sm">
                  {tool.title}
                </p>
                <Badge className="absolute top-2 right-2">Coming Soon</Badge>
              </div>
            ) : (
              <Link
                key={index}
                to={tool.route}
                className="p-6 border relative border-black/30 hover:bg-black/5  hover:border-black/20 transition-colors rounded-lg flex items-center lg:justify-between lg:flex-col gap-4"
              >
                <tool.icon size={40} iconStyle="LineDuotone" />
                <p className="text-gray-600 text-center font-semibold lg:text-sm text-base">
                  {tool.title}
                </p>
              </Link>
            ),
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-6 border hover:bg-black/5 border-black/30 rounded-lg flex items-center justify-between flex-col cursor-pointer gap-4"
          >
            <SolarIconSet.WidgetAdd size={40} />
            <p className="text-gray-600 font-semibold text-sm">
              Request New Tool
            </p>
          </button>
        </div>
      </div>

      {/* Request Tool Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request a New Tool"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tool Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="e.g., JSON Formatter, Base64 Encoder..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              placeholder="Describe what this tool should do and why it would be useful..."
              className="w-full h-32 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="!bg-white !text-black border border-black hover:!bg-black/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={
                !toolName.trim() || !toolDescription.trim() || isSubmitting
              }
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Toast */}
      {showToast && (
        <Toast
          message="Thank you for your submission!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
