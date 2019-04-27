import { TextNode, ElementNode } from "../component/index.js";
import { patch } from "./vdom.js";

let currentVtree = new Map();
let historyVtree = new Map();
// build the component to dom nodes.
export function build(component) {
  let vnode = component.render();
  if (historyVtree.get(component)) {
    console.log("[DOM BUILDER] patching ", component);
    vnode = patch(historyVtree.get(component), vnode);
    vnode.domNode = vnode._nextDomNode;
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

export function archiveVtree() {
  historyVtree = new Map([...historyVtree, ...currentVtree]);
  currentVtree = new Map();
}
/*
* @param {ViewTemplate}
*/
export function createDomNode(viewTemplate) {
  let node;
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
