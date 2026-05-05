export const sprintf = (format: string, ...args: any): string => {
  let i = 0;
  return format.replace(/%s/g, () => String(args[i++]));
};
