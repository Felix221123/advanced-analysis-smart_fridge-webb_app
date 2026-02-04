import { AllFoodItemProps } from "@/interface/ComponentProps";
import { daysUntil } from "@/utils/date";

export const isExpired = (p: AllFoodItemProps): boolean => {
  const d = daysUntil(p.expiry_date);
  return typeof d === "number" && d < 0;
};

export const isExpiringSoon = (p: AllFoodItemProps, withinDays: number): boolean => {
  const d = daysUntil(p.expiry_date);
  return typeof d === "number" && d >= 0 && d <= withinDays;
};

export const isLowStock = (p: AllFoodItemProps): boolean => {
  const min = Number(p.reorder_point ?? 0);
  const qty = Number(p.qty_total ?? 0);
  return min > 0 && qty <= min;
};

export const isCompliant = (p: AllFoodItemProps, expiringSoonDays: number): boolean => {
  // compliant = not expired and not expiring soon
  return !isExpired(p) && !isExpiringSoon(p, expiringSoonDays);
};
