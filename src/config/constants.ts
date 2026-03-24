export const APP_NAME = "CrackTheRole";
export const APP_DESCRIPTION =
  "Crack your dream tech role with AI-powered mock interviews and resume building";

export const FREE_PLAN_LIMITS = {
  interviewsPerMonth: 3,
  resumesPerMonth: 2,
  codeExecutionsPerInterview: 10,
};

export const PRO_PLAN = {
  price: 499,
  currency: "INR",
  name: "Pro Plan",
  features: [
    "Unlimited mock interviews",
    "Unlimited resume builds",
    "Unlimited code executions",
    "Priority AI feedback",
    "Interview history & analytics",
    "All programming languages",
  ],
};

export const INTERVIEW_TOPICS = {
  coding: [
    "Arrays & Hashing",
    "Two Pointers",
    "Sliding Window",
    "Stack",
    "Binary Search",
    "Linked List",
    "Trees",
    "Graphs",
    "Dynamic Programming",
    "Greedy",
    "Backtracking",
    "Heap / Priority Queue",
    "Bit Manipulation",
    "Math & Geometry",
  ],
  "system-design": [
    "URL Shortener",
    "Chat Application",
    "News Feed",
    "Rate Limiter",
    "Distributed Cache",
    "Payment System",
    "Notification Service",
    "File Storage (like Google Drive)",
    "Search Engine",
    "Video Streaming Platform",
  ],
  behavioral: [
    "Leadership & Conflict",
    "Teamwork & Collaboration",
    "Problem Solving Under Pressure",
    "Failure & Learning",
    "Innovation & Initiative",
  ],
};
