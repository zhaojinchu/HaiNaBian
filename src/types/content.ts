export type Locale = "zh" | "en";

export type LocalizedText = Record<Locale, string>;

export interface Lesson {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  audience: LocalizedText;
  duration: LocalizedText;
  format: LocalizedText;
  tags: Record<Locale, string[]>;
}

export interface PriceOption {
  id: string;
  name: LocalizedText;
  duration: LocalizedText;
  price: LocalizedText;
  packageSize: LocalizedText;
  includes: Record<Locale, string[]>;
  recommended?: boolean;
}

export interface Testimonial {
  id: string;
  quote: LocalizedText;
  attribution: LocalizedText;
  placeholder: true;
}
