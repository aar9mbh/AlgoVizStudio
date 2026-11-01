// Keep the written reference aligned with the educational content shown by the app.
import fs from "node:fs/promises";
import ts from "typescript";
const compile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const sorting = compile(
  await fs.readFile(new URL("../src/data/sorting.ts", import.meta.url), "utf8"),
);
const sortingURL =
  "data:text/javascript;base64," + Buffer.from(sorting).toString("base64");
const source = compile(
  await fs.readFile(new URL("../src/data/lessons.ts", import.meta.url), "utf8"),
).replace(/(["'])\.\/sorting\1/, JSON.stringify(sortingURL));
const { lessons } = await import(
  "data:text/javascript;base64," + Buffer.from(source).toString("base64")
);
let output =
  "# AlgoViz Studio — Algorithm Reference\n\nAll 20 algorithms below are implemented. This guide is generated from the educational content used by the app; regenerate with `node scripts/generate-algorithm-guide.mjs`. Algorithm space excludes stored visualization histories.\n\n";
for (const [id, l] of Object.entries(lessons)) {
  output += `## ${l.title}\n\nSource key: \`${id}\`.\n\n${l.definition}\n\n${l.principle}\n\n\`\`\`text\n${l.pseudocode.join("\n")}\n\`\`\`\n\n| Best | Average | Worst | Working space |\n|---|---|---|---|\n| ${l.best} | ${l.average} | ${l.worst} | ${l.space} |\n\nExample: ${l.example}\n\nAdvantages: ${l.advantages}\n\nLimitations: ${l.limitations}\n\nApplications: ${l.applications}\n\nAssumptions: ${l.assumptions}\n\n`;
}
output +=
  "## Background references\n\nBackground theory was checked against these teaching sources; their implementation variants can differ from this project.\n\n- [Princeton sorting summary](https://algs4.cs.princeton.edu/cheatsheet/)\n- [Princeton heap analysis](https://algs4.cs.princeton.edu/24pq/)\n- [Princeton quicksort analysis](https://algs4.cs.princeton.edu/23quicksort/)\n- [IISc Red-Black deletion notes](https://gtl.csa.iisc.ac.in/dsa/node117.html)\n- [Cornell balanced-tree lecture](https://www.cs.cornell.edu/courses/cs211/2005fa/Lectures/L17-ADT/L17cs211fa05.pdf)\n- [MIT dynamic programming subproblems](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/28461a74f81101874a13d9679a40584d_MIT6_006S20_lec16.pdf)\n";
await fs.writeFile(new URL("../ALGORITHMS.md", import.meta.url), output);
console.log(`Wrote reference for ${Object.keys(lessons).length} algorithms.`);
