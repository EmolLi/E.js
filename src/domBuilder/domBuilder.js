import { TextNode, ElementNode } from "../component/index.js";
// build the component to dom nodes.
export function build(component) {
  let node = createDomNode(component.render());
  if (component.domNode)
    component.position.replaceChild(node, component.domNode);
  else component.position.appendChild(node);
  // component.domNode = node;
}
/*
* @param {ViewTemplate}
*/
function createDomNode(viewTemplate) {
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

  viewTemplate._nextDomNode = node;
  return node;
}
