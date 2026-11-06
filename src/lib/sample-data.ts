import type { Kpi, KpiInput } from "./types";
import { uid } from "./utils";

/** First day of each of the last `count` months, oldest first. */
function monthlyDates(count: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
  }
  return out;
}

function makeKpi(input: KpiInput, values: number[]): Kpi {
  const dates = monthlyDates(values.length);
  return {
    ...input,
    id: uid(),
    createdAt: dates[0],
    entries: values.map((value, i) => ({ id: uid(), date: dates[i], value })),
  };
}

export function createSampleKpis(): Kpi[] {
  return [
    makeKpi(
      {
        name: "Monthly Revenue",
        description: "Total recognized revenue for the month.",
        category: "Finance",
        unit: "$",
        target: 120000,
        direction: "increase",
        frequency: "monthly",
        owner: "Finance Team",
      },
      [82000, 88500, 91200, 97800, 104300, 116600],
    ),
    makeKpi(
      {
        name: "Customer Churn Rate",
        description: "Percentage of customers who cancelled during the month.",
        category: "Customer",
        unit: "%",
        target: 2,
        direction: "decrease",
        frequency: "monthly",
        owner: "Customer Success",
      },
      [4.1, 3.8, 3.5, 3.2, 2.9, 2.7],
    ),
    makeKpi(
      {
        name: "Net Promoter Score",
        description: "Customer loyalty score from the monthly NPS survey.",
        category: "Customer",
        unit: "pts",
        target: 50,
        direction: "increase",
        frequency: "monthly",
        owner: "Customer Success",
      },
      [38, 41, 40, 44, 47, 49],
    ),
    makeKpi(
      {
        name: "New Leads",
        description: "Marketing-qualified leads generated.",
        category: "Marketing",
        unit: "leads",
        target: 1500,
        direction: "increase",
        frequency: "monthly",
        owner: "Marketing",
      },
      [980, 1120, 1240, 1190, 1350, 1420],
    ),
    makeKpi(
      {
        name: "Website Conversion Rate",
        description: "Share of website visitors who sign up.",
        category: "Marketing",
        unit: "%",
        target: 3.5,
        direction: "increase",
        frequency: "monthly",
        owner: "Growth",
      },
      [2.1, 2.4, 2.6, 2.5, 2.9, 3.1],
    ),
    makeKpi(
      {
        name: "Avg. Support Response Time",
        description: "Average time to first response on support tickets.",
        category: "Operations",
        unit: "hrs",
        target: 4,
        direction: "decrease",
        frequency: "monthly",
        owner: "Support",
      },
      [9.5, 8.2, 7.4, 6.1, 5.8, 5.2],
    ),
    makeKpi(
      {
        name: "Employee Satisfaction",
        description: "Average score from the monthly pulse survey.",
        category: "People",
        unit: "/10",
        target: 8,
        direction: "increase",
        frequency: "monthly",
        owner: "HR",
      },
      [7.1, 7.3, 7.2, 7.6, 7.9, 8.1],
    ),
    makeKpi(
      {
        name: "Deployments",
        description: "Production deployments shipped per month.",
        category: "Engineering",
        unit: "deploys",
        target: 40,
        direction: "increase",
        frequency: "monthly",
        owner: "Engineering",
      },
      [18, 22, 27, 31, 36, 42],
    ),
  ];
}
