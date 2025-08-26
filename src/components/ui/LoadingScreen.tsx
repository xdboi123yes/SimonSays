import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-50">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-200">
          Loading Simon Says...
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 pulse-animation">
          Preparing your game experience
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;