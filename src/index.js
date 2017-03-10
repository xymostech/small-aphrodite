// @flow
function deepMerge(a, b) {
  if (typeof a !== "object") {
    return b;
  }

  const result = {...a};
  for (const [key, value] of Object.entries(b)) {
    if (key in a) {
      result[key] = deepMerge(a[key], b[key]);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// borderRadius -> border-radius
const kebabify = (key: string): string =>
  key.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`);

let stylesheetElement: ?HTMLElement;
function insertStyles(generatedCSS: string) {
  if (!stylesheetElement) {
    stylesheetElement = document.querySelector("style[data-smallaph]");
  }
  if (!stylesheetElement) {
    stylesheetElement = document.createElement("style");
    stylesheetElement.setAttribute("data-smallaph", "");
    document.head && document.head.appendChild(stylesheetElement);
  }
  stylesheetElement.appendChild(
    document.createTextNode(generatedCSS));
}

function generatePlainCSS(styles: any, selector: string): string {
  if (Object.keys(styles).length === 0) {
    return "";
  }

  let result = `${selector}{`;
  for (const [key, value] of Object.entries(styles)) {
    result += `${kebabify(key)}: ${(value: any)} !important;`;
  }
  return result + "}";
}

function generateNestedCSS(styles: any, selector: string): string {
  styles = {...styles};

  let nestedCSS = "";
  for (const [key, value] of Object.entries(styles)) {
    if (key[0] === ":") {
      nestedCSS += generateNestedCSS(
        value,
        // .foo:blah
        `${selector}${key}`
      );
      delete styles[key];
    }
    if (key[0] === "@") {
      // @media screen{ .foo{ ... } }
      nestedCSS += `${key}{ ` +
        generateNestedCSS(value, selector) +
      " }";
      delete styles[key];
    }
  }

  return nestedCSS + generatePlainCSS(styles, selector);
}

const insertedClassNames = new Map();
function maybeInsertStyles(styles: any[], className: string) {
  if (!insertedClassNames.has(className)) {
    insertedClassNames.set(className, true);

    const mergedStyles = styles.reduce(deepMerge);
    const generatedCSS = generateNestedCSS(mergedStyles, className);
    insertStyles(generatedCSS);
  }
}

type Style = {
  _name: string,
  _definition: any,
};

export const StyleSheet = {
  create(styleDefinitions: {[string]: any}): {[string]: Style} {
    const result: {[string]: Style} = {};
    for (const [name, styles] of Object.entries(styleDefinitions)) {
      result[name] = {
        _name: name,
        _definition: styles,
      };
    }
    return result;
  }
};

export function css(...styles: (Style | false | null)[]) {
  const filtered: Style[] = (styles: any).filter(x => x);
  const className = `.${filtered.map(x => x._name).join("-")}`;
  maybeInsertStyles(
    filtered.map(x => x._definition),
    className
  );
  return className;
}
