import {
  Component,
  TextNode,
  ElementNode,
  build,
  Store
} from "../../src/index.js";

let benchmarkConfig = {
  addTodoCnt: 100
};

// init store
let s = new Store();
s.add("newTodo", "test");
s.add("todos", []);
s.add("editedTodo", null);
let store = s.store;

let beforeEditCache;

// ==================== benchmarking methods =================

function addOneTodo(text) {
  store.todos = [...store.todos, { title: text, id: text, completed: false }];
}
function addTodos(n) {
  if (n > 0)
    setTimeout(() => {
      addOneTodo(`Task-${benchmarkConfig.addTodoCnt - n}`);
      addTodos(n - 1);
    });
}
function add1000TodosButton() {
  return new ElementNode({
    tag: "button",
    properties: {
      id: "benchmark-add-todos",
      onclick: () => addTodos(benchmarkConfig.addTodoCnt)
    },
    children: [new TextNode("Add 100 Todos")]
  });
}
export let benchmarkMethods = new Component({
  position: document.body.firstElementChild,
  render: () =>
    new ElementNode({
      tag: "div",
      properties: { className: "benchmark" },
      children: [add1000TodosButton()]
    })
});

// ==================== header ===============================
// <header class="header">
//  <h1>todos</h1>
//  <input class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?" v-model="newTodo" @keyup.enter="addTodo">
// </header>
let h1 = new ElementNode({
  tag: "h1",
  children: [new TextNode(`todos`)]
});

let newTodoInputBox = () =>
  new ElementNode({
    tag: "input",
    properties: {
      id: "input-text-box",
      className: "new-todo",
      autofocus: true,
      autocomplete: "off",
      placeholder: "What needs to be done?",
      value: store.newTodo,
      oninput: e => (store.newTodo = e.target.value),
      onkeyup: addNewTodo
    }
  });

function addNewTodo(e) {
  if (e.key === "Enter") {
    // add new todo
    store.todos = [
      ...store.todos,
      { title: store.newTodo, id: generateUID(), completed: false }
    ];
    console.log(`ADD ${store.newTodo}`);
  }
}
export let header = new Component({
  position: document.body.firstElementChild,
  stores: [s],
  render: () =>
    new ElementNode({
      tag: "header",
      properties: { className: "header" },
      children: [h1, newTodoInputBox()]
    })
});

// ==================== list ===================
// <section class="main" v-show="todos.length">
//   <input id="toggle-all" class="toggle-all" type="checkbox" v-model="allDone">
//   <label for="toggle-all">Mark all as complete</label>
//   <ul class="todo-list">
//     <li class="todo" v-for="todo in filteredTodos" :key="todo.id" :class="{completed: todo.completed, editing: todo == editedTodo}">
//       <div class="view">
//         <input class="toggle" type="checkbox" v-model="todo.completed">
//         <label @dblclick="editTodo(todo)">{{todo.title}}</label>
//         <button class="destroy" @click="removeTodo(todo)"></button>
//       </div>
//       <input class="edit" type="text" v-model="todo.title" v-todo-focus="todo == editedTodo" @blur="doneEdit(todo)" @keyup.enter="doneEdit(todo)" @keyup.esc="cancelEdit(todo)">
//     </li>
//   </ul>
// </section>
let todoList = () =>
  new ElementNode({
    tag: "ul",
    properties: {
      className: "todo-list"
    },
    children: todoListItems()
  });

function todoListItems() {
  return store.todos.map(
    t =>
      new ElementNode({
        tag: "li",
        properties: {
          className: `todo${t.completed ? " completed" : ""}${
            store.editedTodo === t ? " editing" : ""
          }`
        },
        children: [
          new ElementNode({
            tag: "div",
            properties: {
              className: "view"
            },
            children: [
              toggleCompleteButton(t),
              todoLabel(t),
              deleteTodoButton(t)
            ]
          }),
          todoEdit(t)
        ]
      })
  );

  function todoEdit(todo) {
    let editOnKeyUp = todo => e => {
      // debugger;
      if (e.key === "Enter") {
        // add new todo
        doneEdit(todo);
      }
      if (e.key === "Escape") {
        cancelEdit(todo);
      }
    };

    let editTodoOnInput = todo => e => {
      todo.title = e.target.value; // TODO: support deep data change detection
      let i = store.todos.findIndex(t => t.id === todo.id);
      store.todos[i] = todo;
      store.todos = store.todos;
    };

    return new ElementNode({
      tag: "input",
      properties: {
        className: "edit",
        type: "text",
        value: todo.title,
        oninput: editTodoOnInput(todo),
        onkeyup: editOnKeyUp(todo)
      }
    });
  }

  //<input class="toggle" type="checkbox" v-model="todo.completed">
  function toggleCompleteButton(todoItem) {
    return new ElementNode({
      tag: "input",
      properties: {
        className: "toggle",
        type: "checkbox",
        checked: todoItem.completed,
        oninput: e => {
          todoItem.completed = e.target.checked;
          store.todos = store.todos;
        }
      }
    });
  }

  function editTodo(todoItem) {
    beforeEditCache = todoItem.title;
    // debugger;
    store.editedTodo = todoItem;
  }

  function doneEdit(todo) {
    if (!store.editedTodo) return;
    store.editedTodo = null;
    todo.title = todo.title.trim();
    if (!todo.title) {
      removeTodo(todo);
    }
  }

  function cancelEdit(todo) {
    store.editedTodo = null;
    todo.title = beforeEditCache;
  }

  // <label @dblclick="editTodo(todo)">{{todo.title}}</label>
  function todoLabel(todoItem) {
    return new ElementNode({
      tag: "label",
      properties: { ondblclick: () => editTodo(todoItem) },
      children: [new TextNode(todoItem.title)]
    });
  }

  // <button class="destroy" @click="removeTodo(todo)"></button>
  function deleteTodoButton(todoItem) {
    return new ElementNode({
      tag: "button",
      properties: { className: "destroy", onclick: () => removeTodo(todoItem) }
    });
  }
}

function removeTodo(todoItem) {
  store.todos.splice(store.todos.findIndex(i => i.id === todoItem.id), 1);
  store.todos = store.todos; // TODO: probably improve store data change detect method. For now it cannot detect internal data change
}

//				<input id="toggle-all" class="toggle-all" type="checkbox" v-model="allDone">
// <label for="toggle-all">Mark all as complete</label>
function allDoneCheckbox() {
  return new ElementNode({
    tag: "input",
    properties: {
      id: "toggle-all",
      className: "toggle-all",
      type: "checkbox",
      checked: !store.todos.find(t => !t.completed),
      oninput: e => {
        store.todos.forEach(t => (t.completed = e.target.checked));
        store.todos = store.todos;
      }
    }
  });
}

function allDoneLabel() {
  return new ElementNode({
    tag: "label",
    properties: {
      htmlFor: "toggle-all"
    },
    children: [new TextNode("Mark all as complete")]
  });
}

export let main = new Component({
  position: document.body.firstElementChild,
  stores: [s],
  render: () =>
    new ElementNode({
      tag: "section",
      properties: { className: "main" },
      children: [allDoneCheckbox(), allDoneLabel(), todoList()]
    })
});

// ======== build =================
build(benchmarkMethods);
build(header);
build(main);

// ====================== utils=========================
function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}
