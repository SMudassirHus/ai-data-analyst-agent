export type SampleDataset = {
  id: "hr_analytics" | "sales_analytics" | "marketing_campaign";
  name: string;
  description: string;
};

export const sampleDatasets: SampleDataset[] = [
  {
    id: "hr_analytics",
    name: "HR Analytics Dataset",
    description: "Attrition, income, department, satisfaction, and overtime.",
  },
  {
    id: "sales_analytics",
    name: "Sales Analytics Dataset",
    description: "Orders, dates, regions, categories, sales, profit, and quantity.",
  },
  {
    id: "marketing_campaign",
    name: "Marketing Campaign Dataset",
    description: "Campaign spend, channels, audiences, leads, conversions, and revenue.",
  },
];
