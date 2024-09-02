import { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ArrowUpOnSquareIcon } from "@heroicons/react/20/solid";
import LoadingDots from "./loading-dots";
import { toast } from "sonner";

interface PublishButtonProps {
  loading: boolean;
  onPublish: (url: string) => void;
}

async function publishApp() {
  try {
    // Filter and prepare TypeScript and TSX files
    const artifactId = localStorage.getItem('artifactId');
    const generatedCode = localStorage.getItem('generatedCode');
    if(!generatedCode) {
      throw new Error("No generated code found");
    }
    
    const generatedCodeJson = JSON.parse(generatedCode) as { code: string, extraLibraries: string[] };

    const dependencies = Object.fromEntries(
      generatedCodeJson.extraLibraries.map((lib: any) => [lib.name, "latest"])
    );

    const artifact = {
      id: artifactId,
      code: generatedCodeJson.code,
      dependencies: dependencies,
      name: artifactId
    }

    console.log("Publishing artifact: ", artifact);

    const response = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artifact),
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
  onPublish,
}: PublishButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const liveUrl = await publishApp();
      toast.success(`Your app has been published! Live URL: ${liveUrl}`);
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
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-white shadow-md transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            <span className="font-medium">
              {isPublishing ? "Publishing..." : "Publish App"}
            </span>
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