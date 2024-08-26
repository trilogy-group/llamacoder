import { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ArrowUpOnSquareIcon } from "@heroicons/react/20/solid";
import LoadingDots from "./loading-dots";
import { toast } from "sonner";

interface PublishButtonProps {
  loading: boolean;
  generatedCode: string;
  onPublish: (url: string) => void;
}

async function publishApp(generatedCode: string) {
  try {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ generatedCode }),
    });
    const data = await response.json();
    if (data.success) {
      return data.url;
    } else {
      throw new Error("Failed to publish app");
    }
  } catch (error) {
    console.error("Error publishing app:", error);
    throw error;
  }
}

export default function PublishButton({
  loading,
  generatedCode,
  onPublish,
}: PublishButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const liveUrl = await publishApp(generatedCode);
      toast.success(`Your app has been published! Live URL: ${liveUrl}`);
      navigator.clipboard.writeText(liveUrl);
      onPublish(liveUrl);
    } catch (error) {
      console.error("Error publishing app:", error);
      toast.error("An error occurred while publishing the app");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>
          <button
            disabled={loading || isPublishing}
            onClick={handlePublish}
            className="inline-flex h-12 px-4 items-center justify-center gap-2 rounded-full bg-blue-500 transition disabled:grayscale"
          >
            <span className="relative">
              {isPublishing && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <LoadingDots color="white" style="small" />
                </span>
              )}
              <ArrowUpOnSquareIcon
                className={`${isPublishing ? "invisible" : ""} h-5 w-5 text-white`}
              />
            </span>
            <p className="text-base font-medium text-white">Publish app</p>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="select-none rounded bg-white px-4 py-2.5 text-sm leading-none shadow-md shadow-black/20"
            sideOffset={5}
          >
            Publishes your app to the internet
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}