import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { TreePage } from "../pages/TreePage";
import { GraphPage } from "../pages/GraphPage";
import { StringPage } from "../pages/StringPage";
import { GreedyPage } from "../pages/GreedyPage";
import { DPPage } from "../pages/DPPage";
const props = { speed: 1, onSpeed: () => {} };
beforeEach(() => localStorage.clear());
function finish() {
  const slider = screen.getByLabelText("Execution step");
  fireEvent.change(slider, { target: { value: "999999" } });
}
it("tree UI builds an AVL rotation, deletes, searches and traverses", () => {
  render(<TreePage {...props} />);
  fireEvent.change(screen.getByLabelText("Insertion sequence"), {
    target: { value: "3,2,1" },
  });
  fireEvent.click(screen.getByText("Build tree"));
  finish();
  expect(
    screen.getByRole("img", { name: "Tree with 3 nodes" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Node value"), {
    target: { value: "2" },
  });
  fireEvent.click(screen.getByText("Delete", { exact: true }));
  finish();
  expect(
    screen.getByRole("img", { name: "Tree with 2 nodes" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByText("Search", { exact: true }));
  finish();
  expect(screen.getByText("2 was not found.")).toBeInTheDocument();
  fireEvent.click(screen.getByText("inorder traversal"));
  finish();
  expect(screen.getByText("Traversal output: 1 → 3")).toBeInTheDocument();
});
it("graph UI executes Dijkstra and rejects directed Kruskal", () => {
  render(<GraphPage {...props} />);
  fireEvent.change(screen.getByLabelText("Algorithm"), {
    target: { value: "dijkstra" },
  });
  fireEvent.click(screen.getByText("Generate execution"));
  finish();
  expect(screen.getByText(/Weighted distance = 13/)).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("Directed graph"));
  fireEvent.change(screen.getByLabelText("Algorithm"), {
    target: { value: "kruskal" },
  });
  fireEvent.click(screen.getByText("Generate execution"));
  expect(screen.getByRole("alert")).toHaveTextContent(/undirected/);
});
it("graph UI adds and removes a node and incident edges", () => {
  render(<GraphPage {...props} />);
  fireEvent.click(screen.getByText("Add node"));
  expect(
    screen.getByRole("button", { name: "Node G; arrow keys move it" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Edge to"), {
    target: { value: "G" },
  });
  fireEvent.click(screen.getByText("Add edge"));
  expect(screen.getByRole("button", { name: /A – G/ })).toBeInTheDocument();
  fireEvent.click(screen.getByText("Remove node by ID"));
  expect(
    screen.queryByRole("button", { name: "Node G; arrow keys move it" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /A – G/ }),
  ).not.toBeInTheDocument();
});
it("string UI generates and completes overlapping KMP matches", () => {
  render(<StringPage {...props} />);
  fireEvent.change(screen.getByLabelText("Text"), {
    target: { value: "ABABA" },
  });
  fireEvent.change(screen.getByLabelText("Pattern"), {
    target: { value: "ABA" },
  });
  fireEvent.click(screen.getByText("Generate execution"));
  finish();
  expect(screen.getByText("Matches: 0, 2")).toBeInTheDocument();
});
it("greedy UI switches to Huffman and computes the code length", () => {
  render(<GreedyPage {...props} />);
  fireEvent.change(screen.getByLabelText("Algorithm"), {
    target: { value: "huffman" },
  });
  fireEvent.change(screen.getByLabelText("Text to encode"), {
    target: { value: "aaaa" },
  });
  fireEvent.click(screen.getByText("Generate execution"));
  finish();
  expect(
    screen.getByText("Weighted encoded length: 4 bits"),
  ).toBeInTheDocument();
});
it("DP UI applies LCS and reconstructs its solution", () => {
  render(<DPPage {...props} />);
  fireEvent.change(screen.getByLabelText("Algorithm"), {
    target: { value: "lcs" },
  });
  fireEvent.change(screen.getByLabelText("First string"), {
    target: { value: "ABC" },
  });
  fireEvent.change(screen.getByLabelText("Second string"), {
    target: { value: "AC" },
  });
  fireEvent.click(screen.getByText("Generate execution"));
  finish();
  expect(screen.getByText("Reconstructed LCS: “AC”")).toBeInTheDocument();
});
