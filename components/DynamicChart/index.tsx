import { DonutChart, Color, BarChart, LineChart } from "@tremor/react";

const COLORS: Color[] = ["indigo", "rose", "cyan", "amber", "slate", "violet"];

const components: Record<string, any> = {
  donut: DonutChart,
  bar: BarChart,
  line: LineChart,
};

export default function DynamicChart({
  results,
  type,
}: {
  results: any[];
  type: string;
}) {
  const keys = Object.keys(results[0] || {});

  if (keys.length > 2 || keys.length === 0) {
    // TODO: Not supported so far
    return <></>;
  }

  const dataKey = keys.find((key) => typeof results[0][key] === "string");
  const categoryKey = keys.find(
    (key) => typeof results[0][key] === "number" && key !== dataKey
  );

  const CustomChart = components[type.toLocaleLowerCase()];
  return (
    <>
      <CustomChart
        data={results}
        category={categoryKey}
        categories={[categoryKey]}
        dataKey={dataKey}
        index={dataKey}
        marginTop="mt-6"
        colors={COLORS}
      />
    </>
  );
}
