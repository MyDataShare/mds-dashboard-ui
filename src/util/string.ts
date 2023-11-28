export const camelToSnake = (str: string) =>
  str &&
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  str
    .match(
      /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
    )!
    .map((s) => s.toLowerCase())
    .join('_');

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const stringToAlpha = (string: string) =>
  string
    .replace(/[^A-Za-z\s]/g, '')
    .replace(/\s/g, '-')
    .toLowerCase();
