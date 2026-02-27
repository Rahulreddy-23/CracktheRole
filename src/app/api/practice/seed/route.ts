import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This route requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS for inserting questions.
// Add it to your .env.local file alongside NEXT_PUBLIC_SUPABASE_URL.

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, serviceKey);
}

const SEED_QUESTIONS = [
  // ── DSA ── Easy ────────────────────────────────────────────────────────────
  {
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to the target.

You may assume each input has exactly one solution, and you may not use the same element twice.

**Example:**
\`\`\`
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
\`\`\`

**Constraints:**
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- Only one valid answer exists.`,
    category: "dsa",
    difficulty: "easy",
    company_tags: ["Amazon", "Google", "Meta"],
    topic_tags: ["array", "hash-map"],
    hints: [
      "A brute-force O(n²) approach checks every pair. Can you do better?",
      "Use a hash map to store each number and its index as you iterate.",
      "For each element, check whether (target − element) already exists in the map before inserting the current element.",
    ],
    solution: `## Hash Map Approach

**Time:** O(n) | **Space:** O(n)

\`\`\`python
def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
\`\`\`

**Why it works:** For each element we check whether its complement already exists in the map. If it does, we've found our pair. If not, we record the current element so future iterations can find it.`,
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a stock on day \`i\`. You want to maximize profit by choosing a single day to buy and a later day to sell.

Return the maximum profit. If no profit is possible, return \`0\`.

**Example:**
\`\`\`
Input:  prices = [7, 1, 5, 3, 6, 4]
Output: 5
Explanation: Buy on day 2 (price = 1), sell on day 5 (price = 6).
\`\`\`

**Constraints:**
- \`1 <= prices.length <= 10^5\`
- \`0 <= prices[i] <= 10^4\``,
    category: "dsa",
    difficulty: "easy",
    company_tags: ["Amazon", "Meta", "Microsoft"],
    topic_tags: ["array", "greedy"],
    hints: [
      "You need to find the maximum difference where the larger value comes after the smaller value.",
      "Track the minimum price seen so far as you scan left to right.",
      "At each index, the best profit if you sell today = current price − min price so far.",
    ],
    solution: `## Single Pass Greedy

**Time:** O(n) | **Space:** O(1)

\`\`\`python
def maxProfit(prices: list[int]) -> int:
    min_price = float("inf")
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit
\`\`\``,
  },
  {
    title: "Valid Parentheses",
    description: `Given a string \`s\` containing only the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, and \`]\`, determine if the input string is valid.

A string is valid if:
1. Open brackets are closed by the same type of bracket.
2. Open brackets are closed in the correct order.
3. Every close bracket has a corresponding open bracket.

**Example:**
\`\`\`
Input:  s = "()[]{}"
Output: true

Input:  s = "(]"
Output: false
\`\`\``,
    category: "dsa",
    difficulty: "easy",
    company_tags: ["Amazon", "Google", "Microsoft"],
    topic_tags: ["stack", "string"],
    hints: [
      "Think about which data structure lets you check the most recent unmatched open bracket.",
      "Use a stack — push open brackets, and when you see a close bracket, check whether the top of the stack is its matching open.",
      "At the end, the stack should be empty for a valid string.",
    ],
    solution: `## Stack

**Time:** O(n) | **Space:** O(n)

\`\`\`python
def isValid(s: str) -> bool:
    stack = []
    match = {")": "(", "}": "{", "]": "["}
    for ch in s:
        if ch in match:
            if not stack or stack[-1] != match[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return not stack
\`\`\``,
  },
  {
    title: "Binary Search",
    description: `Given a sorted array of distinct integers \`nums\` and a target value, return the index of \`target\` if it exists in the array, or \`-1\` if it does not.

You must write an algorithm with **O(log n)** runtime complexity.

**Example:**
\`\`\`
Input:  nums = [-1, 0, 3, 5, 9, 12], target = 9
Output: 4
\`\`\`

**Constraints:**
- \`1 <= nums.length <= 10^4\`
- All values in \`nums\` are unique.
- \`nums\` is sorted in ascending order.`,
    category: "dsa",
    difficulty: "easy",
    company_tags: ["Google", "Microsoft", "Amazon"],
    topic_tags: ["binary-search", "array"],
    hints: [
      "Maintain a search window with left and right pointers.",
      "Compute the midpoint and compare it to the target to decide which half to keep.",
      "Be careful with the loop condition — use `left <= right` to avoid missing a single-element window.",
    ],
    solution: `## Iterative Binary Search

**Time:** O(log n) | **Space:** O(1)

\`\`\`python
def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\``,
  },
  {
    title: "Maximum Subarray",
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) with the largest sum and return its sum.

**Example:**
\`\`\`
Input:  nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
Explanation: The subarray [4, -1, 2, 1] has the largest sum = 6.
\`\`\`

**Follow-up:** If you figured out the O(n) solution, try coding a divide-and-conquer solution, which is more subtle.`,
    category: "dsa",
    difficulty: "easy",
    company_tags: ["Amazon", "Adobe", "Microsoft"],
    topic_tags: ["dynamic-programming", "array", "divide-and-conquer"],
    hints: [
      "At each position, decide whether to extend the current subarray or start a new one.",
      "If the running sum becomes negative, it can only hurt future subarrays — reset it.",
      "This greedy insight leads directly to Kadane's algorithm.",
    ],
    solution: `## Kadane's Algorithm

**Time:** O(n) | **Space:** O(1)

\`\`\`python
def maxSubArray(nums: list[int]) -> int:
    current = best = nums[0]
    for num in nums[1:]:
        current = max(num, current + num)
        best = max(best, current)
    return best
\`\`\``,
  },

  // ── DSA ── Medium ───────────────────────────────────────────────────────────
  {
    title: "3Sum",
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

The solution set must not contain duplicate triplets.

**Example:**
\`\`\`
Input:  nums = [-1, 0, 1, 2, -1, -4]
Output: [[-1, -1, 2], [-1, 0, 1]]
\`\`\`

**Constraints:**
- \`3 <= nums.length <= 3000\`
- \`-10^5 <= nums[i] <= 10^5\``,
    category: "dsa",
    difficulty: "medium",
    company_tags: ["Adobe", "Google", "Meta", "Amazon"],
    topic_tags: ["array", "two-pointers", "sorting"],
    hints: [
      "Sort the array first — this lets you skip duplicates and use two-pointer on the remaining subarray.",
      "Fix the first element with an outer loop, then use left/right pointers on the rest to find the complementary pair.",
      "When you find a valid triplet, advance both pointers and skip duplicate values to avoid repeating the same triplet.",
    ],
    solution: `## Sort + Two Pointers

**Time:** O(n²) | **Space:** O(1) (excluding output)

\`\`\`python
def threeSum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    return result
\`\`\``,
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.

**Example:**
\`\`\`
Input:  s = "abcabcbb"
Output: 3
Explanation: "abc" has length 3.

Input:  s = "pwwkew"
Output: 3
Explanation: "wke" has length 3.
\`\`\`

**Constraints:**
- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of printable ASCII characters.`,
    category: "dsa",
    difficulty: "medium",
    company_tags: ["Amazon", "Google", "Microsoft", "Adobe"],
    topic_tags: ["sliding-window", "hash-map", "string"],
    hints: [
      "Use a sliding window defined by two pointers: left and right.",
      "A hash map (or set) tracks which characters are currently in the window.",
      "When you encounter a duplicate, advance the left pointer past the previous occurrence of that character.",
    ],
    solution: `## Sliding Window

**Time:** O(n) | **Space:** O(min(m, n)) where m is charset size

\`\`\`python
def lengthOfLongestSubstring(s: str) -> int:
    char_index = {}
    left = 0
    max_len = 0
    for right, ch in enumerate(s):
        if ch in char_index and char_index[ch] >= left:
            left = char_index[ch] + 1
        char_index[ch] = right
        max_len = max(max_len, right - left + 1)
    return max_len
\`\`\``,
  },
  {
    title: "LRU Cache Design",
    description: `Design a data structure that follows the **Least Recently Used (LRU)** cache eviction policy.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` — initialize with a positive capacity.
- \`int get(int key)\` — return the value if key exists, else return \`-1\`. Mark the key as recently used.
- \`void put(int key, int value)\` — update/insert the key-value pair. When capacity is exceeded, evict the least recently used key.

Both operations must run in **O(1) average time**.

**Example:**
\`\`\`
cache = LRUCache(2)
cache.put(1, 1)   # cache: {1=1}
cache.put(2, 2)   # cache: {1=1, 2=2}
cache.get(1)      # returns 1, cache: {2=2, 1=1}
cache.put(3, 3)   # evicts key 2, cache: {1=1, 3=3}
cache.get(2)      # returns -1 (evicted)
\`\`\``,
    category: "dsa",
    difficulty: "medium",
    company_tags: ["Amazon", "Meta", "Google", "Microsoft"],
    topic_tags: ["design", "linked-list", "hash-map"],
    hints: [
      "A hash map gives O(1) lookup, but ordering for eviction requires something more.",
      "A doubly linked list maintains insertion/access order in O(1) when you have a direct node reference.",
      "Combine them: hash map from key → node, doubly linked list with most-recent at head and least-recent at tail.",
    ],
    solution: `## Doubly Linked List + Hash Map

**Time:** O(1) for both get and put | **Space:** O(capacity)

\`\`\`python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)
\`\`\`

In an interview, implement the doubly linked list manually to show you understand the underlying mechanics.`,
  },
  {
    title: "Number of Islands",
    description: `Given an \`m x n\` 2D binary grid where \`'1'\` represents land and \`'0'\` represents water, return the number of islands.

An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.

**Example:**
\`\`\`
Input:
  grid = [
    ["1","1","0","0","0"],
    ["1","1","0","0","0"],
    ["0","0","1","0","0"],
    ["0","0","0","1","1"]
  ]
Output: 3
\`\`\``,
    category: "dsa",
    difficulty: "medium",
    company_tags: ["Amazon", "Google", "Meta"],
    topic_tags: ["graph", "dfs", "bfs", "union-find"],
    hints: [
      "Scan every cell. When you hit an unvisited '1', you've found a new island.",
      "Use DFS or BFS to mark all connected land cells as visited (e.g., set them to '0').",
      "Count how many times you initiate a DFS/BFS — that's your answer.",
    ],
    solution: `## DFS Flood Fill

**Time:** O(m × n) | **Space:** O(m × n) call stack

\`\`\`python
def numIslands(grid: list[list[str]]) -> int:
    rows, cols = len(grid), len(grid[0])

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            dfs(r + dr, c + dc)

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                dfs(r, c)
                count += 1
    return count
\`\`\``,
  },

  // ── DSA ── Hard ─────────────────────────────────────────────────────────────
  {
    title: "Merge K Sorted Lists",
    description: `You are given an array of \`k\` linked lists, each sorted in ascending order. Merge all linked lists into one sorted linked list and return it.

**Example:**
\`\`\`
Input:  lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
\`\`\`

**Constraints:**
- \`k == lists.length\`
- \`0 <= k <= 10^4\`
- \`0 <= lists[i].length <= 500\`
- The total number of nodes is in the range \`[0, 10^4]\`.`,
    category: "dsa",
    difficulty: "hard",
    company_tags: ["Amazon", "Google", "Meta", "Microsoft"],
    topic_tags: ["linked-list", "heap", "divide-and-conquer"],
    hints: [
      "A naive approach merges lists one by one — O(kN) total. Can you do better?",
      "Use a min-heap seeded with the head of each non-empty list. Always extract the minimum node and push its successor.",
      "Alternatively, use divide-and-conquer: pair up lists, merge pairs, repeat — giving O(N log k).",
    ],
    solution: `## Min-Heap

**Time:** O(N log k) | **Space:** O(k) for the heap

\`\`\`python
import heapq
from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeKLists(lists: list[Optional[ListNode]]) -> Optional[ListNode]:
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))

    dummy = ListNode()
    curr = dummy
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next
\`\`\``,
  },

  // ── System Design ── Medium ─────────────────────────────────────────────────
  {
    title: "Design a URL Shortener",
    description: `Design a URL shortening service like bit.ly or TinyURL.

**Functional Requirements:**
- Given a long URL, return a short URL (e.g., \`short.ly/abc123\`).
- Visiting the short URL redirects to the original URL.
- Custom aliases should be supported (optional).
- URLs should expire after a configurable TTL.

**Non-Functional Requirements:**
- 100 million URLs generated per day.
- Read-heavy: 10:1 read-to-write ratio.
- Short URLs must be unique; collisions are unacceptable.
- Redirect latency < 10ms (p99).

**Scope your design to cover:**
1. API design
2. Short code generation strategy (hashing vs. base-62 encoding of an auto-incremented ID)
3. Data model and database choice
4. Caching layer for frequently accessed redirects
5. Handling expiry and deletions`,
    category: "system_design",
    difficulty: "medium",
    company_tags: ["Amazon", "Google", "Meta"],
    topic_tags: ["caching", "hashing", "database-design"],
    hints: [
      "Start with a simple auto-increment ID encoded in base-62 for short, collision-free codes.",
      "A SQL DB can store mappings; a cache (Redis) absorbs the 10:1 read load.",
      "For high availability, discuss replication and what happens if the ID generator becomes a single point of failure.",
    ],
    solution: null,
  },
  {
    title: "Design a Rate Limiter",
    description: `Design a rate limiter that restricts how many requests a client (identified by IP or API key) can make within a time window.

**Requirements:**
- Support multiple rate limiting algorithms (token bucket, sliding window log, fixed window counter).
- Work correctly in a distributed system with multiple API gateway nodes.
- Latency impact must be minimal (< 1ms added overhead).
- Return \`HTTP 429 Too Many Requests\` when the limit is exceeded.

**Discuss:**
1. Trade-offs between token bucket and sliding window algorithms.
2. Where to store rate limit state (local memory vs. Redis).
3. Race conditions in distributed counters and how to handle them.
4. How to make the rate limiter fault-tolerant — what happens when Redis is down?`,
    category: "system_design",
    difficulty: "medium",
    company_tags: ["Cloudflare", "Amazon", "Stripe"],
    topic_tags: ["distributed-systems", "caching", "algorithms"],
    hints: [
      "Token bucket is memory-efficient and handles bursts; sliding window is more precise but costlier.",
      "Redis with atomic INCR/EXPIRE or a Lua script prevents race conditions across multiple gateway nodes.",
      "Consider degraded mode: fail open (allow traffic) vs. fail closed (block traffic) when the limiter store is unreachable.",
    ],
    solution: null,
  },
  {
    title: "Design a Notification System",
    description: `Design a push notification service that can send notifications across multiple channels (push, email, SMS) to tens of millions of users.

**Requirements:**
- Producers (services) publish events such as "order shipped" or "new follower".
- The notification system fans out to the correct channel(s) per user's preferences.
- Guaranteed at-least-once delivery with deduplication.
- Support for scheduling (send at a future time) and priority levels.

**Components to cover:**
1. Ingestion API and message queue topology
2. User preference storage and lookup
3. Provider integrations (APNs, FCM, SendGrid, Twilio)
4. Retry strategy and dead-letter queues
5. Tracking delivery receipts and analytics`,
    category: "system_design",
    difficulty: "medium",
    company_tags: ["Meta", "Uber", "Amazon"],
    topic_tags: ["message-queue", "fan-out", "distributed-systems"],
    hints: [
      "Decouple producers from consumers with Kafka or SQS to absorb traffic spikes.",
      "User preference lookups should be cached — they change rarely but are read on every notification.",
      "Implement idempotency keys to safely retry failed deliveries without duplicating notifications.",
    ],
    solution: null,
  },
  {
    title: "Design an API Gateway",
    description: `Design an API Gateway that acts as the single entry point for all client requests to a microservices backend.

**Core features:**
- Request routing to downstream services based on URL path.
- Authentication and authorization (JWT verification).
- Rate limiting per client.
- Request/response transformation (e.g., protocol translation, header injection).
- Load balancing and circuit breaking.
- Observability: logging, metrics, distributed tracing.

**Design considerations:**
- How does the gateway stay updated when services register/deregister?
- How do you handle versioned APIs (\`/v1/\`, \`/v2/\`)?
- Single point of failure risk and how to mitigate it.`,
    category: "system_design",
    difficulty: "medium",
    company_tags: ["Amazon", "Kong", "Google"],
    topic_tags: ["microservices", "load-balancing", "distributed-systems"],
    hints: [
      "Use a service registry (Consul, Eureka) with health checks so the gateway's routing table stays current.",
      "Circuit breakers (Hystrix or similar) prevent a slow downstream service from cascading into a full outage.",
      "Deploy multiple gateway instances behind a load balancer to eliminate the single point of failure.",
    ],
    solution: null,
  },

  // ── System Design ── Hard ───────────────────────────────────────────────────
  {
    title: "Design a Chat Application",
    description: `Design a real-time chat system similar to WhatsApp or Slack that supports one-on-one and group conversations.

**Functional Requirements:**
- Users can send and receive messages in real time.
- Support for group chats (up to 1,000 members).
- Message history is persisted and paginated.
- Online/offline presence indicators.
- Message delivery receipts (sent, delivered, read).

**Non-Functional Requirements:**
- Low latency: message delivery < 100ms.
- 500 million daily active users; average 40 messages/day per user.
- High availability — messages must never be lost.

**Design areas:**
1. Transport protocol (WebSocket vs. long polling)
2. Message storage model and choice of database
3. Fan-out strategy for group messages
4. Presence service design
5. Media/file attachments at scale`,
    category: "system_design",
    difficulty: "hard",
    company_tags: ["Meta", "Slack", "Microsoft"],
    topic_tags: ["websockets", "database-design", "fan-out", "distributed-systems"],
    hints: [
      "WebSockets maintain a persistent bidirectional connection — ideal for chat. Each server node manages a pool of connections.",
      "For large groups, fan-out-on-write (writing to each member's inbox at send time) is faster to read but costly for large groups. Fan-out-on-read is cheaper to write but slower to read.",
      "Cassandra's wide-row model is well-suited for chat: partition by conversation ID, cluster by timestamp.",
    ],
    solution: null,
  },
  {
    title: "Design Twitter's News Feed",
    description: `Design the news feed (timeline) feature for a Twitter-like social network, where users see a ranked stream of tweets from accounts they follow.

**Scale:**
- 300 million monthly active users; 200 million DAU.
- 500 million tweets posted per day.
- A user may follow up to 5,000 accounts.
- Feed reads far outnumber writes (100:1 read-to-write ratio).

**Discuss:**
1. Fan-out strategies: fan-out-on-write (push) vs. fan-out-on-read (pull)
2. Handling celebrity users (accounts with millions of followers)
3. Feed ranking and personalization at scale
4. Data storage: what to cache vs. what to persist
5. Eventual consistency trade-offs in the feed`,
    category: "system_design",
    difficulty: "hard",
    company_tags: ["Twitter/X", "LinkedIn", "Meta"],
    topic_tags: ["feed-ranking", "caching", "fan-out", "distributed-systems"],
    hints: [
      "For regular users, fan-out-on-write pre-computes the feed at tweet time — reads are cheap. For celebrities, use fan-out-on-read to avoid write amplification to millions of followers.",
      "Cache the most recent N tweets per user in Redis; serve cold/older feed pages from a persistent store.",
      "A hybrid approach: push for regular accounts, pull for celebrities, merge at read time.",
    ],
    solution: null,
  },
  {
    title: "Design a Distributed Cache",
    description: `Design a distributed in-memory cache like Redis Cluster or Memcached that multiple application servers can share.

**Requirements:**
- Sub-millisecond get/set latency.
- Support for TTL-based eviction.
- Horizontal scalability: easily add or remove cache nodes.
- Fault tolerance: a node failure should not cause a full cache miss storm.
- Cache consistency semantics: discuss strong vs. eventual consistency.

**Cover:**
1. Data partitioning strategy (consistent hashing)
2. Replication model (leader-follower vs. multi-leader)
3. Eviction policies (LRU, LFU, random)
4. Handling hot keys
5. Cache invalidation strategies (write-through, write-behind, cache-aside)`,
    category: "system_design",
    difficulty: "hard",
    company_tags: ["Amazon", "Google", "Meta"],
    topic_tags: ["caching", "consistent-hashing", "distributed-systems"],
    hints: [
      "Consistent hashing minimises data movement when nodes are added or removed — only a fraction of keys need to be remapped.",
      "Virtual nodes (vnodes) improve load distribution when real nodes have heterogeneous capacity.",
      "Hot keys can be mitigated by local application-level caching, key replication across multiple shards, or request coalescing.",
    ],
    solution: null,
  },
  {
    title: "Design a Key-Value Store",
    description: `Design a distributed key-value store like DynamoDB or Cassandra capable of storing and retrieving billions of records with high availability and partition tolerance.

**Requirements:**
- Support for get(key), put(key, value), delete(key).
- Strong or eventual consistency — the choice must be configurable.
- Survives node failures without data loss.
- Horizontal scalability to petabytes.

**Design areas:**
1. Partitioning and replication strategy
2. Consistency levels (quorum reads/writes)
3. Conflict resolution (vector clocks, last-write-wins)
4. Compaction and storage engine internals (LSM tree vs. B-tree)
5. Anti-entropy and gossip protocol for node coordination`,
    category: "system_design",
    difficulty: "hard",
    company_tags: ["Amazon", "Google", "Meta"],
    topic_tags: ["distributed-systems", "consensus", "storage-engine"],
    hints: [
      "DynamoDB and Cassandra use consistent hashing with replication factor N — a write goes to N nodes.",
      "Quorum: with N replicas, a write quorum W and read quorum R satisfying W + R > N guarantees strong consistency.",
      "LSM trees (Log-Structured Merge) are write-optimised — sequential disk writes with periodic compaction — great for write-heavy workloads.",
    ],
    solution: null,
  },

  // ── Behavioral ── Easy ──────────────────────────────────────────────────────
  {
    title: "Tell me about a time you disagreed with your manager",
    description: `This question assesses your ability to navigate conflict professionally, advocate for your viewpoint with data, and ultimately respect team decisions even when you disagree.

**What interviewers look for:**
- You can articulate the disagreement clearly and without blame.
- You relied on facts and reasoning, not just opinion.
- You understood your manager's perspective.
- You reached a resolution — either you changed your mind or reached a compromise.
- The relationship remained intact afterward.

**Use the STAR format:** Situation → Task → Action → Result.`,
    category: "behavioral",
    difficulty: "easy",
    company_tags: ["Amazon", "Google", "Meta", "Microsoft"],
    topic_tags: ["conflict-resolution", "communication", "leadership"],
    hints: [
      "Choose a real disagreement about a technical or process decision — not a personal conflict.",
      "Quantify the impact where possible ('our release was delayed by two weeks until we aligned').",
      "Show what you learned: either your perspective evolved, or you successfully persuaded with evidence.",
    ],
    solution: null,
  },
  {
    title: "Describe your biggest professional failure",
    description: `Interviewers ask this to assess self-awareness, resilience, and your capacity to learn from mistakes. A generic or blame-deflecting answer is a red flag.

**What interviewers look for:**
- You own the failure — no blaming teammates or circumstances.
- You understand what went wrong and why.
- You took concrete action to address the situation.
- You extracted a lasting lesson and changed your behaviour.

**Avoid:**
- Humble-brag failures ("I work too hard")
- Failures that are actually successes in disguise
- Anything that raises serious concerns about judgement`,
    category: "behavioral",
    difficulty: "easy",
    company_tags: ["Amazon", "Google", "Meta", "Microsoft"],
    topic_tags: ["self-awareness", "growth-mindset", "accountability"],
    hints: [
      "Pick a genuine failure with real impact, not a trivial mistake.",
      "Focus the majority of your answer on what you did after the failure and what changed.",
      "Keep the tone matter-of-fact and forward-looking, not self-flagellating.",
    ],
    solution: null,
  },
  {
    title: "How do you prioritize when you have competing deadlines?",
    description: `This question probes your time-management, communication, and decision-making skills. Interviewers want to see a repeatable framework, not just a one-off story.

**What they look for:**
- A clear method for assessing urgency vs. importance.
- Proactive communication with stakeholders when trade-offs occur.
- Evidence of managing expectations rather than silently missing deadlines.
- Flexibility to re-prioritize when business context changes.

Provide a concrete example that illustrates your framework in action.`,
    category: "behavioral",
    difficulty: "easy",
    company_tags: ["Amazon", "Google", "Meta", "Microsoft"],
    topic_tags: ["time-management", "communication", "decision-making"],
    hints: [
      "Describe your decision criteria: business impact, dependency chains, who is blocked.",
      "Mention how you communicate trade-offs to stakeholders early, before deadlines slip.",
      "Include an example where deprioritizing one item led to a better outcome for the team overall.",
    ],
    solution: null,
  },

  // ── Behavioral ── Medium ────────────────────────────────────────────────────
  {
    title: "Tell me about a time you led a cross-functional project",
    description: `This question is common for senior and staff roles. It tests your ability to drive alignment, manage ambiguity, and deliver results across team boundaries without direct authority.

**What interviewers look for:**
- Clear ownership: you drove the project, not just contributed to it.
- How you built consensus across teams with different priorities.
- How you managed blockers, scope changes, or timeline risks.
- Measurable outcomes.

**Relevant Amazon Leadership Principles:** Earn Trust, Deliver Results, Bias for Action, Ownership.`,
    category: "behavioral",
    difficulty: "medium",
    company_tags: ["Amazon", "Google", "Meta"],
    topic_tags: ["leadership", "cross-functional", "project-management"],
    hints: [
      "Quantify scope: how many teams, how many months, what was the business impact.",
      "Describe a specific moment where alignment broke down and explain how you restored it.",
      "Highlight how you influenced without authority — persuasion, data, building trust.",
    ],
    solution: null,
  },
  {
    title: "Describe a time you dealt with a difficult team member",
    description: `Interviewers use this question to evaluate emotional intelligence, conflict resolution skills, and your ability to maintain team health under stress.

**What they look for:**
- You tried to understand the root cause of the other person's behaviour.
- You addressed the issue directly but professionally.
- The situation improved — or if it didn't, you escalated appropriately.
- You maintained your own performance and team morale throughout.

**Avoid:** making the person sound incompetent or yourself the sole hero.`,
    category: "behavioral",
    difficulty: "medium",
    company_tags: ["Amazon", "Google", "Microsoft"],
    topic_tags: ["conflict-resolution", "emotional-intelligence", "teamwork"],
    hints: [
      "Lead with empathy — what was going on for the other person? Were there external pressures?",
      "Show the specific steps you took: one-on-one conversation, setting clear expectations, follow-up.",
      "Describe the outcome for both the project and the professional relationship.",
    ],
    solution: null,
  },
  {
    title: "How do you handle receiving critical feedback?",
    description: `This question tests your growth mindset, self-awareness, and resilience. Interviewers — especially at Google and Meta — value engineers who actively seek feedback and act on it.

**What they look for:**
- You don't get defensive; you treat feedback as information.
- You separate the emotion from the substance.
- You take action and follow up.
- You can recall a specific example where feedback significantly changed your approach.`,
    category: "behavioral",
    difficulty: "medium",
    company_tags: ["Google", "Meta", "Microsoft"],
    topic_tags: ["growth-mindset", "self-awareness", "feedback"],
    hints: [
      "Use a real example where the feedback was genuinely hard to hear but ultimately valuable.",
      "Walk through your process: initial reaction, reflection, the action you took, the outcome.",
      "End by describing how the experience changed how you now actively solicit feedback.",
    ],
    solution: null,
  },
  {
    title: "Tell me about your greatest technical achievement",
    description: `This question gives you the opportunity to showcase depth, impact, and ownership. It's often used to calibrate your level and the complexity of problems you've worked on.

**What interviewers look for:**
- Technical depth and sound decision-making.
- Clear business or user impact — not just technical elegance.
- Your specific role and contribution (not "we did this").
- Challenges you overcame and why your approach was the right one.

**Tailor your story to the seniority level of the role you're applying for.** A junior engineer's story should focus on individual implementation; a senior engineer's story should include system-level thinking and cross-team impact.`,
    category: "behavioral",
    difficulty: "medium",
    company_tags: ["Amazon", "Google", "Meta", "Microsoft"],
    topic_tags: ["technical-depth", "impact", "ownership"],
    hints: [
      "Lead with the outcome (e.g., 'I reduced p99 API latency by 60%'), then explain how.",
      "Include at least one technical decision point where you chose between alternatives and explain the reasoning.",
      "Quantify impact: latency, cost savings, number of users affected, engineer hours saved.",
    ],
    solution: null,
  },

  // ── SQL ── Easy ─────────────────────────────────────────────────────────────
  {
    title: "Find the Second Highest Salary",
    description: `Given a table \`employees\`:

\`\`\`sql
employees(id INT, name VARCHAR, salary INT)
\`\`\`

Write a query to find the second highest distinct salary. If no second highest salary exists, return \`NULL\`.

**Example:**
\`\`\`
employees:
| id | name    | salary |
|----|---------|--------|
| 1  | Alice   | 90000  |
| 2  | Bob     | 75000  |
| 3  | Charlie | 90000  |
| 4  | Diana   | 60000  |

Output: 75000
\`\`\``,
    category: "sql",
    difficulty: "easy",
    company_tags: ["Amazon", "Microsoft", "Google"],
    topic_tags: ["subquery", "aggregation", "window-functions"],
    hints: [
      "Use DISTINCT to deduplicate salaries before ranking.",
      "One approach: SELECT MAX(salary) WHERE salary < (SELECT MAX(salary) FROM employees).",
      "A cleaner approach uses a subquery with LIMIT/OFFSET or DENSE_RANK() to handle ties properly.",
    ],
    solution: `## Using DENSE_RANK (Recommended)

\`\`\`sql
SELECT salary AS SecondHighestSalary
FROM (
    SELECT salary,
           DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
    FROM employees
) ranked
WHERE rnk = 2
LIMIT 1;
\`\`\`

## Alternative: Correlated Subquery

\`\`\`sql
SELECT MAX(salary) AS SecondHighestSalary
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
\`\`\`

The correlated subquery returns NULL automatically when no second salary exists, satisfying the NULL requirement.`,
  },
  {
    title: "Find Duplicate Records in a Table",
    description: `Given a table \`user_emails\`:

\`\`\`sql
user_emails(id INT, email VARCHAR, created_at TIMESTAMP)
\`\`\`

Write a query to find all emails that appear more than once, along with the count of occurrences.

**Example output:**
\`\`\`
| email            | count |
|------------------|-------|
| alice@example.com|   3   |
| bob@example.com  |   2   |
\`\`\`

Order results by count descending.`,
    category: "sql",
    difficulty: "easy",
    company_tags: ["Meta", "Stripe", "Amazon"],
    topic_tags: ["aggregation", "group-by", "having"],
    hints: [
      "GROUP BY the column you want to check for duplicates.",
      "Use HAVING COUNT(*) > 1 to filter groups with more than one row.",
      "To retrieve the full duplicate rows (not just the email), you'll need a JOIN back to the original table.",
    ],
    solution: `## HAVING Clause

\`\`\`sql
SELECT email, COUNT(*) AS count
FROM user_emails
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY count DESC;
\`\`\`

## Retrieve All Duplicate Rows

\`\`\`sql
SELECT u.*
FROM user_emails u
INNER JOIN (
    SELECT email
    FROM user_emails
    GROUP BY email
    HAVING COUNT(*) > 1
) dups ON u.email = dups.email
ORDER BY u.email, u.created_at;
\`\`\``,
  },

  // ── SQL ── Medium ────────────────────────────────────────────────────────────
  {
    title: "Running Total with Window Functions",
    description: `Given a table \`orders\`:

\`\`\`sql
orders(order_id INT, customer_id INT, amount DECIMAL, order_date DATE)
\`\`\`

Write a query that returns each order along with:
1. The running total of \`amount\` per customer (ordered by \`order_date\`).
2. The average order amount per customer up to and including the current row.

**Example output:**
\`\`\`
| order_id | customer_id | amount | running_total | running_avg |
|----------|-------------|--------|---------------|-------------|
| 1        | 42          | 100.00 | 100.00        | 100.00      |
| 3        | 42          | 250.00 | 350.00        | 175.00      |
| 5        | 42          |  50.00 | 400.00        | 133.33      |
\`\`\``,
    category: "sql",
    difficulty: "medium",
    company_tags: ["Amazon", "Microsoft", "Stripe"],
    topic_tags: ["window-functions", "aggregation", "cumulative"],
    hints: [
      "Use SUM() OVER with PARTITION BY customer_id and ORDER BY order_date.",
      "The default window frame is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which gives a cumulative sum.",
      "Pair with AVG() OVER the same partition/order for the running average.",
    ],
    solution: `\`\`\`sql
SELECT
    order_id,
    customer_id,
    amount,
    SUM(amount) OVER (
        PARTITION BY customer_id
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total,
    AVG(amount) OVER (
        PARTITION BY customer_id
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_avg
FROM orders
ORDER BY customer_id, order_date;
\`\`\``,
  },
  {
    title: "Customer Retention Rate",
    description: `Given a table \`user_activity\`:

\`\`\`sql
user_activity(user_id INT, activity_month DATE)
\`\`\`

Where \`activity_month\` is the first day of each month a user was active.

Write a query to calculate the **monthly retention rate** — the percentage of users active in month M who were also active in month M+1.

**Example output:**
\`\`\`
| month      | active_users | retained_next_month | retention_rate |
|------------|--------------|---------------------|----------------|
| 2024-01-01 | 1000         | 650                 | 65.00%         |
| 2024-02-01 | 900          | 540                 | 60.00%         |
\`\`\``,
    category: "sql",
    difficulty: "medium",
    company_tags: ["Stripe", "Shopify", "Amazon"],
    topic_tags: ["window-functions", "self-join", "aggregation", "date-functions"],
    hints: [
      "Self-join the table: join month M to month M+1 on user_id and activity_month = the next month.",
      "COUNT(DISTINCT user_id) in month M gives the denominator; COUNT(DISTINCT joined_user_id) gives the numerator.",
      "Use DATE_TRUNC or date arithmetic to compute the next month value consistently.",
    ],
    solution: `\`\`\`sql
SELECT
    a.activity_month AS month,
    COUNT(DISTINCT a.user_id) AS active_users,
    COUNT(DISTINCT b.user_id) AS retained_next_month,
    ROUND(
        100.0 * COUNT(DISTINCT b.user_id) / NULLIF(COUNT(DISTINCT a.user_id), 0),
        2
    ) AS retention_rate
FROM user_activity a
LEFT JOIN user_activity b
    ON a.user_id = b.user_id
    AND b.activity_month = a.activity_month + INTERVAL '1 month'
GROUP BY a.activity_month
ORDER BY a.activity_month;
\`\`\``,
  },

  // ── SQL ── Hard ─────────────────────────────────────────────────────────────
  {
    title: "Recursive CTE for Org Hierarchy",
    description: `Given a table \`employees\`:

\`\`\`sql
employees(id INT, name VARCHAR, manager_id INT)
\`\`\`

Where \`manager_id\` is NULL for the CEO. Write a query that:
1. Returns every employee with their full reporting path from the root (CEO).
2. Includes the depth level in the hierarchy.
3. Orders by the path so the tree is readable top-down.

**Example output:**
\`\`\`
| id | name    | depth | path                      |
|----|---------|-------|---------------------------|
| 1  | CEO     | 0     | CEO                       |
| 2  | VP Eng  | 1     | CEO > VP Eng              |
| 4  | Lead    | 2     | CEO > VP Eng > Lead       |
| 5  | Engineer| 3     | CEO > VP Eng > Lead > Eng |
\`\`\``,
    category: "sql",
    difficulty: "hard",
    company_tags: ["SAP", "Oracle", "Microsoft"],
    topic_tags: ["recursive-cte", "hierarchical-data", "string-aggregation"],
    hints: [
      "A recursive CTE has an anchor (root nodes where manager_id IS NULL) and a recursive member that joins each employee to its manager.",
      "Build the path string by concatenating the parent path with ' > ' and the current employee name.",
      "Track depth by incrementing a counter in each recursive step.",
    ],
    solution: `\`\`\`sql
WITH RECURSIVE org_tree AS (
    -- Anchor: top-level employees (CEO)
    SELECT
        id,
        name,
        manager_id,
        0 AS depth,
        name::TEXT AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: each employee's direct reports
    SELECT
        e.id,
        e.name,
        e.manager_id,
        ot.depth + 1,
        ot.path || ' > ' || e.name
    FROM employees e
    INNER JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT id, name, depth, path
FROM org_tree
ORDER BY path;
\`\`\``,
  },
];

export async function POST() {
  try {
    const supabase = getAdminClient();

    // Check if questions already exist to keep the operation idempotent
    const { count, error: countError } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    let questionIds: string[] = [];

    if (count && count > 0) {
      // Questions exist — fetch their IDs to potentially seed a daily challenge
      const { data: existing } = await supabase.from("questions").select("id").limit(10);
      questionIds = (existing ?? []).map((q) => q.id);
    } else {
      const { data, error } = await supabase
        .from("questions")
        .insert(SEED_QUESTIONS)
        .select("id");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      questionIds = (data ?? []).map((q) => q.id);
    }

    // Seed today's daily challenge if it doesn't exist
    const today = new Date().toISOString().split("T")[0];
    const { data: existingChallenge } = await supabase
      .from("daily_challenges")
      .select("id")
      .eq("challenge_date", today)
      .maybeSingle();

    if (!existingChallenge && questionIds.length > 0) {
      // Pick a system_design question if available, otherwise first question
      const { data: sdQuestions } = await supabase
        .from("questions")
        .select("id")
        .eq("category", "system_design")
        .limit(1);

      const challengeQuestionId =
        sdQuestions?.[0]?.id ?? questionIds[0];

      await supabase.from("daily_challenges").insert({
        question_id: challengeQuestionId,
        challenge_date: today,
      });
    }

    return NextResponse.json({
      message: count && count > 0
        ? `Questions already seeded (${count}). Daily challenge ensured for today.`
        : `Successfully seeded ${questionIds.length} questions and today's daily challenge.`,
      count: count ?? questionIds.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
