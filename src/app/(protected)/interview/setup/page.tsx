import InterviewSetup from "@/components/interview/InterviewSetup";
import BackToDashboard from "@/components/shared/BackToDashboard";

export default function InterviewSetupPage() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <BackToDashboard />
      </div>
      <InterviewSetup />
    </main>
  );
}
