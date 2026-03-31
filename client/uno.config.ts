import { defineConfig, presetAttributify, presetIcons, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons()],
  shortcuts: {
    "card-surface":
      "rounded-6 bg-white/88 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80 backdrop-blur-sm",
    "field-base":
      "w-full appearance-none rounded-4 border-0 bg-white px-4 py-3 text-slate-700 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition focus:shadow-[inset_0_0_0_1px_rgb(6,182,212),0_0_0_4px_rgb(207,250,254)]",
    "btn-primary":
      "inline-flex appearance-none items-center justify-center rounded-4 border-0 bg-slate-900 px-5 py-3 text-sm font-semibold text-white outline-none shadow-none transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60",
  },
  theme: {
    colors: {
      brand: {
        50: "#ecfeff",
        100: "#cffafe",
        500: "#06b6d4",
        600: "#0891b2",
        900: "#164e63",
      },
    },
  },
});
