import { ExclamationIcon } from "@heroicons/react/solid";
import {
  DonutChart,
  Color,
  BarChart,
  AreaChart,
  Callout,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@tremor/react";
import { ChartType } from "../../utils/types";

const COLORS: Color[] = ["indigo", "rose", "cyan", "amber", "slate", "violet"];

const components: Record<string, any> = {
  donut: DonutChart,
  bar: BarChart,
  line: AreaChart,
};

export default function DynamicChart({
  results,
  type,
}: {
  results: any[];
  type: ChartType;
}) {
  const keys = Object.keys(results[0] || {});

  if (keys.length === 0) {
    return (
      <Callout
        marginTop="mt-4"
        title="Query coulnt be displayed"
        icon={ExclamationIcon}
        color="rose"
        text="The query didn't return any result"
      />
    );
  }

  if (type === "Table") {
    return (
      <Table>
        <TableHead>
          <TableRow>
            {keys.map((key) => (
              <TableHeaderCell key={key}>{key}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index}>
              {keys.map((key) => (
                <TableCell key={key}>{result[key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (keys.length > 2 && type !== "Bar") {
    // TODO: Not supported so far
    return (
      <>
        <Callout
          marginTop="mt-4"
          title="Query coulnt be displayed"
          icon={ExclamationIcon}
          color="rose"
          text="The results have more than two columns, not supported yet"
        />
      </>
    );
  }

  const dataKeys = keys.filter((key) => typeof results[0][key] === "string");
  const categoryKey = keys.find(
    (key) => typeof results[0][key] === "number" && !dataKeys.includes(key)
  );

  const CustomChart = components[type.toLocaleLowerCase()];
  return (
    <>
      <CustomChart
        data={results}
        category={categoryKey}
        categories={[categoryKey]}
        dataKey={dataKeys[0]}
        index={dataKeys[0]}
        marginTop="mt-6"
        colors={COLORS}
      />
    </>
  );
}
