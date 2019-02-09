import { Component, TextNode, ElementNode, build } from "../../src/index.js";

// Tested: TextNode construction

let c = new Component({
  position: document.body,
  render: () => {
    return new TextNode("This is the first text node produced by E.js!");
  }
});

build(c);
