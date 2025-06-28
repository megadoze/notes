export function searchWord(text, searchword) {
  const searchToUpperCase = searchword.toUpperCase();
  const index = text.toUpperCase().indexOf(searchToUpperCase);

  const firstWord = text.slice(0, index);
  const change = text.slice(index, index + searchword.length);
  const lastWord = text.slice(index + searchword.length);

  if (index >= 0) {
    return (
      <>
        <span>{firstWord}</span>
        <span className="backlight">{change}</span>
        <span>{lastWord}</span>
      </>
    );
  }
  return text;
}
