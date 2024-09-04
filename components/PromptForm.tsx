import { FormEvent, useEffect, useRef } from "react";
import { ArrowLongRightIcon } from "@heroicons/react/20/solid";
import LoadingDots from "./loading-dots";
import { useState } from "react";
import Image from "next/image";

interface PromptFormProps {
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>, images: File[]) => void;
  status: string;
  placeholder?: string;
  initialPrompt?: string;
}

export default function PromptForm({
  loading,
  onSubmit,
  status,
  placeholder = "Build me a calculator app...",
  initialPrompt = "",
}: PromptFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e, images);
  };

  useEffect(() => {
    if (textareaRef.current && initialPrompt) {
      textareaRef.current.value = initialPrompt;
    }
  }, [initialPrompt]);

  return (
    <form className="w-full max-w-xl" onSubmit={handleSubmit}>
      <fieldset disabled={loading} className="disabled:opacity-75">
        <div className="relative mt-5">
          <div className="absolute -inset-2 rounded-[32px] bg-gray-300/50" />
          <div className="relative flex flex-col rounded-3xl bg-white shadow-sm">
            <div className="relative flex flex-grow items-stretch focus-within:z-10">
              <textarea
                ref={textareaRef}
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
            <div className="px-6 py-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 px-6 py-3">
                {images.map((image, index) => (
                  <Image
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded image ${index + 1}`}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                ))}
              </div>
            )}
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