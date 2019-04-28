# E.js


Web Framework (for Front End) is a software framework designed to support the development of client side web applications. Popular frameworks include React, Angular, Vue and etc.

One good thing about web framework is that it hides DOM operations from developers so they can focus on application logic. By separating application logic and DOM manipulations, the code is better modularized and more maintainable.

Most web frameworks follow MV* (MVC, MVVM) pattern. Developers specify the view for UI elements, and bind the view with model. They only manipulate the model to update the view. The framework will watch for data change in model, and update the DOM to keep the webpage in sync with the model.

The update time performance of a web framework depends on the way it updates the DOM upon data change. A good UI update algorithm should be able to detect the affected DOM nodes and compute the minimum DOM operations needed efficiently.

This research project studies various UI update methods in web frameworks, and proposed a virtual dom based method based on a generic tree edit script algorithm proposed in a [paper](http://ilpubs.stanford.edu:8090/115/1/1995-46.pdf).

We designed and built a naive web framework called E.js based on [aoy.js](https://github.com/aooy/aoy), and implemented 4 different UI update methods on it:

- Rebuild All
- Throttle
- A virtual DOM solution based on [Snabbdom](https://github.com/snabbdom/snabbdom)
- Our own virtual DOM based solution CDHSI

The source code for the four implemenetations are available in `\src`.

We implemented a benchmarking system based on krausest's [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) to evaluate the performance. The source code is available in `\benchhmarks`.

This is a research course project (McGill University, [COMP 400](https://www.mcgill.ca/study/2017-2018/courses/comp-400)), under the supervision of Clark Verbrugge. For more detail, please refer to the project [report](./Web_Framework_UI_update.pdf).
