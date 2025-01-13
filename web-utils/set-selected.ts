export function setSelected(elem: HTMLSelectElement, value: string) {
  for (let option of elem.options) {
    if (option.value === value) {
      option.selected = true;
    } else {
      option.selected = false;
    }
  }
}