import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewContent from "./review-content";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;
  const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

  // DEV-ONLY: return mock data when bypass is active
  if (DEV_BYPASS) {
    const mockSession = {
      id,
      interview_type: "dsa" as const,
      difficulty: "medium" as const,
      company_context: "Google",
      overall_score: 78,
      score_technical: 82,
      score_communication: 75,
      score_problem_solving: 80,
      score_time_management: 70,
      feedback_summary:
        "The candidate demonstrated strong algorithmic thinking and was able to arrive at an optimal solution for the given problem. Communication was clear throughout, though there is room for improvement in explaining trade-offs between different approaches. Time management was adequate but could be tightened.",
      strengths: [
        "Strong understanding of data structures and algorithm selection",
        "Clear step-by-step problem decomposition before coding",
        "Good handle on time and space complexity analysis",
      ],
      improvements: [
        "Discuss trade-offs between alternative approaches more thoroughly",
        "Consider more edge cases before finalizing the solution",
        "Practice verbalizing thought process while coding simultaneously",
      ],
      messages: [
        {
          role: "assistant" as const,
          content:
            "Welcome to your DSA interview. I will be asking you a medium-difficulty algorithmic question today.\n\n**Problem:** Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nHow would you approach this problem?",
        },
        {
          role: "user" as const,
          content:
            "I would use a hash map approach. I can iterate through the array once, and for each element, check if the complement (target - current element) exists in the hash map. If it does, I have found the pair. If not, I add the current element and its index to the hash map.",
        },
        {
          role: "assistant" as const,
          content:
            "Excellent approach! Using a hash map gives you O(n) time complexity with O(n) space complexity, which is optimal for this problem.\n\nCould you walk me through the implementation? What would your code look like?",
        },
        {
          role: "user" as const,
          content:
            "```python\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n```\n\nThis runs in O(n) time and O(n) space. The hash map lookup is O(1) average case.",
        },
        {
          role: "assistant" as const,
          content:
            "That is a clean and correct implementation. Good job explaining the complexity.\n\nFollow-up: What would happen if the array contained duplicate values? For example, `nums = [3, 3]` and `target = 6`. Would your solution handle this correctly?",
        },
        {
          role: "user" as const,
          content:
            "Yes, it would handle duplicates correctly. When we encounter the first 3, we add it to the map with index 0. When we encounter the second 3 at index 1, we compute complement = 6 - 3 = 3, which already exists in the map at index 0. So we return [0, 1]. The key insight is that we check for the complement before adding the current element, so we never match an element with itself.",
        },
      ],
      duration_seconds: 1800,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 86400000 + 1800000).toISOString(),
      status: "completed" as const,
    };

    return (
      <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <ReviewContent session={mockSession} />
      </main>
    );
  }

  // Production path: fetch session from Supabase
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <ReviewContent session={session} />
    </main>
  );
}
