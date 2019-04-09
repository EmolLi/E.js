import { createDomNode, createDomNodeWithoutChildren } from "./domBuilder.js";
import { ViewTemplate, TextNode, ElementNode } from "../component/index.js";

export class Operation {
  constructor(x, y, k) {
    this.x = x;
    this.y = y;
    this.k = k;
  }
  execute() {}
}

export class INSERT extends Operation {
  // insert a new leaf x as a child of y, just before the child k
  constructor(x, y, k) {
    super(x, y, k);
    debugger;
    this.execute();
  }
  execute() {
    this.y.domNode.insertBefore(
      createDomNodeWithoutChildren(this.x),
      this.k ? this.k.domNode : null
    );
    console.log("[BUILDER] INSERT ", this);
  }
}

export class DELETE extends Operation {
  // delete leaf node x
  constructor(x) {
    super(x);
    // debugger;
    this.execute();
  }
  execute() {
    this.x.domNode.remove();
    console.log("[BUILDER] DELETE ", this);
  }
}

export class UPDATE extends Operation {
  // update x to y
  constructor(x, y) {
    super(x, y);
    // debugger;
    this.execute();
  }
  execute() {
    if (this.x instanceof TextNode) {
      this.x.domNode.textContent = this.y.string;
    } else {
      for (let key in this.x.properties) {
        if (this.y.properties[key] == undefined) {
          delete this.x.domNode[key];
        }
      }
      Object.assign(this.x.domNode, this.y.properties);
    }
    this.y.domNode = this.x.domNode;
    console.log("[BUILDER] UPDATE ", this);
  }
}

export class MOVE extends Operation {
  // move subtree rooted at x to child of y, just before child k
  constructor(x, y, k) {
    super(x, y, k);
    debugger;
    this.execute();
  }
  execute() {
    if (!this.x.domNode) createDomNodeWithoutChildren(this.x);
    this.y.domNode.insertBefore(this.x.domNode, this.k ? this.k.domNode : null);
    console.log("[BUILDER] MOVE ", this);
  }
}
