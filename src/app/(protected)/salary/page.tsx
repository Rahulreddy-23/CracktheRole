import type { Metadata } from "next";
import SalaryClient from "@/components/salary/SalaryClient";
import BackToDashboard from "@/components/shared/BackToDashboard";

export const metadata: Metadata = {
  title: "Salary Intelligence",
  description:
    "Real, anonymized salary data from Indian tech companies. Know your worth before you negotiate.",
};

export default function SalaryPage() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <BackToDashboard />
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Salary Intelligence</h1>
        <p className="text-text-secondary text-sm mt-1">
          Real compensation data from the community — all figures anonymised
        </p>
      </div>

      <SalaryClient />
    </main>
  );
}
