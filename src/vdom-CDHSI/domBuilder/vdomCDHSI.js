import { ViewTemplate, TextNode, ElementNode } from "../component/index.js";
import { createDomNode, createDomNodeWithoutChildren } from "./domBuilder.js";
import { Operation, INSERT, DELETE, UPDATE, MOVE } from "./operations.js";
const STRING_DIFF_THRESH = 5;
const ATTR_DIFF_THRESH = 2;
const INTERNAL_THRESH = 0.5;
let mapping;
let nodeDepthDict1;
let nodeDepthDict2;
let editScript;
//==============matching===============
export function map(rootX, rootY) {
  mapping = new Map();

  // generate nodeDepthDict
  nodeDepthDict1 = [];
  nodeDepthDict2 = [];
  generateNodeDepthDict(rootX, nodeDepthDict1);
  generateNodeDepthDict(rootY, nodeDepthDict2);

  let x;
  let y;
  for (
    let level = Math.min(nodeDepthDict1.length, nodeDepthDict2.length) - 1;
    level >= 0;
    level--
  ) {
    for (let i = 0; i < nodeDepthDict1[level].length; i++) {
      for (let j = 0; j < nodeDepthDict2[level].length; j++) {
        x = nodeDepthDict1[level][i];
        y = nodeDepthDict2[level][j];
        if (equal(x, y)) {
          addMatching(x, y, mapping);
          nodeDepthDict2[level].splice(j, 1);
          break;
        }
      }
    }
  }

  return mapping;
}

function addMatching(x, y, mapping) {
  mapping.set(x, y);
  mapping.set(y, x);
  if (x.domNode) y.domNode = x.domNode;
  else if (y.domNode) x.domNode = y.domNode;
}

function generateNodeDepthDict(x, nodeDepthDict) {
  if (x) {
    if (!nodeDepthDict[x._depth]) nodeDepthDict[x._depth] = [];
    nodeDepthDict[x._depth].push(x);
    if (x.children)
      x.children.forEach(c => generateNodeDepthDict(c, nodeDepthDict));
  }
  return nodeDepthDict;
}
/*
* check if x and y is a match
* the equal is not exactly equal, it will tolerant some dissimilarities
* @param {ViewTemplate} x
* @param {ViewTemplate} y
* @return {boolean} isMatch
*/
function equal(x, y) {
  if (x.constructor.name !== y.constructor.name || x.tag !== y.tag)
    return false;
  // both leaf node
  if (
    x instanceof TextNode ||
    (x instanceof ElementNode &&
      x.children.length == 0 &&
      y.children.length == 0)
  )
    return compare(x, y) <= 1;
  // internal nodes
  return (
    common(x, y) / Math.max(x.children.length, y.children.length) >=
    INTERNAL_THRESH
  );
}

/*
* find out how many common children (direct) x, y have.
* @param {ViewTemplate} x
* @param {ViewTemplate} y
* @return {number} number of common children
*/
function common(x, y) {
  let comm = 0;
  x.children.forEach(xc => {
    if (mapping.has(xc) && mapping.get(xc).parent == y) {
      comm++;
    }
  });
  return comm;
}
/*
* compute the distance score of the two nodes of the same labels
* @param {ViewTemplate} x - Node of label A
* @param {ViewTemplate} y - Node of label A
* @return {number} distance score
*/
function compare(x, y) {
  if (x instanceof TextNode) {
    // TODO: use an string similarity algo
    let lenDiff = Math.abs(x.string.length - y.string.length);
    if (Math.abs(x.string.length - y.string.length) < STRING_DIFF_THRESH) {
      if (x.string == y.string) return 0;
      return 0.5;
    }
    return 1.2;
  } else {
    // ElementNode
    let attrDiff = 0;
    for (let i in x.properties) {
      if (x.properties[i] != y.properties[i]) attrDiff++;
    }
    if (attrDiff > ATTR_DIFF_THRESH) return 1.3;
    return attrDiff / (ATTR_DIFF_THRESH + 1);
  }
}

//=============compute edit script=============
export function generateEditScript(rootX, rootY, mapping) {
  editScript = [];

  if (!mapping.has(rootX)) createDummyRoot(rootX, rootY, mapping);

  bfs(rootY, x => {
    if (!x) return;
    if (mapping.has(x) && mapping.get(x) == x) return;

    let y = x.parent;
    let z = null;
    if (y) z = mapping.get(y);

    if (!mapping.has(x)) {
      if (x.pos >= z.children.length) editScript.push(new INSERT(x, z, null));
      else {
        editScript.push(new INSERT(x, z, z.children[x.pos]));
      }
      // editScript.push(new INSERT(x, z, x.pos));
      let xClone = { ...x };
      if (xClone.children) xClone.children = [];
      addMatching(x, xClone, mapping);
      z.children.splice(xClone.pos, 0, xClone);
    } else if (x._depth > 0) {
      let w = mapping.get(x);
      let v = w.parent;
      if (!compareValue(w, v)) {
        editScript.push(new UPDATE(w, x));
        // TODO: DELTE
        // if (w instanceof TextNode) w.string =
      }
      let z = mapping.get(y);
      if (z != v) {
        if (x.pos >= z.children.length)
          editScript.push(new MOVE(w, z, z.children[z.children.length - 1]));
        else {
          editScript.push(new MOVE(w, z, z.children[x.pos - 1]));
        }
      }
    }
    let w = mapping.get(x);
    alignChildren(w, x);
  });
  postOrder(rootX, w => {
    if (!mapping.has(w)) editScript.push(new DELETE(w));
  });
}

function alignChildren(x, y) {
  if (x instanceof ElementNode) {
    x.children.forEach((c, i) => {
      c.pos = i;
      let cy = mapping.get(c);
      c.newPos = cy ? cy.pos : -1;
    });

    loop1: for (let i = 1; i < x.children.length; i++) {
      let c = x.children[i];
      if (c.newPos == -1) continue;
      for (let j = i - 1; j >= 0; j--) {
        let cd = x.children[j];
        if (cd.newPos == -1) continue;
        if (c.newPos > cd.newPos) {
          if (j < i - 1) {
            // j == i-1 -> no move needed
            editScript.push(new MOVE(c, x, x.children[j + 1]));
            x.children.splice(i, 1);
            x.children.splice(j + 1, 0, c);
          }
          continue loop1;
        }
      }

      // c should be moved to the head of the list
      editScript.push(new MOVE(c, x, x.children[0] ? x.children[0] : null));
      x.children.splice(i, 1);
      x.children.splice(0, 0, c);
    }
  }
}

// x, y is of a match
function compareValue(x, y) {
  if (x instanceof TextNode) {
    return x.string == y.string;
  }
  if (x instanceof ElementNode) {
    if (x.properties.length !== y.properties.length) return false;
    for (let i in x.properties) {
      if (y.properties[i] !== x.properties[i]) return false;
    }
  }
  return true;
}

function createDummyRoot(rootX, rootY, mapping) {
  let dummyRoot = new ElementNode();
  dummyRoot._depth = -1;
  dummyRoot.domNode = rootX.domNode.parentNode;
  mapping.set(dummyRoot, dummyRoot);
  rootX.parent = dummyRoot;
  rootY.parent = dummyRoot;
}

function bfs(x, fn) {
  let queue = [];
  queue.push(x);

  while (queue.length > 0) {
    let s = queue[0];
    queue.splice(0, 1);
    fn(s);
    if (s.children) s.children.forEach(c => queue.push(c));
  }
}

function postOrder(x, fn) {
  if (x.children) {
    x.children.forEach(c => postOrder(c, fn));
  }
  fn(x);
}
