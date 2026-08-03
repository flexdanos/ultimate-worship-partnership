"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TierDatum = { tier: string; count: number };

const TIER_ORDER = ["friend_of_worship", "worship_partner", "altar_builder"];
const TIER_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function formatTierLabel(tier: string) {
  return tier.replace(/_/g, " ");
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { tier: string; count: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const { tier, count } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
      <p className="font-medium capitalize">{formatTierLabel(tier)}</p>
      <p className="text-muted-foreground">
        {count} active {count === 1 ? "partner" : "partners"}
      </p>
    </div>
  );
}

export function PartnersTierChart({ data }: { data: TierDatum[] }) {
  const chartData = [...data]
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
    .map((row) => ({ tier: row.tier, count: Number(row.count) }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 32, left: 8, bottom: 0 }}
      >
        <CartesianGrid
          horizontal={false}
          stroke="hsl(var(--border))"
          strokeDasharray="3 3"
        />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="tier"
          tickLine={false}
          axisLine={false}
          width={120}
          tickFormatter={formatTierLabel}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          className="capitalize"
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={<CustomTooltip />}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {chartData.map((row, index) => (
            <Cell key={row.tier} fill={TIER_COLORS[index % TIER_COLORS.length]} />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            className="fill-foreground text-xs font-medium"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
