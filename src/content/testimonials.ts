import type { Testimonial } from "@/types/content";

export const testimonials: Testimonial[] = [
  {
    id: "placeholder-1",
    quote: {
      zh: "家长反馈将在获得明确授权后展示。",
      en: "Parent feedback will be shown here after explicit permission is received.",
    },
    attribution: { zh: "真实评价占位", en: "Verified testimonial placeholder" },
    placeholder: true,
  },
  {
    id: "placeholder-2",
    quote: {
      zh: "这里将呈现关于课堂体验、沟通方式或学习变化的真实反馈。",
      en: "This space is reserved for genuine feedback about lessons, communication or progress.",
    },
    attribution: { zh: "内容待提供", en: "Content to be supplied" },
    placeholder: true,
  },
];
