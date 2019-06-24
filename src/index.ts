import { LitElement } from "lit-element";

  declare interface lazyOptions {
    margin?: string;
  }
  
  
/**
 * Call this function as soon as the element is inside the viewport.
 * @param margin Optionally provide the padding (rootMargin) for IntersectionObserver. Determines how far from the viewport lazy loading starts. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left). The values can be percentages 
 * @example
```
    @lazy()
    lazyCallback() {
    // this will run when element is inside the viewport.
    }
```
* @example
```
    @lazy({margin: "100px"})
    lazyCallback() {
    // this will run when element is 100px from the viewport.
    }
```
*/
export function lazy(opt?: lazyOptions) {
    return (proto: LitElement, methodName: string): any  => {

        const { connectedCallback } = proto;
        proto.connectedCallback = function() {
            const method = this[methodName];
            const margin = opt ? opt.margin : "";
            registerLazy(proto, this, method, margin);
            return connectedCallback && connectedCallback.call(proto);
        }       
  }
}

/**
 * Register callback function for HTMLElement to be executed when the element is inside the viewport.
 *
 */
export function registerLazy(
  component: any,
  element: HTMLElement,
  callback: () => void,
  marginProp?: string
): void {
  if ("IntersectionObserver" in window) {
    const margin = getValidMargin(marginProp);
    if (!margin) {
      throw new Error(
        "@lazy() decorator's optional parameter 'margin' is given but not valid. It should be a string like CSS margin property, e.g. '10px 20px 30px 40px'(top, right, bottom, left) or just '10px' (all). The values can be percentages "
      );
    }
    let io = new IntersectionObserver(
      (data: any) => {
        if (data[0].isIntersecting) {
          callback.call(component);
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(element);
  } else {
    // fall back to setTimeout for Safari and IE
    setTimeout(() => {
      callback.call(component);
    }, 300);
  }
}

/**
 * Checks if margin has values like CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left). The values can be percentages.
 * For empty input string it returns default value '0px'. For not valid input it returns null.
 * @param margin Determines how far from the viewport lazy loading starts
 */
export function getValidMargin(margin?): string {
    const regexp = RegExp(/^(-?\d*\.?\d+)(px|%)$/);
    const marginString = margin || "0px";
    return marginString.split(/\s+/).every(margin => regexp.test(margin))
      ? marginString
      : null;
  }