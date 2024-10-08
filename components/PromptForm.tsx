import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLongRightIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { PhotoIcon } from "@heroicons/react/24/outline";
import LoadingDots from "./loading-dots";
import Image from "next/image";
import FileUploader from "./FileUploader";

interface PromptFormProps {
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>, images: File[], files: File[]) => void;
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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages((prevImages) => [...prevImages, ...Array.from(e.target.files || [])]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e, images, files);
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
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex space-x-2">
                <label className="cursor-pointer" title="Upload images">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <PhotoIcon className="h-6 w-6 text-gray-500 hover:text-blue-500" />
                  <span className="sr-only">Upload images</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:bg-gray-300"
              >
                {status === "creating" ? (
                  <LoadingDots color="white" style="large" />
                ) : (
                  <ArrowLongRightIcon className="h-6 w-6" />
                )}
              </button>
            </div>
            {(images.length > 0 || files.length > 0) && (
              <div className="flex flex-wrap gap-4 px-6 py-3">
                {images.map((image, index) => (
                  <div key={`image-${index}`} className="relative">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded image ${index + 1}`}
                      width={150}
                      height={150}
                      className="rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {files.map((file, index) => (
                  <div key={`file-${index}`} className="relative flex items-center justify-center w-[150px] h-[150px] bg-gray-200 rounded-md">
                    <span className="mt-2 text-sm text-gray-700 truncate max-w-[140px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </fieldset>
    </form>
  );
}