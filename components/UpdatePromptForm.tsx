import { ArrowLongRightIcon } from "@heroicons/react/20/solid";
import LoadingDots from "./loading-dots";
import React, { FormEvent, useState } from "react";
import Image from "next/image";

interface UpdateAndPublishSectionProps {
  loading: boolean;
  onUpdate: (e: FormEvent<HTMLFormElement>, images: File[]) => void;
}

const UpdatePromptForm: React.FC<UpdateAndPublishSectionProps> = ({
  loading,
  onUpdate,
}) => {
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdate(e, images);
  };

  return (
    <div className="mt-5">
      <form onSubmit={handleSubmit}>
        <fieldset disabled={loading} className="group w-full">
          <div className="relative">
            <div className="relative flex rounded-3xl bg-white shadow-sm group-disabled:bg-gray-50">
              <textarea
                required
                name="prompt"
                className="w-full rounded-3xl bg-transparent px-6 py-5 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed"
                placeholder="Make changes to your app here"
                rows={2}
                style={{ resize: "none" }}
              />
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
                {loading ? (
                  <LoadingDots color="white" style="large" />
                ) : (
                  <ArrowLongRightIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default UpdatePromptForm;
