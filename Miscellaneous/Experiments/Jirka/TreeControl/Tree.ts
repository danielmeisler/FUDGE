///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;

  export enum TREE_CLASS {
    SELECTED = "selected",
    INACTIVE = "inactive"
  }

  export enum EVENT_TREE {
    RENAME = "rename",
    OPEN = "open",
    FOCUS_NEXT = "focusNext",
    FOCUS_PREVIOUS = "focusPrevious",
    FOCUS_IN = "focusin",
    FOCUS_OUT = "focusout",
    DELETE = "delete",
    CHANGE = "change",
    DOUBLE_CLICK = "dblclick",
    KEY_DOWN = "keydown",
    DRAG_START = "dragstart",
    DRAG_OVER = "dragover",
    DROP = "drop",
    POINTER_UP = "pointerup",
    SELECT = "itemselect"
  }

  /**
   * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
   * Additionally, it holds an instance of [[TreeList]] to display children of the corresponding object.
   */
  export class Tree<T> extends TreeList<T> {
    public proxy: TreeProxy<T>;

    constructor(_proxy: TreeProxy<T>, _root: T) {
      super([]);
      this.proxy = _proxy;
      let root: TreeItem<T> = new TreeItem<T>(this.proxy, _root);
      this.appendChild(root);

      this.addEventListener(EVENT_TREE.OPEN, this.hndOpen);
      this.addEventListener(EVENT_TREE.RENAME, this.hndRename);
      this.addEventListener(EVENT_TREE.SELECT, this.hndSelect);
      this.addEventListener(EVENT_TREE.DROP, this.hndDrop);
    }

    public clearSelection(): void {
      this.proxy.selection.splice(0);
      this.displaySelection(<T[]>this.proxy.selection);
    }

    private hndOpen(_event: Event): void {
      let item: TreeItem<T> = <TreeItem<T>>_event.target;
      let children: T[] = this.proxy.getChildren(item.data);
      if (!children)
        return;

      let branch: TreeList<T> = this.createBranch(children);
      item.setBranch(branch);
      // tree.displaySelection(this.proxy.selection);
    }

    private createBranch(_data: T[]): TreeList<T> {
      let branch: TreeList<T> = new TreeList<T>([]);
      for (let child of _data) {
        branch.addItems([new TreeItem(this.proxy, child)]);
      }
      return branch;
    }

    private hndRename(_event: Event): void {
      let item: TreeItem<T> = <TreeItem<T>>(<HTMLInputElement>_event.target).parentNode;
      let renamed: boolean = this.proxy.rename(item.data, item.getLabel());
      if (renamed)
        item.setLabel(this.proxy.getLabel(item.data));
    }

    // Callback / Eventhandler in Tree
    private hndSelect(_event: CustomEvent): void {
      _event.stopPropagation();
      let index: number = this.proxy.selection.indexOf(_event.detail.data);

      if (_event.detail.interval) {
        let dataStart: T = <T>this.proxy.selection[0];
        let dataEnd: T = _event.detail.data;
        this.clearSelection();
        this.selectInterval(dataStart, dataEnd);
        return;
      }

      if (index >= 0 && _event.detail.additive)
        this.proxy.selection.splice(index, 1);
      else {
        if (!_event.detail.additive)
          this.clearSelection();
        this.proxy.selection.push(_event.detail.data);
      }

      this.displaySelection(<T[]>this.proxy.selection);
    }

    // Use proxy to manage drop...
    private hndDrop(_event: DragEvent): void {
      _event.stopPropagation();

      // if drop target included in drag source -> no drag&drop possible
      if (this.proxy.dragDrop.source.indexOf(this.proxy.dragDrop.target) > -1)
        return;

      // let removed: TreeEntry = deleteItem(this.proxy.dragSource);
      if (!this.proxy.drop(<T[]>this.proxy.dragDrop.source, <T>this.proxy.dragDrop.target))
        return;

      this.delete(<T[]>this.proxy.dragDrop.source);

      let targetData: T = <T>this.proxy.dragDrop.target;
      let targetItem: TreeItem<T> = this.findOpen(targetData);

      let branch: TreeList<T> = this.createBranch(this.proxy.getChildren(targetData));
      let old: TreeList<T> = targetItem.getBranch();
      targetItem.hasChildren = true;
      if (old)
        old.restructure(branch);
      else
        targetItem.open(true);

      this.proxy.dragDrop.source = [];
      this.proxy.dragDrop.target = null;
    }
  }

  customElements.define("ul-tree", <CustomElementConstructor><unknown>Tree, { extends: "ul" });
}
