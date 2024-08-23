import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { saveAs } from "file-saver";

interface CodeDownloaderProps {
  loading: boolean;
  generatedCode: string;
}

const CodeDownloader: React.FC<CodeDownloaderProps> = ({
  loading,
  generatedCode,
}) => {
  function downloadCode() {
    const blob = new Blob([generatedCode], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "generatedComponent.tsx");
  }

  return (
    <button
      onClick={downloadCode}
      disabled={loading}
      className="inline-flex h-[40px] items-center justify-center gap-2 rounded-2xl bg-green-500 transition disabled:grayscale"
      style={{ width: "120px" }}
    >
      <span className="relative">
        <ArrowDownIcon className="size-5 text-xl text-white" />
      </span>
      <p className="font-small text-lg text-white">Code</p>
    </button>
  );
};

export default CodeDownloader;
