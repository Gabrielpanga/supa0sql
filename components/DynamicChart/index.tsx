import { Card, Title, DonutChart, Subtitle, Color } from "@tremor/react";

const COLORS: Color[] = ["slate", "violet", "indigo", "rose", "cyan", "amber"];

export default function DynamicChart({
  results,
  type,
}: {
  results: any[];
  type: string;
}) {
  const keys = Object.keys(results[0]);

  if (keys.length > 2) {
    // TODO: Not supported so far
    return <></>;
  }

  const dataKey = keys.find((key) => typeof results[0][key] === "string");
  const categoryKey = keys.find(
    (key) => typeof results[0][key] === "number" && key !== dataKey
  );

  return (
    <DonutChart
      data={results}
      category={categoryKey}
      dataKey={dataKey}
      marginTop="mt-6"
      colors={COLORS}
    />
  );
}
