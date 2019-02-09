import {
  Component,
  TextNode,
  ElementNode,
  build,
  Store
} from "../../src/index.js";

// init store
let s = new Store();
s.add("input", "a");
let store = s.store;

function onInput(e) {
  store.input = e.target.value;
}
let c = new Component({
  position: document.body,
  stores: [s],
  render: () =>
    new ElementNode({
      tag: "div",
      properties: { onclick: () => console.log("this is div"), id: "12" },
      children: [
        new ElementNode({
          tag: "input",
          properties: {
            oninput: onInput,
            placeholder: "placeholder",
            type: "text",
            value: store.input
          }
        }),
        new TextNode(`The value in the input is ${store.input}`)
      ]
    })
});

build(c);
