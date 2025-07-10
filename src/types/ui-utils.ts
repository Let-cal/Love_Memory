// ui-utils.ts
export const getBtnLightClasses = () => {
  return [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-all duration-200 ease-out transition-transform",
    "bg-[color-mix(in_srgb,rgb(253_242_248)_50%,transparent)] text-gray-700 border border-[color-mix(in_srgb,rgb(251_207_232)_40%,transparent)]",
    "hover:bg-[color-mix(in_srgb,rgb(252_231_243)_70%,transparent)] hover:text-gray-900 hover:border-[color-mix(in_srgb,rgb(244_114_182)_60%,transparent)] hover:scale-105",
    "disabled:pointer-events-none disabled:opacity-50",
    "h-9 px-4 py-2",
    "dark:bg-[color-mix(in_srgb,rgb(15_23_42)_50%,transparent)] dark:text-pink-100 dark:border-[color-mix(in_srgb,rgb(157_23_77)_40%,transparent)]",
    "dark:hover:bg-[color-mix(in_srgb,rgb(131_24_67)_40%,transparent)] dark:hover:text-pink-200 dark:hover:border-[color-mix(in_srgb,rgb(219_39_119)_60%,transparent)]",
  ].join(" ");
};

export const getInputBaseClasses = () => {
  return [
    "w-full rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2",
    "bg-white text-gray-800 border-pink-400 transition-all duration-200 ease-out",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "dark:bg-gray-800 dark:text-gray-200 dark:border-pink-600",
  ].join(" ");
};
