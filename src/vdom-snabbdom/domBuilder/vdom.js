import { ViewTemplate, TextNode, ElementNode } from "../component/index.js";
import { createDomNode } from "./domBuilder.js";

export function patch(oldVnode, vnode) {
  let i, elm, parent;

  if (sameVnode(oldVnode, vnode)) {
    patchVnode(oldVnode, vnode);
  } else {
    elm = oldVnode.domNode;
    parent = elm.parentNode;

    createDomNode(vnode);

    if (parent !== null) {
      parent.insertBefore(vnode.domNode, elm.nextSibling);
      removeVnodes(parent, [oldVnode], 0, 0);
    }
  }
  return vnode;
}

// a viewTemplate is a vnode
function isVnode(vnode) {
  return vnode instanceof ViewTemplate;
}

function sameVnode(vnode1, vnode2) {
  return (
    vnode1.tag === vnode2.tag &&
    (!vnode1.properties || vnode1.properties.key === vnode2.properties.key)
  );
}

function patchVnode(oldVnode, vnode) {
  let i;

  const elm = (vnode.domNode = oldVnode.domNode);
  let oldCh = oldVnode.children;
  let ch = vnode.children;
  if (oldVnode === vnode) return;

  if (vnode instanceof ElementNode) {
    if (oldCh && ch) {
      if (oldCh !== ch) updateChildren(elm, oldCh, ch);
    } else if (ch) {
      if (oldVnode instanceof TextNode) elm.textContent("");
      addVnodes(elm, null, ch, 0, ch.length - 1);
    } else if (oldCh) {
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    } else if (oldVnode instanceof TextNode) {
      elm.textContent("");
    }
  } // textNode
  else if (oldVnode.string !== vnode.string) {
    if (oldCh) {
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    }
    elm.textContent = vnode.string;
  }
}

function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0,
    newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx;
  let idxInOld;
  let elmToMove;
  let before;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode);
      parentElm.insertBefore(
        oldStartVnode.domNode,
        oldEndVnode.domNode.nextSibling
      );
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode);
      parentElm.insertBefore(
        oldEndVnode.domNode,
        oldStartVnode.domNode.nextSibling
      );
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      idxInOld =
        oldKeyToIdx[
          newStartVnode.properties ? newStartVnode.properties.key : undefined
        ];
      if (idxInOld === undefined) {
        // New element
        parentElm.insertBefore(
          createDomNode(newStartVnode),
          oldStartVnode.domNode
        );
        newStartVnode = newCh[++newStartIdx];
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.tag !== newStartVnode.tag) {
          parentElm.insertBefore(
            createDomNode(newStartVnode),
            oldStartVnode.domNode
          );
        } else {
          patchVnode(elmToMove, newStartVnode);
          oldCh[idxInOld] = undefined;
          parentElm.insertBefore(elmToMove.domNode, oldStartVnode.domNode);
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
  }
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      before =
        newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].domNode;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx);
    } else {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }
}

function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    if (ch != null) {
      parentElm.insertBefore(createDomNode(ch), before);
    }
  }
}

function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    let ch = vnodes[startIdx];
    if (ch != null) {
      parentElm.removeChild(ch.domNode);
    }
  }
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  let i,
    map = {},
    key,
    ch;
  for (i = beginIdx; i <= endIdx; ++i) {
    ch = children[i];
    if (ch != null) {
      key = ch.properties ? ch.properties.key : undefined;
      if (key !== undefined) map[key] = i;
    }
  }
  return map;
}
