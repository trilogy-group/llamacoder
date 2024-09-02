import { Dispatch, SetStateAction } from "react";

interface FileUploaderProps {
  setSelectedFiles: Dispatch<SetStateAction<File[]>>;
}

export default function FileUploader({
  setSelectedFiles,
}: FileUploaderProps) {
  return (
    <div className="mb-4 w-full max-w-sm">
      <div className="relative">
        <div className="absolute -inset-2 rounded-[32px] bg-gray-300/50" />
        <div className="relative flex rounded-3xl bg-white shadow-sm">
          <input
            type="file"
            multiple
            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            className="w-full rounded-3xl bg-transparent px-4 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blue-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
