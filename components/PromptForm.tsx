import { FormEvent } from "react";
import { ArrowLongRightIcon } from "@heroicons/react/20/solid";
import LoadingDots from "./loading-dots";

interface PromptFormProps {
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  status: string;
  placeholder?: string;
}

export default function PromptForm({
  loading,
  onSubmit,
  status,
  placeholder = "Build me a calculator app...",
}: PromptFormProps) {
  return (
    <form className="w-full max-w-xl" onSubmit={onSubmit}>
      <fieldset disabled={loading} className="disabled:opacity-75">
        <div className="relative mt-5">
          <div className="absolute -inset-2 rounded-[32px] bg-gray-300/50" />
          <div className="relative flex rounded-3xl bg-white shadow-sm">
            <div className="relative flex flex-grow items-stretch focus-within:z-10">
              <textarea
                required
                name="prompt"
                className="w-full rounded-3xl bg-transparent px-6 py-5 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                placeholder={placeholder}
                rows={4}
                style={{ height: "150px", overflowY: "auto" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    (e.currentTarget.form as HTMLFormElement).requestSubmit();
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:bg-gray-300"
            >
              {status === "creating" ? (
                <LoadingDots color="white" style="large" />
              ) : (
                <ArrowLongRightIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
