import { useTheme, type Theme } from '../lib/hooks/useTheme';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value as Theme);
  };

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span>Theme</span>
      <select aria-label="Theme" value={theme} onChange={handleThemeChange}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="ocean">Ocean</option>
      </select>
    </label>
  );
}