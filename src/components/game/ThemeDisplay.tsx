import { useTheme } from '../../contexts/ThemeContext';

const ThemeDisplay = () => {
  const { currentTheme } = useTheme();
  
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-md text-sm">
      <span className="font-medium mr-2">Theme:</span>
      <span>{currentTheme.name}</span>
    </div>
  );
};

export default ThemeDisplay;