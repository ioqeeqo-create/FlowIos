export type FontChoice = {
  id: string;
  label: string;
  /** iOS fontFamily; undefined = system default */
  iosFontFamily?: string;
};

export const FONT_CHOICES: FontChoice[] = [
  { id: 'system', label: 'Системный' },
  { id: 'georgia', label: 'Georgia', iosFontFamily: 'Georgia' },
  { id: 'helvetica', label: 'Helvetica Neue', iosFontFamily: 'Helvetica Neue' },
  { id: 'menlo', label: 'Menlo', iosFontFamily: 'Menlo' },
  { id: 'courier', label: 'Courier New', iosFontFamily: 'Courier New' },
  { id: 'avenir', label: 'Avenir Next', iosFontFamily: 'Avenir Next' },
  { id: 'futura', label: 'Futura', iosFontFamily: 'Futura' },
  { id: 'palatino', label: 'Palatino', iosFontFamily: 'Palatino' },
  { id: 'copperplate', label: 'Copperplate', iosFontFamily: 'Copperplate' },
];

export function fontFamilyForId(id: string): string | undefined {
  return FONT_CHOICES.find(f => f.id === id)?.iosFontFamily;
}
