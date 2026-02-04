const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toUtcDay = (iso: string): number | null => {
    if (!iso) return null;

    // If backend sends just YYYY-MM-DD, treat it as a date-only value
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        return Date.UTC(y, mo, d);
    }

    // Otherwise parse as datetime
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return null;

    return Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
};

export const daysUntil = (iso: string | null | undefined): number | null => {
    if (!iso) return null;

    const target = toUtcDay(iso);
    if (target === null) return null;

    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    return Math.round((target - today) / MS_PER_DAY);
};

export const formatDateUK = (iso: string | null | undefined): string => {
    if (!iso) return "—";
    const utc = toUtcDay(iso);
    if (utc === null) return "—";
    return new Date(utc).toLocaleDateString("en-GB", { timeZone: "UTC" });
  };
  

export const expiryLabel = (days: number | null | undefined): string | null => {
    if (typeof days !== "number") return null;

    if (days < 0) {
        const n = Math.abs(days);
        return `Expired ${n} day${n === 1 ? "" : "s"} ago`;
    }
    if (days === 0) return "Expires today";
    return `Expires in ${days} day${days === 1 ? "" : "s"}`;
};
