import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { saveAs } from "file-saver";

interface CodeDownloaderProps {
  loading: boolean;
}

const CodeDownloader: React.FC<CodeDownloaderProps> = ({
  loading,
}) => {
  function downloadCode() {
    const generatedCode: {code: string, extraLibraries: string[]} | null = localStorage.getItem('generatedCode') ? JSON.parse(localStorage.getItem('generatedCode') || "") : null ;
    const activeFile: string | null = localStorage.getItem('activeFile') || "";
    if (!generatedCode || !activeFile) {
      return;
    }
    const blob = new Blob([generatedCode.code], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, activeFile.slice(1, activeFile.length));
  }

  return (
    <button
      onClick={downloadCode}
      disabled={loading}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white shadow-md transition-all hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ArrowDownTrayIcon className="h-5 w-5" />
      <span className="font-medium">Download Code</span>
    </button>
  );
};

export default CodeDownloader;