import { FilterSelections, Nutrition } from "./types";

export function buildFilterTags(filters: FilterSelections) {
  const out: string[] = [];

  for (const set of Object.values(filters)) {
    for (const v of Array.from(set)) {
      out.push(v.trim().toLowerCase());
    }
  }

  return Array.from(new Set(out));
}

export type DashboardCalendarRecipe = {
  _id: string;
  nutritional_info?: Partial<Nutrition>;
};

export type DashboardCalendarDate = {
  _id: string;
  entrees?: DashboardCalendarRecipe[];
  fruits?: DashboardCalendarRecipe[];
  sides?: DashboardCalendarRecipe[];
};

export function calendarDateHasEntree(calendarDate: DashboardCalendarDate) {
  return (calendarDate.entrees ?? []).length > 0;
}

export function countMealPlannedDates(calendarDates: DashboardCalendarDate[]) {
  return calendarDates.filter(calendarDateHasEntree).length;
}

export function getDailyNutritionTotals(
  _calendarDate: DashboardCalendarDate,
): Pick<Nutrition, "calories" | "protein" | "sodium"> {
  // TODO: Implement once the shared nutrition quota helper functions are ready.
  return {
    calories: 0,
    protein: 0,
    sodium: 0,
  };
}

export function calendarDateMeetsNutritionQuota(_calendarDate: DashboardCalendarDate) {
  // TODO: Check kcal, sodium, and protein once quota helper functions are ready.
  return false;
}

export function countNutritionQuotaMetDates(calendarDates: DashboardCalendarDate[]) {
  return calendarDates.filter(calendarDateMeetsNutritionQuota).length;
}
