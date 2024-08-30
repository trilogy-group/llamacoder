import React, { FormEvent } from "react";
import { ArrowLongRightIcon } from "@heroicons/react/20/solid";
import LoadingDots from "./loading-dots";

interface UpdateAndPublishSectionProps {
  loading: boolean;
  onUpdate: (e: FormEvent<HTMLFormElement>) => void;
}

const UpdatePromptForm: React.FC<UpdateAndPublishSectionProps> = ({
  loading,
  onUpdate,
}) => {
  return (
    <div className="mt-5">
      <form onSubmit={onUpdate}>
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
