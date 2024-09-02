import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { CheckIcon } from "@heroicons/react/16/solid";

interface ModelSelectorProps {
  loading: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const models = [
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-4 Turbo", value: "gpt-4-1106-preview" },
  { label: "Claude Sonnet 3.5", value: "claude-3-5-sonnet-20240620" },
  {
    label: "Bedrock Claude Sonnet 3.5",
    value: "anthropic.claude-3-5-sonnet-20240620-v1:0",
  },
];

export default function ModelSelector({
  loading,
  selectedModel,
  setSelectedModel,
}: ModelSelectorProps) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <p className="text-xs text-gray-500">Model:</p>
      <Select.Root
        name="model"
        value={selectedModel}
        onValueChange={setSelectedModel}
        disabled={loading}
      >
        <Select.Trigger className="group flex w-full max-w-xs items-center rounded-2xl border-[6px] border-gray-300 bg-white px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
          <Select.Value />
          <Select.Icon className="ml-auto">
            <ChevronDownIcon className="size-6 text-gray-300 group-focus-visible:text-gray-500 group-enabled:group-hover:text-gray-500" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden rounded-md bg-white shadow-lg">
            <Select.Viewport className="p-2">
              {models.map((model) => (
                <Select.Item
                  key={model.value}
                  value={model.value}
                  className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm data-[highlighted]:bg-gray-100 data-[highlighted]:outline-none"
                >
                  <Select.ItemText asChild>
                    <span className="inline-flex items-center gap-2 text-gray-500">
                      <div className="size-2 rounded-full bg-green-500" />
                      {model.label}
                    </span>
                  </Select.ItemText>
                  <Select.ItemIndicator className="ml-auto">
                    <CheckIcon className="size-5 text-blue-600" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
