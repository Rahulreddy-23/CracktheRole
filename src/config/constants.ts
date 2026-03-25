export const APP_NAME = "CrackTheRole";
export const APP_DESCRIPTION =
  "Crack your dream tech role with AI-powered mock interviews and resume building";
export const GST_RATE = 0.18; // 18% GST

// ==================== PRICING ====================
// All prices in INR. GST (18%) is added at checkout.
// User sees: base price + GST breakdown on the payment screen.

export const PRICING = {
  free: {
    name: "Free",
    basePrice: 0,
    interviews: 1,
    interviewMaxMinutes: 10,
    resumes: 1, // can build and preview, but download is paywalled
    resumeDownloads: 0,
    features: [
      "1 mock interview (10 min)",
      "Resume builder preview",
      "Basic AI feedback",
    ],
  },
  starterPack: {
    id: "starter_pack",
    name: "Resume Download",
    basePrice: 29,
    gst: Math.round(29 * 0.18),
    get totalPrice() { return this.basePrice + this.gst; }, // 35 INR
    resumeDownloads: 1,
    description: "Download 1 AI-tailored resume as PDF",
  },
  interviewPack: {
    id: "interview_pack",
    name: "Interview Pack",
    basePrice: 79,
    gst: Math.round(79 * 0.18),
    get totalPrice() { return this.basePrice + this.gst; }, // 94 INR
    interviews: 2,
    interviewMaxMinutes: 30,
    description: "2 full mock interviews (30 min each)",
  },
  pro: {
    id: "pro_monthly",
    name: "Pro Plan",
    basePrice: 299,
    gst: Math.round(299 * 0.18),
    get totalPrice() { return this.basePrice + this.gst; }, // 353 INR
    period: "month",
    interviews: 8,
    interviewMaxMinutes: 30,
    resumes: 5,
    resumeDownloads: 5,
    features: [
      "8 mock interviews per month (30 min each)",
      "5 resume builds & downloads",
      "Full AI feedback & scoring",
      "Interview history & analytics",
      "Priority AI responses",
      "All programming languages",
    ],
  },
} as const;

// Helper to format price with GST breakdown for display
export function formatPriceWithGST(basePrice: number): {
  base: string;
  gst: string;
  total: string;
  gstAmount: number;
  totalAmount: number;
} {
  const gstAmount = Math.round(basePrice * GST_RATE);
  const totalAmount = basePrice + gstAmount;
  return {
    base: `Rs. ${basePrice}`,
    gst: `Rs. ${gstAmount}`,
    total: `Rs. ${totalAmount}`,
    gstAmount,
    totalAmount,
  };
}

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

// Judge0 CE endpoint (public instance — set JUDGE0_API_URL in .env.local for production)
export const JUDGE0_API_URL = process.env.JUDGE0_API_URL ?? "https://ce.judge0.com";

