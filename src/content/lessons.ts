import type { Lesson } from "@/types/content";

const pendingDuration = { zh: "时长待确认", en: "Duration to be confirmed" };
const flexibleFormat = { zh: "线上或迪拜线下", en: "Online or in person in Dubai" };

export const lessons: Lesson[] = [
  {
    id: "children",
    title: { zh: "海外儿童中文", en: "Chinese for Children Abroad" },
    audience: { zh: "适合：儿童 · 程度不限", en: "For: Children · All levels" },
    description: {
      zh: "以听说、识字和阅读启蒙为重点，按照孩子的年龄与中文接触经验安排内容。",
      en: "Age-appropriate listening, speaking, character recognition and early reading.",
    },
    duration: pendingDuration,
    format: flexibleFormat,
    tags: { zh: ["兴趣建立", "听说基础", "识字启蒙"], en: ["Engagement", "Speaking", "Literacy"] },
  },
  {
    id: "teens",
    title: { zh: "青少年中文", en: "Chinese for Teenagers" },
    audience: { zh: "适合：青少年 · 初级至进阶", en: "For: Teens · Beginner to advanced" },
    description: {
      zh: "结合真实话题训练表达、阅读和写作，让中文学习更贴近青少年的生活。",
      en: "Practical topics connect speaking, reading and writing with a teenager’s life.",
    },
    duration: pendingDuration,
    format: flexibleFormat,
    tags: { zh: ["综合能力", "表达训练", "学习规划"], en: ["Integrated skills", "Expression", "Planning"] },
  },
  {
    id: "literacy",
    title: { zh: "中文阅读与写作", en: "Chinese Reading & Writing" },
    audience: { zh: "适合：已有听说基础", en: "For: Learners with speaking foundations" },
    description: {
      zh: "从适合程度的文本出发，提升阅读理解、词汇积累与书面表达。",
      en: "Level-appropriate texts support comprehension, vocabulary and written expression.",
    },
    duration: pendingDuration,
    format: flexibleFormat,
    tags: { zh: ["阅读理解", "词汇", "写作"], en: ["Comprehension", "Vocabulary", "Writing"] },
  },
  {
    id: "conversation",
    title: { zh: "日常中文会话", en: "Everyday Chinese Conversation" },
    audience: { zh: "适合：希望增强表达者", en: "For: Learners building fluency" },
    description: {
      zh: "围绕家庭、学校和日常生活练习自然表达，逐步建立开口信心。",
      en: "Build confidence through natural conversation about family, school and daily life.",
    },
    duration: pendingDuration,
    format: flexibleFormat,
    tags: { zh: ["口语", "听力", "实用表达"], en: ["Speaking", "Listening", "Practical language"] },
  },
  {
    id: "pinyin",
    title: { zh: "拼音与发音基础", en: "Pinyin & Pronunciation Foundations" },
    audience: { zh: "适合：初学者或需要巩固者", en: "For: Beginners or foundation review" },
    description: {
      zh: "系统理解声母、韵母和声调，在听辨与练习中建立清晰发音。",
      en: "Learn initials, finals and tones through focused listening and guided practice.",
    },
    duration: pendingDuration,
    format: flexibleFormat,
    tags: { zh: ["拼音", "声调", "发音"], en: ["Pinyin", "Tones", "Pronunciation"] },
  },
  {
    id: "hsk",
    title: { zh: "HSK考试辅导", en: "HSK Preparation" },
    audience: { zh: "适合：有明确考试目标者", en: "For: Learners with an exam goal" },
    description: {
      zh: "根据目标级别和考试时间梳理词汇、题型与复习节奏；可行方案需评估后确认。",
      en: "Vocabulary, task types and revision planning aligned to a target level after assessment.",
    },
    duration: pendingDuration,
    format: flexibleFormat,
    tags: { zh: ["目标规划", "题型练习", "复习"], en: ["Goal planning", "Practice", "Revision"] },
  },
  {
    id: "personal",
    title: { zh: "一对一个性化课程", en: "Personalized One-to-One Lessons" },
    audience: { zh: "适合：有具体学习需要者", en: "For: Learners with specific needs" },
    description: {
      zh: "根据学生现有程度、兴趣与家庭目标组合课程重点，并持续调整。",
      en: "A flexible mix of skills shaped around current level, interests and family goals.",
    },
    duration: pendingDuration,
    format: flexibleFormat,
    tags: { zh: ["一对一", "个性化", "灵活重点"], en: ["One-to-one", "Personalized", "Flexible"] },
  },
];
