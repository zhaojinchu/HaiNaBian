import type { PriceOption } from "@/types/content";

const pending = { zh: "价格待定", en: "Price to be confirmed" };
const duration = { zh: "课时待确认", en: "Duration to be confirmed" };

export const pricing: PriceOption[] = [
  {
    id: "trial",
    name: { zh: "试听课", en: "Trial lesson" },
    duration,
    price: pending,
    packageSize: { zh: "单次试听", en: "One trial session" },
    includes: {
      zh: ["初步程度了解", "课堂体验", "后续学习建议"],
      en: ["Initial level review", "Lesson experience", "Next-step recommendation"],
    },
  },
  {
    id: "individual",
    name: { zh: "一对一标准课", en: "Individual lesson" },
    duration,
    price: pending,
    packageSize: { zh: "单节课程", en: "Single lesson" },
    includes: {
      zh: ["个性化课堂内容", "学习材料说明", "阶段性反馈"],
      en: ["Personalized content", "Learning materials guidance", "Progress feedback"],
    },
    recommended: true,
  },
  {
    id: "package",
    name: { zh: "课程组合", en: "Lesson package" },
    duration,
    price: pending,
    packageSize: { zh: "课包节数待确认", en: "Package size to be confirmed" },
    includes: {
      zh: ["连续学习安排", "阶段目标规划", "家长沟通"],
      en: ["Consistent schedule", "Milestone planning", "Parent communication"],
    },
  },
  {
    id: "group",
    name: { zh: "兄弟姐妹／小组课", en: "Sibling / small-group lesson" },
    duration,
    price: pending,
    packageSize: { zh: "人数与安排待确认", en: "Group size to be confirmed" },
    includes: {
      zh: ["同程度学习建议", "互动练习", "具体安排需先沟通"],
      en: ["Level matching guidance", "Interactive practice", "Arrangement by consultation"],
    },
  },
];
