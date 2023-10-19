export const trimStringInMiddle = (str: string, length: number): string => {
  return `${str.substring(0, length)}....${str.substring(
    str.length - length,
    str.length
  )}`;
};
