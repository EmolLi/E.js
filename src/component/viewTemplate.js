//
// viewTemplate({
//   type: 'Input',	// a valid html tag, e.g. “Input”, “p”,”h2”, etc
//   Properties:{ // properties for this element, the generated DOM element will have the same properties
//                oninput: userDefinedMethod, // event handling achieved with property
//                placeholder: data_A,
//                type: “text”}
// content: ["textNode", viewTemplate(..)]

export class ViewTemplate {
  constructor() {
    this.domNode = null; // dom node in the current frame
    this._nextDomNode = null; // dom node for the next frame
  }
}

export class TextNode extends ViewTemplate {
  constructor(string) {
    super();
    this.string = string;
  }
}

export class ElementNode extends ViewTemplate {
  constructor({ tag, properties = {}, children = [] }) {
    super();
    this.tag = tag;
    this.properties = properties;
    this.children = children;
  }
}
