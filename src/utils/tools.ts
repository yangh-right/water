export const uniqId = (() => {
  let seed = 0;
  return (prefix = "dp") => {
    seed++;
    return `${prefix}-${seed}`;
  };
})();
export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, ms);
  });
}
