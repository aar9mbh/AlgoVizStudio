export type TreeKind = "bst" | "avl" | "redblack";
export type TreeView = {
  value: number;
  color: "red" | "black";
  balance: number;
  left: TreeView | null;
  right: TreeView | null;
};
export type TreeStep = {
  tree: TreeView | null;
  active: number[];
  description: string;
  event: string;
  line: number;
  output: number[];
};
class Node {
  height = 1;
  left!: Node;
  right!: Node;
  parent!: Node;
  constructor(
    public value: number,
    public color: "red" | "black" = "black",
  ) {}
}
/** Parent pointers allow rotation snapshots to represent the entire live tree accurately. */
export class TreeEngine {
  private nil = new Node(0);
  private root: Node;
  private steps: TreeStep[] = [];
  constructor(public readonly kind: TreeKind) {
    this.nil.left = this.nil.right = this.nil.parent = this.nil;
    this.nil.height = 0;
    this.root = this.nil;
  }
  private height(n: Node): number {
    return n.height;
  }
  private actualHeight(n: Node): number {
    return n === this.nil
      ? 0
      : 1 + Math.max(this.actualHeight(n.left), this.actualHeight(n.right));
  }
  private view(n: Node): TreeView | null {
    return n === this.nil
      ? null
      : {
          value: n.value,
          color: n.color,
          balance: this.actualHeight(n.left) - this.actualHeight(n.right),
          left: this.view(n.left),
          right: this.view(n.right),
        };
  }
  snapshot() {
    return this.view(this.root);
  }
  private emit(
    event: string,
    description: string,
    nodes: Node[] = [],
    line = 0,
    output: number[] = [],
  ) {
    this.steps.push({
      tree: this.snapshot(),
      active: nodes.filter((n) => n !== this.nil).map((n) => n.value),
      event,
      description,
      line,
      output: [...output],
    });
  }
  private start(description: string) {
    this.steps = [];
    this.emit("ready", description);
  }
  private finish() {
    this.nil.color = "black";
    this.emit(
      "done",
      "Operation complete. The displayed tree is the committed result.",
      [],
      6,
    );
    return this.steps;
  }
  private replace(old: Node, next: Node) {
    if (old.parent === this.nil) this.root = next;
    else if (old === old.parent.left) old.parent.left = next;
    else old.parent.right = next;
    next.parent = old.parent; // NIL's parent is required by Red-Black deletion fix-up.
  }
  private rotate(x: Node, left: boolean) {
    const y = left ? x.right : x.left;
    if (y === this.nil) throw new Error("Invalid rotation");
    if (left) {
      x.right = y.left;
      if (y.left !== this.nil) y.left.parent = x;
    } else {
      x.left = y.right;
      if (y.right !== this.nil) y.right.parent = x;
    }
    this.replace(x, y);
    if (left) y.left = x;
    else y.right = x;
    x.parent = y;
    x.height = 1 + Math.max(x.left.height, x.right.height);
    y.height = 1 + Math.max(y.left.height, y.right.height);
    this.emit(
      "rotate",
      `${left ? "Left" : "Right"} rotation at ${x.value}: promote ${y.value} while preserving BST order.`,
      [x, y],
      4,
    );
    return y;
  }
  private recolor(n: Node, color: "red" | "black") {
    if (n === this.nil || n.color === color) return;
    n.color = color;
    this.emit(
      "recolor",
      `Recolor ${n.value} ${color} to restore Red-Black properties.`,
      [n],
      5,
    );
  }
  private find(value: number, trace = false): Node {
    let n = this.root;
    while (n !== this.nil) {
      if (trace)
        this.emit("visit", `Compare ${value} with ${n.value}.`, [n], 1);
      if (value === n.value) return n;
      n = value < n.value ? n.left : n.right;
    }
    return this.nil;
  }
  private validate(value: number) {
    if (!Number.isInteger(value) || Math.abs(value) > 999)
      throw new Error("Use integers between −999 and 999.");
  }
  insert(value: number): TreeStep[] {
    this.validate(value);
    this.start(`Insert ${value}. Duplicate values are ignored.`);
    if (this.find(value, true) !== this.nil) {
      this.emit(
        "duplicate",
        `${value} already exists; duplicate ignored.`,
        [],
        2,
      );
      return this.finish();
    }
    if (this.values().length >= 31)
      throw new Error("Tree visualization is limited to 31 unique nodes.");
    let parent = this.nil,
      cursor = this.root;
    while (cursor !== this.nil) {
      parent = cursor;
      cursor = value < cursor.value ? cursor.left : cursor.right;
    }
    const z = new Node(value, this.kind === "redblack" ? "red" : "black");
    z.left = z.right = this.nil;
    z.parent = parent;
    if (parent === this.nil) this.root = z;
    else if (value < parent.value) parent.left = z;
    else parent.right = z;
    this.emit("insert", `Attach ${value} in BST order.`, [z], 2);
    if (this.kind === "avl") this.rebalance(parent);
    if (this.kind === "redblack") this.fixInsert(z);
    return this.finish();
  }
  private rebalance(start: Node) {
    let n = start;
    while (n !== this.nil) {
      n.height = 1 + Math.max(n.left.height, n.right.height);
      const balance = this.height(n.left) - this.height(n.right);
      this.emit(
        "balance",
        `Balance factor of ${n.value} is ${balance}.`,
        [n],
        3,
      );
      if (balance > 1) {
        if (this.height(n.left.left) < this.height(n.left.right))
          this.rotate(n.left, true);
        n = this.rotate(n, false);
      } else if (balance < -1) {
        if (this.height(n.right.right) < this.height(n.right.left))
          this.rotate(n.right, false);
        n = this.rotate(n, true);
      }
      n = n.parent;
    }
  }
  private fixInsert(start: Node) {
    let z = start;
    while (z.parent.color === "red") {
      const p = z.parent,
        g = p.parent,
        left = p === g.left,
        uncle = left ? g.right : g.left;
      if (uncle.color === "red") {
        this.recolor(p, "black");
        this.recolor(uncle, "black");
        this.recolor(g, "red");
        z = g;
      } else {
        if (z === (left ? p.right : p.left)) {
          z = p;
          this.rotate(z, left);
        }
        this.recolor(z.parent, "black");
        this.recolor(z.parent.parent, "red");
        this.rotate(z.parent.parent, !left);
      }
    }
    this.recolor(this.root, "black");
  }
  delete(value: number): TreeStep[] {
    this.validate(value);
    this.start(`Delete ${value}.`);
    let z = this.find(value, true);
    if (z === this.nil) {
      this.emit("missing", `${value} was not found.`, [], 2);
      return this.finish();
    }
    // Copy the inorder successor's key, then remove that successor (which has at most one child).
    if (z.left !== this.nil && z.right !== this.nil) {
      let successor = z.right;
      while (successor.left !== this.nil) successor = successor.left;
      z.value = successor.value;
      this.emit(
        "successor",
        `Replace the deleted key with inorder successor ${successor.value}; remove its original node next.`,
        [z, successor],
        2,
      );
      z = successor;
    }
    const originalColor = z.color,
      child = z.left !== this.nil ? z.left : z.right,
      parent = z.parent;
    this.replace(z, child);
    this.emit(
      "delete",
      `Remove node ${z.value}; reconnect its child, if any.`,
      [child],
      2,
    );
    if (this.kind === "avl") this.rebalance(parent);
    if (this.kind === "redblack" && originalColor === "black")
      this.fixDelete(child);
    return this.finish();
  }
  private fixDelete(start: Node) {
    let x = start;
    // Propagate the missing black upward, or discharge it using sibling rotations/recoloring.
    while (x !== this.root && x.color === "black") {
      const left = x === x.parent.left;
      let w = left ? x.parent.right : x.parent.left;
      if (w.color === "red") {
        this.recolor(w, "black");
        this.recolor(x.parent, "red");
        this.rotate(x.parent, left);
        w = left ? x.parent.right : x.parent.left;
      }
      const near = () => (left ? w.left : w.right),
        far = () => (left ? w.right : w.left);
      if (near().color === "black" && far().color === "black") {
        this.recolor(w, "red");
        x = x.parent;
      } else {
        if (far().color === "black") {
          this.recolor(near(), "black");
          this.recolor(w, "red");
          this.rotate(w, !left);
          w = left ? x.parent.right : x.parent.left;
        }
        this.recolor(w, x.parent.color);
        this.recolor(x.parent, "black");
        this.recolor(far(), "black");
        this.rotate(x.parent, left);
        x = this.root;
      }
    }
    this.recolor(x, "black");
  }
  search(value: number) {
    this.validate(value);
    this.start(`Search for ${value}.`);
    const found = this.find(value, true);
    this.emit(
      "result",
      found === this.nil ? `${value} was not found.` : `Found ${value}.`,
      [found],
      6,
    );
    return this.steps;
  }
  values() {
    const result: number[] = [];
    const walk = (n: Node) => {
      if (n !== this.nil) {
        walk(n.left);
        result.push(n.value);
        walk(n.right);
      }
    };
    walk(this.root);
    return result;
  }
  traverse(
    order: "inorder" | "preorder" | "postorder" | "levelorder",
  ): TreeStep[] {
    this.start(`${order} traversal.`);
    const output: number[] = [];
    const visit = (n: Node) => {
      output.push(n.value);
      this.emit("visit", `Output ${n.value}.`, [n], 1, output);
    };
    const walk = (n: Node) => {
      if (n === this.nil) return;
      if (order === "preorder") visit(n);
      walk(n.left);
      if (order === "inorder") visit(n);
      walk(n.right);
      if (order === "postorder") visit(n);
    };
    if (order === "levelorder") {
      const queue = this.root === this.nil ? [] : [this.root];
      while (queue.length) {
        const n = queue.shift()!;
        visit(n);
        if (n.left !== this.nil) queue.push(n.left);
        if (n.right !== this.nil) queue.push(n.right);
      }
    } else walk(this.root);
    this.emit(
      "done",
      `Traversal complete: ${output.join(", ") || "empty tree"}.`,
      [],
      6,
      output,
    );
    return this.steps;
  }
}
