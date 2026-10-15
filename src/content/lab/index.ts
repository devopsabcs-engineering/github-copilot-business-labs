import { labContentEnCa } from "./en-CA";
import { labContentFrCa } from "./fr-CA";
import {
  LAB_ROUTE_LOCALES,
  type LabContent,
  type LabRouteLocale,
} from "./types";

export { LAB_ROUTE_LOCALES } from "./types";
export type { LabContent, LabModule, LabRouteLocale } from "./types";

export const LAB_CONTENT_BY_LOCALE = {
  en: labContentEnCa,
  fr: labContentFrCa,
} satisfies Record<LabRouteLocale, LabContent>;

export function isLabRouteLocale(value: string): value is LabRouteLocale {
  return LAB_ROUTE_LOCALES.some((locale) => locale === value);
}

export function getLabContent(locale: string): LabContent | undefined {
  return isLabRouteLocale(locale) ? LAB_CONTENT_BY_LOCALE[locale] : undefined;
}