export function temReplaceKeywordsInString(ignoreKeywords, data, processFn) {
  const replaceKeywords = ignoreKeywords.map((_, i) => `::key-word-${i}`);
  let isReplaceDirty = false;
  let processData = data;
  if (ignoreKeywords.length > 0) {
    // record the replace status
    processData = ignoreKeywords.reduce((acc, keyword, i) => acc.replace(new RegExp(keyword, 'g'), () => {
      isReplaceDirty = true;
      return replaceKeywords[i];
    }), data);
  }
  processFn(processData, (css) => {
    if (isReplaceDirty) {
      // replace the key-word back to the original keyword
      return replaceKeywords.reduce((acc, keyword, i) => acc.replace(new RegExp(keyword, 'g'), ignoreKeywords[i]), css);
    }
    return css;
  });
}

export default {}