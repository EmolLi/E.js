import {
  Component,
  TextNode,
  ElementNode,
  build
} from "../../src/baseline/index.js";

// Tested: elementNode with multiple children, event handler
let c = new Component({
  position: document.body,
  render: () =>
    new ElementNode({
      tag: "h2",
      properties: { onclick: () => console.log("this is h2") },
      children: [
        new TextNode("This is a child TextNode in H2 ElementNode"),
        new TextNode("This is another TextNode in H2 ElementNode")
      ]
    })
});

let c2 = new Component({
  position: document.body,
  render: () =>
    new ElementNode({
      tag: "div",
      properties: { onclick: () => console.log("this is div"), id: "12" },
      children: [
        new TextNode("A div"),
        new ElementNode({
          tag: "input",
          properties: {
            oninput: e => console.log(e.target.value),
            placeholder: "placeholder",
            type: "text"
          }
        }),
        new TextNode("string after input")
      ]
    })
});

build(c);
build(c2);
