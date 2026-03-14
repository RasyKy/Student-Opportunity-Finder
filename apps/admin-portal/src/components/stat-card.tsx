import { TrendingUp, TrendingDown } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number | string;
  changePercent: number;
  trend: string;
  note: string;
};

export default function StatCard({ label, value, changePercent, trend, note }: StatCardProps) {
  const isUp = changePercent >= 0;

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            isUp
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {isUp ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isUp ? "+" : ""}
          {changePercent}%
        </span>
      </div>

      <p className="mb-4 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>

      <div className="flex items-center gap-1.5">
        {isUp ? (
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-rose-500" />
        )}
        <p className="text-sm font-medium text-gray-800">{trend}</p>
      </div>
      <p className="mt-1 text-sm text-gray-500">{note}</p>
    </article>
  );
}
