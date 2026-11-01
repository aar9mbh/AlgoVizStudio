const repairs: Record<string, string> = {
  bst: `search: compare at root; move left/right until equal or NIL
insert: attach a leaf at the first NIL slot; ignore duplicates
delete: if two children, copy inorder successor key and remove successor
        reconnect its zero/one child to the removed node's parent
traversal: visit in the selected node/left/right ordering`,
  avl: `after insert/delete, walk ancestors upward:
  update cached height; b = height(left) − height(right)
  if b > 1:
    if left child is right-heavy: rotateLeft(left child)
    rotateRight(node)
  if b < −1:
    if right child is left-heavy: rotateRight(right child)
    rotateLeft(node)
  continue from the rotated subtree's parent`,
  redblack: `insert: attach a red BST leaf; while parent is red:
  red uncle: blacken parent/uncle, redden grandparent; move up
  black uncle: rotate triangle to line, recolor, rotate grandparent
blacken root

delete: remove successor/zero-or-one-child node; remember its color
if removed color was black, repair replacement x:
  red sibling: recolor and rotate parent to obtain black sibling
  sibling has two black children: redden sibling; move x up
  otherwise: rotate near-red/far-black case into far-red case
             inherit parent color; blacken parent/far child; rotate parent
  repeat with mirrored left/right cases; blacken x`,
};
export function TreeRepairNotes({ id }: { id: string }) {
  return repairs[id] ? (
    <details className="repair-notes">
      <summary>Detailed operation and repair pseudocode</summary>
      <pre>{repairs[id]}</pre>
    </details>
  ) : null;
}
