export const modules = [
  {
    id: "sorting",
    title: "Sorting",
    subtitle: "Bring order to every element.",
    algorithms: [
      "Bubble Sort",
      "Selection Sort",
      "Insertion Sort",
      "Merge Sort",
      "Quick Sort",
      "Heap Sort",
    ],
    phase: 2,
    color: "cyan",
    symbol: "bars",
  },
  {
    id: "trees",
    title: "Trees",
    subtitle: "Find balance in branching structures.",
    algorithms: ["Binary Search Tree", "AVL Tree", "Red-Black Tree"],
    phase: 3,
    color: "violet",
    symbol: "tree",
  },
  {
    id: "graphs",
    title: "Graph Algorithms",
    subtitle: "Explore connections. Discover paths.",
    algorithms: [
      "Breadth-First Search",
      "Depth-First Search",
      "Dijkstra",
      "Kruskal",
    ],
    phase: 4,
    color: "teal",
    symbol: "graph",
  },
  {
    id: "strings",
    title: "String Matching",
    subtitle: "Find the pattern in the possibilities.",
    algorithms: ["Naive String Matching", "KMP"],
    phase: 5,
    color: "pink",
    symbol: "string",
  },
  {
    id: "greedy",
    title: "Greedy Algorithms",
    subtitle: "One local choice. A bigger solution.",
    algorithms: ["Activity Selection", "Fractional Knapsack", "Huffman Coding"],
    phase: 5,
    color: "amber",
    symbol: "greedy",
  },
  {
    id: "dp",
    title: "Dynamic Programming",
    subtitle: "Small subproblems. Powerful results.",
    algorithms: ["0/1 Knapsack", "Longest Common Subsequence"],
    phase: 5,
    color: "blue",
    symbol: "grid",
  },
] as const;

export type ModuleId = (typeof modules)[number]["id"];
export type PageId = "dashboard" | ModuleId | "performance" | "guide";
export const pageTitles: Record<PageId, string> = {
  dashboard: "Overview",
  sorting: "Sorting Visualizer",
  trees: "Tree Visualizer",
  graphs: "Graph Algorithm Visualizer",
  strings: "String Matching Visualizer",
  greedy: "Greedy Algorithm Visualizer",
  dp: "Dynamic Programming Visualizer",
  performance: "Performance Analysis Lab",
  guide: "Algorithm Learning Guide",
};
export function parsePage(hash: string): PageId {
  const candidate = hash.replace(/^#\/?/, "");
  return Object.hasOwn(pageTitles, candidate)
    ? (candidate as PageId)
    : "dashboard";
}
