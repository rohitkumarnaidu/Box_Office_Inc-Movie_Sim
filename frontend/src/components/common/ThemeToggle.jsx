import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const options = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--card2)" }}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className="p-2 rounded-md transition-colors cursor-pointer"
          style={{
            backgroundColor: theme === value ? "var(--primary)" : "transparent",
            color: theme === value ? "#fff" : "var(--muted)",
          }}
          title={label}
          aria-label={`Set theme to ${label}`}
          aria-pressed={theme === value}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
