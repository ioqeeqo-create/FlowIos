export type FontChoice = {
  id: string;
  label: string;
  /** iOS fontFamily. The app is locked to Minecraftia. */
  iosFontFamily?: string;
};

export const FONT_CHOICES: FontChoice[] = [
  { id: 'minecraft', label: 'Minecraft', iosFontFamily: 'Minecraftia' },
];

export function fontFamilyForId(id: string): string | undefined {
  return FONT_CHOICES.find(f => f.id === id)?.iosFontFamily || 'Minecraftia';
}
