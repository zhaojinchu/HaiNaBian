import type { LocalizedText } from "@/types/content";

export const siteContent = {
  brand: "海那边",
  descriptor: {
    zh: "迪拜中文课堂",
    en: "Chinese Lessons in Dubai",
  } satisfies LocalizedText,
  email: "联系邮箱待确认",
  phone: "联系电话待确认",
  wechat: "微信号待确认",
  location: {
    zh: "迪拜授课地点待确认",
    en: "Dubai teaching location to be confirmed",
  } satisfies LocalizedText,
};

export const audiences = [
  {
    icon: "child",
    title: { zh: "海外儿童", en: "Children abroad" },
    description: {
      zh: "建立中文兴趣与基础，在轻松、有结构的节奏中稳步进步。",
      en: "Build interest and strong foundations through calm, structured learning.",
    },
  },
  {
    icon: "teen",
    title: { zh: "青少年学生", en: "Teen learners" },
    description: {
      zh: "兼顾阅读、写作与表达，帮助中文能力持续成长。",
      en: "Develop reading, writing and confident expression in a balanced way.",
    },
  },
  {
    icon: "family",
    title: { zh: "海外家庭", en: "Overseas families" },
    description: {
      zh: "为希望维持家庭语言连接的家长提供个性化学习支持。",
      en: "Personalized support for families maintaining a meaningful language connection.",
    },
  },
] as const;

export const processSteps = [
  {
    title: { zh: "了解学习需要", en: "Understand the learner" },
    description: {
      zh: "沟通年龄、中文基础、学习目标和时间安排。",
      en: "Discuss age, current level, goals and availability.",
    },
  },
  {
    title: { zh: "预约试听课程", en: "Book a trial lesson" },
    description: {
      zh: "通过试听了解课堂节奏，也让老师评估适合的起点。",
      en: "Experience the lesson style and identify an appropriate starting point.",
    },
  },
  {
    title: { zh: "制定学习计划", en: "Create a learning plan" },
    description: {
      zh: "根据反馈确认课程重点、频率与后续安排。",
      en: "Agree on focus areas, frequency and next steps after the trial.",
    },
  },
] as const;
