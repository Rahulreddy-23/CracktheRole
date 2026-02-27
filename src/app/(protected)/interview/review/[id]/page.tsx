interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        Interview Review
      </h1>
      <p className="text-text-secondary">Session ID: {id}</p>
    </main>
  );
}
