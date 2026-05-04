export type FontChoice = {
  id: string;
  label: string;
  /** iOS fontFamily — совпадает с TTF (Minecraft Rus). */
  iosFontFamily?: string;
};

export const FONT_CHOICES: FontChoice[] = [
  { id: 'minecraft', label: 'Minecraft', iosFontFamily: 'Minecraft Rus' },
];

export function fontFamilyForId(id: string): string | undefined {
  return FONT_CHOICES.find(f => f.id === id)?.iosFontFamily || 'Minecraft Rus';
}
