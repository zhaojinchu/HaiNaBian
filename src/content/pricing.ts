import type { PriceOption } from "@/types/content";

const pending = { zh: "价格待定", en: "Price to be confirmed" };
const duration = { zh: "课时待确认", en: "Duration to be confirmed" };

export const pricing: PriceOption[] = [
  {
    id: "individual",
    name: { zh: "一对一课程", en: "One-to-one lesson" },
    duration,
    price: pending,
    packageSize: { zh: "一名学生", en: "One learner" },
    includes: {
      zh: ["根据学生需要安排内容", "线上或老师家中授课", "学习节奏灵活调整"],
      en: ["Content shaped around the learner", "Online or at the teacher’s home", "Flexible pace and focus"],
    },
    recommended: true,
  },
  {
    id: "pair",
    name: { zh: "二对一课程", en: "Two-to-one lesson" },
    duration,
    price: pending,
    packageSize: { zh: "两名程度相近的学生", en: "Two learners at a similar level" },
    includes: {
      zh: ["适合同伴或兄弟姐妹", "线上或老师家中授课", "兼顾互动与个人指导"],
      en: ["Suitable for friends or siblings", "Online or at the teacher’s home", "Shared practice with individual guidance"],
    },
  },
  {
    id: "small-group",
    name: { zh: "三至四人小组课", en: "Small-group lesson" },
    duration,
    price: pending,
    packageSize: { zh: "三至四名程度相近的学生", en: "Three to four learners at a similar level" },
    includes: {
      zh: ["小组互动与表达练习", "线上或老师家中授课", "具体分组由老师确认"],
      en: ["Group interaction and speaking practice", "Online or at the teacher’s home", "Final grouping confirmed by the teacher"],
    },
  },
];
