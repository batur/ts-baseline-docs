import { barY, defineChart } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";

import { Card } from "../../shared/ui";

const ACTIVITY_DATA = [
  { count: 2, label: "Mon" },
  { count: 4, label: "Tue" },
  { count: 3, label: "Wed" },
  { count: 6, label: "Thu" },
  { count: 5, label: "Fri" },
] as const;

const USERS_ACTIVITY_CHART = defineChart({
  marks: [
    barY(ACTIVITY_DATA, {
      x: "label",
      y: "count",
    }),
  ],
  scales: {
    x: {
      scale: () => scaleBand().padding(0.18),
    },
    y: {
      grid: true,
      nice: true,
      scale: scaleLinear,
    },
  },
});

export function UserActivityChart() {
  return (
    <Card>
      <div>
        <h2 className="text-lg font-semibold">Activity example</h2>
        <p className="text-sm text-muted-foreground">Deterministic feature-owned chart data.</p>
      </div>
      <Chart
        ariaDescription="A bar chart showing activity counts from Monday to Friday."
        ariaLabel="Weekly user activity"
        definition={USERS_ACTIVITY_CHART}
        height={220}
      />
    </Card>
  );
}
