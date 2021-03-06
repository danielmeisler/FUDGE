// / <reference types="../../../Core/Build/FudgeCore"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Connects a [[Mutable]] to a DOM-Element and synchronizes that mutable with the mutator stored within.
   * Updates the mutable on interaction with the element and the element in time intervals.
   */
  export class Controller {
    // TODO: examine the use of the attribute key vs name. Key signals the use by FUDGE while name is standard and supported by forms
    public domElement: HTMLElement;
    protected timeUpdate: number = 190;
    /** Refererence to the [[FudgeCore.Mutable]] this ui refers to */
    protected mutable: ƒ.Mutable;
    /** [[FudgeCore.Mutator]] used to convey data to and from the mutable*/
    protected mutator: ƒ.Mutator;
    /** [[FudgeCore.Mutator]] used to store the data types of the mutator attributes*/
    protected mutatorTypes: ƒ.Mutator = null;

    constructor(_mutable: ƒ.Mutable, _domElement: HTMLElement) {
      this.domElement = _domElement;
      this.setMutable(_mutable);
      // TODO: examine, if this should register to one common interval, instead of each installing its own.
      window.setInterval(this.refresh, this.timeUpdate);
      this.domElement.addEventListener("input", this.mutateOnInput);
    }

    public setMutable(_mutable: ƒ.Mutable): void {
      this.mutable = _mutable;
      this.mutator = _mutable.getMutatorForUserInterface();
      if (_mutable instanceof ƒ.Mutable)
        this.mutatorTypes = _mutable.getMutatorAttributeTypes(this.mutator);
    }

    /**
     * Recursive method taking the [[ƒ.Mutator]] of a [[ƒ.Mutable]] or another existing [[ƒ.Mutator]] 
     * as a template and updating its values with those found in the given UI-domElement. 
     */
    public getMutator(_mutable: ƒ.Mutable = this.mutable, _domElement: HTMLElement = this.domElement, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator {
      // TODO: examine if this.mutator should also be addressed in some way...
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutatorForUserInterface();
      // TODO: Mutator type now only used for enums. Examine if there is another way
      let mutatorTypes: ƒ.MutatorAttributeTypes = _types || _mutable.getMutatorAttributeTypes(mutator);

      for (let key in mutator) {
        let element: HTMLElement = _domElement.querySelector(`[key=${key}]`);
        if (element == null)
          return mutator;

        if (element instanceof CustomElement)
          mutator[key] = (<CustomElement>element).getMutatorValue();
        else if (mutatorTypes[key] instanceof Object)
          (<HTMLSelectElement>element).value = <string>mutator[key];
        else {
          let subMutator: ƒ.Mutator = Reflect.get(mutator, key);
          let subMutable: ƒ.Mutable;
          subMutable = Reflect.get(_mutable, key);
          // let subTypes: ƒ.Mutator = subMutable.getMutatorAttributeTypes(subMutator);
          if (subMutable instanceof ƒ.Mutable)
            mutator[key] = this.getMutator(subMutable, element, subMutator); //, subTypes);
        }
      }
      return mutator;
    }

    /**
     * Recursive method taking the [[ƒ.Mutator]] of a [[ƒ.Mutable]] and updating the UI-domElement accordingly
     */
    public updateUserInterface(_mutable: ƒ.Mutable = this.mutable, _domElement: HTMLElement = this.domElement): void {
      // TODO: should get Mutator for UI or work with this.mutator (examine)
      this.mutable.updateMutator(this.mutator);

      let mutator: ƒ.Mutator = _mutable.getMutatorForUserInterface();
      let mutatorTypes: ƒ.MutatorAttributeTypes = {};
      if (_mutable instanceof ƒ.Mutable)
        mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
      for (let key in mutator) {
        let element: CustomElement = <CustomElement>_domElement.querySelector(`[key=${key}]`);
        if (!element)
          continue;

        let value: ƒ.General = mutator[key];

        if (element instanceof CustomElement && element != document.activeElement)
          element.setMutatorValue(value);
        else if (mutatorTypes[key] instanceof Object)
          element.setMutatorValue(value);
        else {
          // let fieldset: HTMLFieldSetElement = <HTMLFieldSetElement><HTMLElement>element;
          let subMutable: ƒ.Mutable = Reflect.get(_mutable, key);
          if (subMutable instanceof ƒ.Mutable)
            this.updateUserInterface(subMutable, element);
          else
            //element.setMutatorValue(value);
            Reflect.set(element, "value", value);
        }
      }
    }

    protected mutateOnInput = async (_event: Event) => {
      this.mutator = this.getMutator();
      await this.mutable.mutate(this.mutator);
      _event.stopPropagation();

      this.domElement.dispatchEvent(new Event(EVENT.MUTATE, { bubbles: true }));
    }

    protected refresh = (_event: Event) => {
      this.updateUserInterface();
    }
  }
}
