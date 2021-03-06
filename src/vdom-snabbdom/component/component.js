export class Component {
  constructor({ position, render, stores = [] }) {
    this.position = position;
    this.render = render;
    this.stores = stores;
    this.domNode = null;

    stores.forEach(s => s.addDependentComponent(this));
  }
}

/*{
                position: document.body,	// specify where to inject the component, e.g. the       component should be injected in document.body
                render: function(){
                    return viewTemplate({
                      type: 'Input',	// a valid html tag, e.g. “Input”, “p”,”h2”, etc
                      Properties:{ // properties for this element, the generated DOM element will have the same properties
                      oninput: userDefinedMethod, // event handling achieved with property
                      placeholder: data_A,
                      type: “text”},
                children:[] // children must be viewTemplate instance
                });
}*/

// export function createComponent({ position, render, children }) {}
