const both = ["sde", "business"];
const external = (id, title, kind, topic, source, url, summary, access, tracks) => ({
  id, title, kind, topic, source, url, summary, access, tracks,
});
const lesson = (id, title, topic, tracks, summary, sections, answer) => ({
  id, title, topic, tracks, summary, sections, answer,
  kind: "In-app lesson", source: "Level Up Club original practice", access: "Free · study here",
});

const problems = [
  ["substring", "Longest Substring Without Repeating Characters", "longest-substring-without-repeating-characters", "Sliding window"],
  ["prefix", "Subarray Sum Equals K", "subarray-sum-equals-k", "Prefix sums"],
  ["two-sum", "Two Sum", "two-sum", "Hashmaps"],
  ["three-sum", "3Sum", "3sum", "Two pointers"],
  ["intervals", "Merge Intervals", "merge-intervals", "Intervals"],
  ["stack", "Valid Parentheses", "valid-parentheses", "Stacks"],
  ["binary", "Search in Rotated Sorted Array", "search-in-rotated-sorted-array", "Binary search"],
  ["reverse", "Reverse Linked List", "reverse-linked-list", "Linked lists"],
  ["cycle", "Linked List Cycle", "linked-list-cycle", "Linked lists"],
  ["product", "Product of Array Except Self", "product-of-array-except-self", "Arrays"],
  ["tree", "Binary Tree Level Order Traversal", "binary-tree-level-order-traversal", "Trees"],
  ["depth", "Maximum Depth of Binary Tree", "maximum-depth-of-binary-tree", "Trees"],
  ["heap", "Top K Frequent Elements", "top-k-frequent-elements", "Heaps"],
  ["islands", "Number of Islands", "number-of-islands", "Graphs"],
  ["course", "Course Schedule", "course-schedule", "Topological order"],
  ["subsets", "Subsets", "subsets", "Backtracking"],
  ["climb", "Climbing Stairs", "climbing-stairs", "Dynamic programming"],
  ["robber", "House Robber", "house-robber", "Dynamic programming"],
  ["coins", "Coin Change", "coin-change", "Dynamic programming"],
  ["group", "Group Anagrams", "group-anagrams", "Hashmaps"],
  ["cache", "LRU Cache", "lru-cache", "Implementation"],
  ["water", "Container With Most Water", "container-with-most-water", "Two pointers"],
  ["daily", "Daily Temperatures", "daily-temperatures", "Monotonic stacks"],
  ["insert", "Insert Interval", "insert-interval", "Intervals"],
  ["window", "Minimum Size Subarray Sum", "minimum-size-subarray-sum", "Sliding window"],
  ["kth", "Kth Largest Element in an Array", "kth-largest-element-in-an-array", "Heaps"],
  ["matrix", "Rotting Oranges", "rotting-oranges", "Graph BFS"],
  ["combination", "Combination Sum", "combination-sum", "Backtracking"],
  ["bst", "Validate Binary Search Tree", "validate-binary-search-tree", "Trees"],
  ["merge-list", "Merge Two Sorted Lists", "merge-two-sorted-lists", "Linked lists"],
  ["palindrome", "Valid Palindrome", "valid-palindrome", "Two pointers"],
].map(([id, title, slug, topic]) => external(
  `lc-${id}`, title, "Problem", topic, "LeetCode", `https://leetcode.com/problems/${slug}/`,
  "Attempt first without solutions. Explain your invariant, test edge cases, and review time and space complexity.",
  "Free problem · account generally needed to submit; use CSES if access is blocked", ["sde"],
));

export const resources = [
  ...problems,
  external("cses", "CSES problem set", "Practice collection", "Algorithms", "CSES", "https://cses.fi/problemset/", "Alternative problems for unseen checkpoints or when LeetCode is unavailable. Choose from sorting/searching, trees, graphs, and DP.", "Free to read · account to submit", ["sde"]),
  external("cses-sum", "CSES: Sum of Two Values", "Problem", "Hashmaps", "CSES", "https://cses.fi/problemset/task/1640", "A concrete alternative for practicing lookup-based pair search; compare sorting and hashing.", "Free to read · account to submit", ["sde"]),
  external("mit-notes", "MIT 6.006 algorithm lecture notes", "Read", "Algorithms", "MIT OpenCourseWare", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/", "Use the relevant lecture for hashing, trees, heaps, BFS/DFS, or dynamic programming. Read selectively, then solve.", "Free · no account", ["sde"]),
  external("mit-watch", "MIT 6.006 lecture videos", "Watch", "Algorithms", "MIT OpenCourseWare", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/video_galleries/lecture-videos/", "Official lectures with video and course materials. Pick the day's topic; a full course is not a daily assignment.", "Free · video lengths vary", ["sde"]),
  external("mit-dp", "MIT: Dynamic Programming, Part 1", "Watch", "Dynamic programming", "MIT OpenCourseWare / YouTube", "https://www.youtube.com/watch?v=r4-cftqTcdI", "Lecture 15 introduces the state/recurrence/base-case approach. Try your recurrence before watching the walkthrough.", "Free · YouTube may show ads or require consent", ["sde"]),
  external("neetcode", "NeetCode walkthrough playlists", "Watch", "Algorithms", "NeetCode / YouTube", "https://www.youtube.com/@NeetCode/playlists", "Choose the matching pattern after an independent attempt. This is a channel's playlists, not a single prescribed lesson.", "Free videos · optional paid offerings are not required", ["sde"]),
  external("primer", "The System Design Primer", "Read", "System design", "donnemartin / GitHub", "https://github.com/donnemartin/system-design-primer", "Compare architecture patterns and practice design prompts. Do not copy a diagram without explaining requirements and tradeoffs.", "Free · community reference, not an Amazon rubric", ["sde"]),
  external("bytebytego", "ByteByteGo architecture videos", "Watch", "System design", "ByteByteGo / YouTube", "https://www.youtube.com/@ByteByteGo/videos", "Short visual explanations of queues, caching, databases, and distributed systems. Use as a supplement, then justify decisions yourself.", "Free videos · optional paid offerings are not required", ["sde"]),
  external("sre", "Google SRE book", "Read", "Reliability", "Google", "https://sre.google/sre-book/table-of-contents/", "Read monitoring, service objectives, overload, and incident chapters to explain reliability in design follow-ups.", "Free online book", ["sde"]),
  external("monitoring", "Monitoring distributed systems", "Read", "Telemetry", "Google SRE", "https://sre.google/sre-book/monitoring-distributed-systems/", "Connect useful signals to user symptoms, actionable alerts, and failure investigation.", "Free · no account", ["sde"]),
  external("retries", "Timeouts, retries, and backoff with jitter", "Read", "Reliability", "Amazon Builders' Library", "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/", "Understand retry amplification, timeouts, jitter, and when a side effect makes retry unsafe.", "Free · no AWS account needed to read", ["sde"]),
  external("delivery", "At-least-once message delivery", "Read", "Queues", "AWS documentation", "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html", "A concrete delivery-contract example: consumers must handle duplicate messages. Generalize the lesson beyond one product.", "Free documentation · no cloud account needed", ["sde"]),
  external("dlq", "Dead-letter queue behavior", "Read", "Queues", "AWS documentation", "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html", "Review redrive, retry limits, retention, and operational handling of poison messages.", "Free documentation · no cloud account needed", ["sde"]),
  external("redirect", "HTTP redirects", "Read", "Routing", "MDN", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections", "Clarify temporary/permanent redirects, request methods, caching, and client/server routing behavior.", "Free · no account", ["sde"]),
  external("datetime", "IANA time-zone database", "Read", "Scheduling", "IANA", "https://www.iana.org/time-zones", "Understand why local wall-clock schedules need named time zones and updated rules, not a permanent UTC offset.", "Free reference", ["sde"]),
  external("amazon-sde", "Amazon SDE III interview preparation", "Read", "Interview format", "Amazon Jobs", "https://www.amazon.jobs/content/en/how-we-hire/sde-iii-interview-prep", "Official guidance. Confirm the actual format and allowed coding language with the recruiter.", "Free · no account to read", ["sde"]),
  external("amazon-hire", "Amazon: How we hire", "Read", "Interview format", "Amazon Jobs", "https://www.amazon.jobs/content/en/how-we-hire", "Use the official hiring overview alongside the actual role description and recruiter instructions.", "Free · no account to read", both),
  external("principles", "Amazon Leadership Principles", "Read", "Leadership", "Amazon Jobs", "https://www.amazon.jobs/content/en/our-workplace/leadership-principles", "Read the actual principles, then select truthful examples. Avoid memorizing canned principle phrases.", "Free · no account to read", both),
  external("bcg-cases", "BCG case-interview preparation", "Practice collection", "Business cases", "BCG Careers", "https://careers.bcg.com/global/en/case-interview-preparation", "Official case guidance and preparation activities. Use the original in-app cases for immediate no-signup practice.", "Free guidance · optional job simulations may need registration", ["business"]),
  external("project-poster", "Project Poster play", "Read", "Program management", "Atlassian Team Playbook", "https://www.atlassian.com/team-playbook/plays/project-poster", "Clarify the problem, assumptions, validation, and proposed solution before committing to a program.", "Free guide · a product account is not needed to read", ["business"]),
  external("roles", "Roles and responsibilities play", "Read", "Program management", "Atlassian Team Playbook", "https://www.atlassian.com/team-playbook/plays/roles-and-responsibilities", "Expose ownership gaps and overlaps, then agree who decides and who delivers.", "Free guide · no account needed to read", ["business"]),
  external("retro", "Retrospective play", "Read", "Program management", "Atlassian Team Playbook", "https://www.atlassian.com/team-playbook/plays/retrospective", "Turn a review into concrete changes with owners and follow-through, rather than a list of complaints.", "Free guide · no account needed to read", ["business"]),
  external("excel", "Excel help and learning", "Read", "Excel", "Microsoft Support", "https://support.microsoft.com/en-us/excel", "Official reference for formulas, pivots, tables, and charts. Reading is public; Excel software may require a license.", "Free reference · software/license separate", ["business"]),
  external("xlookup", "XLOOKUP reference", "Read", "Excel", "Microsoft Support", "https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929", "Practice exact-match lookups and missing-key behavior on the in-app synthetic data. Check version support.", "Free reference · compatible Excel needed to execute", ["business"]),
  external("excel-watch", "ExcelIsFun tutorial playlists", "Watch", "Excel", "ExcelIsFun / YouTube", "https://www.youtube.com/@excelisfun/playlists", "Find focused tutorials on SUMIFS, XLOOKUP, pivots, Power Query, and forecasting. These are curated channel playlists, not a single lesson.", "Free videos · YouTube may show ads or consent", ["business"]),
  external("powerbi", "Get started building with Power BI", "Read", "Power BI", "Microsoft Learn", "https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/", "Official learning module on reports, models, and the workflow. Read without signing in; exercises or saved training progress may need software/account access.", "Free reading · Power BI software/account requirements vary", ["business"]),
  external("bi-watch", "Guy in a Cube learning playlists", "Watch", "Power BI", "Guy in a Cube / YouTube", "https://www.youtube.com/@GuyInACube/playlists", "Use a targeted data-modeling, DAX, or report-design playlist after drafting your own KPI dashboard.", "Free videos · software/account requirements vary", ["business"]),
  external("sql-start", "SQLBolt lesson 1: SELECT", "Problem", "SQL", "SQLBolt", "https://sqlbolt.com/lesson/select_queries_introduction", "An interactive browser exercise for selecting and filtering data. Then apply the idea to the original analytics lab.", "Free exercises · no account", ["business"]),
  external("sql-joins", "SQLBolt lesson 6: JOINs", "Problem", "SQL", "SQLBolt", "https://sqlbolt.com/lesson/select_queries_with_joins", "Practice multi-table queries and reason about row counts before joining business data.", "Free exercises · no account", ["business"]),
  external("sql-aggregate", "SQLBolt lesson 10: aggregates", "Problem", "SQL", "SQLBolt", "https://sqlbolt.com/lesson/select_queries_with_aggregates", "Practice aggregate functions; explain the grain and denominator before interpreting a KPI.", "Free exercises · no account", ["business"]),
  external("forecast-book", "Forecasting: Principles and Practice", "Read", "Forecasting", "Hyndman & Athanasopoulos / OTexts", "https://otexts.com/fpp3/", "Use the concepts on baselines, time-series validation, accuracy, and regression. The book uses R; no R or Python is assigned in this track.", "Free online book · focus on concepts", ["business"]),
  external("forecast-excel", "FORECAST.ETS reference and limits", "Read", "Forecasting", "Microsoft Support", "https://support.microsoft.com/en-us/office/forecast-ets-function-15389b8b-677e-4fbd-bd95-21d464333f41", "Official syntax and assumptions. FORECAST.ETS is not available in Excel web, iOS, or Android; use the in-app baseline exercise on mobile.", "Free reference · desktop Excel feature", ["business"]),
  external("vba", "Excel VBA reference", "Read", "Excel", "Microsoft Learn", "https://learn.microsoft.com/en-us/office/vba/api/overview/excel", "Only if the actual role needs VBA: review object models and controls, test on synthetic files, and never enable untrusted macros.", "Free documentation · desktop Excel needed for macros", ["business"]),

  lesson("coding-loop", "The coding practice loop", "Algorithms", ["sde"], "A reusable approach for every problem, with a compact miss log.",
    [
      ["Before coding", "Restate the inputs and expected output in your own words. Clarify invalid input, duplicates, bounds, and mutation. Describe a brute-force baseline, then state the invariant of your improvement."],
      ["During and after", "Write complete syntax in your chosen supported language. Dry-run a minimal example, a boundary, and an adversarial case. Explain both time and auxiliary space, including recursion."],
      ["Miss log", "In the day's private scratchpad record: pattern; failed assumption; smallest failing input; repair; next re-solve date. Re-solve without notes, then use a variation. Do not mark done just for watching a solution."],
    ]),
  lesson("design-canvas", "A design interview on one page", "System design", ["sde"], "Use this canvas for links, notifications, telemetry, schedulers, and unfamiliar prompts.",
    [
      ["Clarify", "Who is the customer? What are the core operations and non-goals? Which reliability, latency, retention, privacy, and consistency requirements actually matter? Derive any scale estimates from stated assumptions."],
      ["Sketch", "Define APIs, entities, keys, and access patterns. Draw the request/data flow. Explain why each component exists, then choose one meaningful bottleneck or consistency boundary to explore."],
      ["Stress and ship", "Inject duplicates, partial failures, overload, and stale caches. Cover authorization and data minimization. Finish with observability, staged rollout, verification, rollback, and a limitation of your approach."],
    ]),
  lesson("reliable-workers", "Retry lab: a duplicate notification", "Reliability", ["sde"], "Original prompt: a worker sends a message, then crashes before acknowledging it.",
    [
      ["Try it", "The broker redelivers the job. Sketch the states and decide what the idempotency key represents. Explain which side effects can be repeated safely and how long deduplication records must live."],
      ["Add pressure", "Now the provider returns timeouts for 15 minutes. Set retry bounds, exponential backoff with jitter, an overall deadline, dead-letter handling, and a replay mechanism. Explain how you will avoid a retry storm."],
    ], "A broker acknowledgement is not proof of exactly-once delivery to an external provider. Persist a stable operation ID and status; use provider-side idempotency when available. Bound retries, observe failures, and describe the remaining ambiguity if a provider times out after accepting the send."),
  lesson("cache-lab", "Implementation lab: a tiny LRU cache", "Implementation", ["sde"], "Original specification to implement and test in your chosen language.",
    [
      ["Contract", "Implement get(key) and put(key, value) with capacity 2; get returns a distinct missing result. A successful get and every put make the key most recently used. Inserting a new key at capacity evicts the least recently used key. Require expected O(1) operations."],
      ["Test sequence", "put(A,1), put(B,2), get(A), put(C,3), get(B), put(A,4), get(A). Specify the policy for capacity 0 and invalid keys. Explain why a map alone cannot maintain recency efficiently."],
      ["Concurrency follow-up", "State whether your cache is single-threaded. If shared, protect map/list updates as one invariant. This is a local cache, not a distributed cache or rate limiter."],
    ], "The sequence returns 1 for the first get(A), missing for get(B), and 4 for the final get(A). A hashmap plus doubly linked list supports lookup and recency updates. Updating an existing key must not increase size; eviction must remove it from both structures."),
  lesson("star", "A truthful STAR worksheet", "Leadership", both, "Prepare evidence here; keep actual personal stories in your device-local notes.",
    [
      ["Build the answer", "Situation: one or two sentences of relevant context. Task: your responsibility and constraint. Action: the decisions and actions you personally took, including alternatives. Result: measured or honestly qualitative outcome plus learning."],
      ["Pressure-test", "What did you do versus the team? Why that option? Who disagreed? What failed? What was the evidence? What would you change now? If a number is uncertain, qualify it rather than inventing it."],
      ["Practice prompts", "Describe a mistake you owned; a decision changed by evidence; a customer problem; a disagreement handled respectfully; a mechanism simplified; a result delivered under constraints. Use different truthful examples when the question requires it."],
    ]),
  lesson("mock", "Run and repair a mock", "Interview practice", both, "Use a timer and a new prompt. This is a learning rubric, not a hiring cutoff.",
    [
      ["Run", "Choose a fresh prompt from today's resources. Work aloud without solution tabs. Leave time for testing or checking calculations and for a concise recommendation. For a longer session, use three rounds with breaks."],
      ["Review", "Engineering: clarity, correctness, tests, tradeoffs, reliability. Business: structure, quantitative accuracy, judgment, mechanisms, influence. Both: ownership, evidence, and direct answers."],
      ["Repair", "Write the single highest-impact gap and its cause. Rework it without notes, then test a variation. Record what you can now do that you could not do before."],
    ]),
  lesson("program-canvas", "Program plan and operating-review template", "Program management", ["business"], "An original reusable template for launch, transformation, and stakeholder exercises.",
    [
      ["One-page program", "Customer/problem → measurable outcome → scope/non-goals → milestones/exit criteria → owners and decision rights → dependencies → risks/mitigations → adoption/rollout. State assumptions explicitly."],
      ["WBR / MBR", "Show baseline, target, trend, variance, and data caveats. Investigate the biggest driver; record an action with owner, date, and expected effect. A weekly review supports fast action; a monthly review examines strategic trajectory and resources."],
      ["Escalation", "Write: decision needed; impact of waiting; viable options; recommended option and tradeoff; decision owner; deadline. A red status without an actionable ask is incomplete."],
    ]),
  lesson("kpi-canvas", "KPI tree and a falling-conversion drill", "Metrics", ["business"], "Original exercise with input/output metrics and a deliberately misleading aggregate.",
    [
      ["Define before comparing", "For each metric state customer outcome, formula, numerator, denominator, grain, window, source, owner, cadence, target, and guardrail. Separate controllable inputs from outcomes."],
      ["Try it", "Last month: 100 qualified leads, 20 wins. This month: 200 qualified leads, 30 wins. Calculate conversion and wins growth. Decide whether performance improved; ask for channel mix and lead-quality evidence before concluding."],
      ["Investigate", "Check definition/refresh changes first. Segment by channel, territory, cohort, price, and funnel stage. Propose a test of the leading hypothesis and a metric to detect unintended effects."],
    ], "Conversion fell from 20% to 15% (5 percentage points; a 25% relative decline), while wins grew 50%. Neither alone proves business improvement or deterioration: inspect contribution, cost, cohort mix, and capacity."),
  lesson("profit-case", "Case: a small industrial distributor", "Business cases", ["business"], "Original profitability case. All numbers are hypothetical, in rupees.",
    [
      ["Prompt", "A distributor sells 1,000 units/month at ₹800 each. Variable cost is ₹500/unit and monthly fixed cost is ₹200,000. Leadership wants profit of ₹150,000/month. Diagnose the gap and compare levers."],
      ["Work it", "Calculate current profit and break-even volume. At current volume, what price achieves the target if costs stay fixed? What volume achieves it at the current price? State why these isolated sensitivities are not forecasts."],
      ["Recommend", "Consider demand elasticity, channel incentives, customer impact, supplier negotiations, capacity, and time to implement. Choose a first experiment and a stop rule."],
    ], "Current revenue ₹800,000; contribution ₹300,000; profit ₹100,000. Break-even is 666.67 units, rounded up to 667 units. A price of ₹850 at unchanged volume achieves ₹150,000 profit. At unchanged price, target volume is 1,166.67, rounded up to 1,167 units. Demand and capacity effects must be tested."),
  lesson("market-case", "Case: entering a new territory", "Commercial strategy", ["business"], "Original market-sizing and GTM drill with an explicit assumptions ledger.",
    [
      ["Prompt", "A hypothetical B2B service can reach 2,000 firms. Assume 30% fit the target segment, 20% of those adopt in year one, and annual revenue is ₹60,000 per customer. Estimate the year-one opportunity."],
      ["Stress it", "Vary adoption from 10% to 30%. Compare direct sales, partners, and a small pilot. Specify acquisition cost, contribution, onboarding capacity, retention, and what you would validate first."],
      ["Synthesize", "Give a 60-second recommendation: answer, two reasons, biggest risk, next step. These supplied figures are practice assumptions, not facts about an actual market."],
    ], "600 target firms × 20% = 120 customers; revenue is ₹7.2 million (₹72 lakh). The 10–30% adoption range implies ₹3.6–10.8 million revenue before costs. This is a scenario, not a market forecast. A pilot should test willingness to pay, acquisition cost, retention, and delivery capacity."),
  lesson("ops-case", "Case: fulfilment capacity and inventory", "Operations", ["business"], "Original supply-chain drill. Calculate first, then discuss service/cost tradeoffs.",
    [
      ["Prompt", "Demand averages 120 orders/day; current capacity is 100/day, and backlog is 400 orders. Demand remains constant. A temporary capacity option can process 160/day. How long to clear the backlog?"],
      ["Inventory exercise", "Separately, annual cost of goods sold is ₹12 million and average inventory at cost is ₹2 million. Calculate turns and days of inventory using a 365-day year."],
      ["Decision", "Discuss variability, staffing cost, quality, prioritization, stockouts, and whether the temporary fix addresses root cause. Choose service and cost guardrails."],
    ], "At 100/day, backlog grows by 20/day. At 160/day, net clearance is 40/day, so 400 existing orders take 10 days, assuming stable demand and effective capacity. Inventory turns = 6/year; days inventory ≈ 60.8. Averages can hide variability and bottlenecks."),
  lesson("pricing-case", "Case: price, margin, and retention", "Commercial strategy", ["business"], "Original sensitivity exercise on pricing and unit economics.",
    [
      ["Prompt", "A service charges ₹1,000/month, variable servicing cost is ₹400/customer/month, and acquisition cost is ₹3,000. Assume a constant 5% monthly churn rate and ignore discounting for a deliberately simple model."],
      ["Try it", "Calculate monthly contribution, contribution-based lifetime value using contribution/churn, and acquisition payback in months. What changes if churn reaches 8% or acquisition cost rises 20%?"],
      ["Caveats", "Explain cohort behavior, fixed costs, discounts, retention variation, and why this simple LTV approximation is not a full valuation."],
    ], "Monthly contribution is ₹600; simple contribution LTV is ₹12,000; payback is 5 months. At 8% churn, LTV falls to ₹7,500. A 20% acquisition-cost increase makes CAC ₹3,600 and payback 6 months at unchanged contribution. Do not confuse revenue LTV with contribution LTV."),
  lesson("analytics-lab", "Analytics lab: one dataset, three tools", "Analytics", ["business"], "Original synthetic sales data for Excel, Power BI, or basic SQL. No account is needed to read or work the calculations here.",
    [
      ["Data", "Each row is one order; rupees, not thousands. Orders: (1, North, Direct, 1200, 700), (2, South, Partner, 800, 500), (3, North, Partner, 1000, 650), (4, South, Direct, 1500, 900), (5, North, Direct, 500, 300), (6, South, Partner, 1000, 600). Columns: order_id, region, channel, revenue, variable_cost."],
      ["Exercise", "Calculate total revenue and contribution; aggregate both by region and channel. In Excel use a table, SUMIFS, and a pivot. In Power BI define measures at the order grain. In SQL use GROUP BY; explain how a duplicate join could inflate totals."],
      ["SQL check", "SELECT region, SUM(revenue) AS revenue,\n       SUM(revenue - variable_cost) AS contribution\nFROM orders\nGROUP BY region;", "code"],
      ["Dashboard", "Sketch a one-screen operating review: revenue, contribution, contribution margin, trend, segments, and one action. Do not sum percentages; calculate ratio-of-sums when aggregating margin."],
    ], "Total revenue ₹6,000; variable cost ₹3,650; contribution ₹2,350; contribution margin ≈39.17%. North: revenue ₹2,700, contribution ₹1,050. South: revenue ₹3,300, contribution ₹1,300. Direct: revenue ₹3,200, contribution ₹1,300. Partner: revenue ₹2,800, contribution ₹1,050. Totals must reconcile across both segmentations."),
  lesson("forecast-lab", "Forecast lab: beat a simple baseline", "Forecasting", ["business"], "A mobile-friendly original drill without installing statistical software.",
    [
      ["Prompt", "Synthetic monthly demand for months 1–6: 100, 110, 90, 120, 130, 125. Forecast month 7 using (a) last value and (b) the average of months 4–6."],
      ["Validate", "Explain why evaluating on the same observations used to fit a model is optimistic. Describe a rolling-origin validation, MAE, and when percentage errors are misleading (for example zeros)."],
      ["Regression and sensitivity", "A correlation between advertising spend and demand does not establish causation. Name confounders and an experiment. Show downside/base/upside assumptions before making a capacity commitment."],
    ], "Last-value forecast = 125. Three-month moving average = (120+130+125)/3 = 125. Agreement does not demonstrate accuracy. Hold out future observations or use rolling-origin validation; compare against a simple baseline and inspect bias, seasonality, and decision costs."),
  lesson("writing", "Narrative, PR/FAQ, and recommendation templates", "Writing", ["business"], "Original writing scaffolds, not Amazon internal documents or guaranteed interview requirements.",
    [
      ["Decision narrative", "Customer/problem; evidence and limitations; alternatives; recommendation with tradeoffs; economics and sensitivity; execution/owners; risks/mitigations; decision requested. An outline is enough for the first pass; a six-page narrative is a practice format."],
      ["PR/FAQ", "Write a customer-centered outcome, who benefits and why, the proposed experience, alternatives, adoption, economics, failure risks, and unanswered questions. Avoid promotional claims you cannot support."],
      ["Executive synthesis", "Answer first. Give the two strongest reasons, the biggest uncertainty, and the next action with owner/date. Remove background that does not change the decision."],
    ]),
];

export function resourcesForTrack(track) {
  return resources.filter(resource => resource.tracks.includes(track));
}

// Each row maps to the three existing tasks; task IDs and completion semantics stay unchanged.
const codingDays = [
  ["substring"], ["prefix", "two-sum"], ["three-sum", "window"], ["intervals"], ["stack", "binary"], ["reverse", "cycle"], ["product"],
  ["tree", "depth"], ["heap", "kth"], ["islands"], ["water"], ["course", "bst"], ["subsets", "combination"], ["daily"],
  ["climb"], ["robber", "matrix"], ["group"], ["insert"], ["prefix"], ["cache"], ["coins"],
  ["intervals", "reverse"], ["window"], ["kth"], ["course"], ["three-sum"], ["stack"], ["palindrome"],
];
const designDays = [
  ["design-canvas", "primer"], ["design-canvas", "monitoring"], ["design-canvas", "redirect", "primer"], ["redirect", "monitoring"],
  ["design-canvas", "retries"], ["reliable-workers", "sre"], ["design-canvas", "mock"], ["design-canvas", "primer"],
  ["reliable-workers", "delivery"], ["monitoring", "delivery"], ["datetime", "reliable-workers"], ["retries", "dlq"],
  ["design-canvas", "primer"], ["design-canvas", "mock"], ["design-canvas", "sre"], ["design-canvas", "primer"],
  ["reliable-workers", "design-canvas"], ["mock", "design-canvas"], ["design-canvas", "star"], ["cache-lab", "primer"],
  ["design-canvas", "reliable-workers"], ["design-canvas", "sre"], ["design-canvas", "retries"], ["mock", "design-canvas"],
  ["design-canvas", "monitoring"], ["design-canvas", "primer"], ["design-canvas", "amazon-sde"], ["mock", "amazon-sde"],
];
const businessDays = [
  [["program-canvas", "project-poster"], ["analytics-lab", "excel"], ["star", "principles"]],
  [["program-canvas", "project-poster"], ["kpi-canvas", "analytics-lab"], ["star", "principles"]],
  [["profit-case", "bcg-cases"], ["analytics-lab", "xlookup", "excel-watch"], ["star", "principles"]],
  [["program-canvas", "roles"], ["program-canvas", "kpi-canvas"], ["mock", "star"]],
  [["kpi-canvas", "profit-case"], ["sql-start", "sql-aggregate", "analytics-lab"], ["star", "principles"]],
  [["writing", "market-case"], ["market-case", "pricing-case"], ["star", "principles"]],
  [["profit-case", "mock"], ["analytics-lab", "program-canvas"], ["star", "mock"]],
  [["program-canvas", "kpi-canvas"], ["powerbi", "bi-watch", "analytics-lab"], ["star", "principles"]],
  [["pricing-case", "profit-case"], ["pricing-case", "analytics-lab"], ["star", "principles"]],
  [["market-case", "bcg-cases"], ["sql-joins", "analytics-lab"], ["star", "principles"]],
  [["program-canvas", "roles"], ["writing", "program-canvas"], ["star", "principles"]],
  [["forecast-lab", "forecast-book"], ["forecast-lab", "forecast-excel", "excel-watch"], ["star", "principles"]],
  [["ops-case", "bcg-cases"], ["ops-case", "kpi-canvas"], ["star", "principles"]],
  [["market-case", "mock"], ["pricing-case", "forecast-lab"], ["mock", "star"]],
  [["market-case", "pricing-case"], ["kpi-canvas", "analytics-lab"], ["star", "roles"]],
  [["program-canvas", "project-poster"], ["analytics-lab", "vba", "excel-watch"], ["star", "retro"]],
  [["writing", "market-case"], ["analytics-lab", "forecast-lab"], ["writing", "star"]],
  [["ops-case", "mock"], ["analytics-lab", "writing"], ["mock", "star"]],
  [["program-canvas", "star"], ["analytics-lab", "sql-joins", "powerbi"], ["star", "principles"]],
  [["program-canvas", "roles"], ["kpi-canvas", "analytics-lab"], ["writing", "star"]],
  [["ops-case", "market-case"], ["profit-case", "program-canvas"], ["star", "mock"]],
  [["profit-case", "ops-case"], ["analytics-lab", "sql-aggregate"], ["star", "principles"]],
  [["pricing-case", "market-case"], ["pricing-case", "forecast-lab"], ["star", "principles"]],
  [["program-canvas", "mock"], ["market-case", "analytics-lab"], ["mock", "star"]],
  [["profit-case", "mock"], ["writing", "kpi-canvas"], ["star", "retro"]],
  [["program-canvas", "amazon-hire"], ["kpi-canvas", "writing"], ["star", "principles"]],
  [["profit-case", "market-case"], ["analytics-lab", "forecast-lab"], ["star", "amazon-hire"]],
  [["market-case", "mock"], ["program-canvas", "amazon-hire"], ["mock", "star"]],
];

export function dailyResources(track, dayNumber) {
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 28) throw new Error("Choose a study day from 1 to 28.");
  if (track === "business") return businessDays[dayNumber - 1];
  if (track !== "sde") throw new Error("Unknown study track.");
  const coding = codingDays[dayNumber - 1].map(id => `lc-${id}`);
  const reference = dayNumber === 15 || dayNumber === 16 ? "mit-dp" : dayNumber % 3 === 0 ? "neetcode" : "mit-notes";
  return [[...coding, "coding-loop", reference], designDays[dayNumber - 1], ["star", dayNumber % 7 === 0 || dayNumber === 18 || dayNumber === 24 ? "mock" : "principles"]];
}

export const resourceById = new Map(resources.map(resource => [resource.id, resource]));
