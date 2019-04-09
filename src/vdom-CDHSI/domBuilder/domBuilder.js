import { TextNode, ElementNode } from "../component/index.js";
import { patch } from "./vdom.js";
import { map, generateEditScript } from "./vdomCDHSI.js";

let currentVtree = new Map();
let historyVtree = new Map();
// build the component to dom nodes.
export function build(component) {
  let vnode = component.render();

  annotateTree(vnode);

  if (historyVtree.get(component)) {
    console.log("[DOM BUILDER] patching ", component);

    let mapping = map(historyVtree.get(component), vnode);
    // debugger;
    generateEditScript(historyVtree.get(component), vnode, mapping);
  } else {
    console.log("[DOM BUILDER] building ", component);
    let node = createDomNode(vnode);
    if (component.domNode)
      component.position.replaceChild(node, component.domNode);
    else component.position.appendChild(node);
    component.domNode = node;
    vnode.domNode = node;
  }
  currentVtree.set(component, vnode);
}

// with depth and parent information
function annotateTree(node, depth = 0, parent = null) {
  node.parent = parent;
  node._depth = depth;
  if (node instanceof ElementNode) {
    node.children.forEach((c, i) => {
      c.pos = i;
      annotateTree(c, depth + 1, node);
    });
  }
}

export function archiveVtree() {
  historyVtree = new Map([...historyVtree, ...currentVtree]);
  currentVtree = new Map();
}
/*
* @param {ViewTemplate}
*/
export function createDomNode(viewTemplate) {
  let node;
  // debugger;
  if (viewTemplate instanceof TextNode) {
    // text node
    node = document.createTextNode(viewTemplate.string);
  } else if (viewTemplate instanceof ElementNode) {
    // element node
    node = document.createElement(viewTemplate.tag);
    Object.assign(node, viewTemplate.properties);
    viewTemplate.children.forEach(c => {
      node.appendChild(createDomNode(c));
    });
  } else console.error("Error: invalid element type");

  viewTemplate.domNode = node;
  viewTemplate._nextDomNode = node;
  return node;
}

export function createDomNodeWithoutChildren(viewTemplate) {
  let node;
  // debugger;
  if (viewTemplate instanceof TextNode) {
    // text node
    node = document.createTextNode(viewTemplate.string);
  } else if (viewTemplate instanceof ElementNode) {
    // element node
    node = document.createElement(viewTemplate.tag);
    Object.assign(node, viewTemplate.properties);
  } else console.error("Error: invalid element type");

  viewTemplate.domNode = node;
  viewTemplate._nextDomNode = node;
  return node;
}
