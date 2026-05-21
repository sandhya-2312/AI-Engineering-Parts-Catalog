import { cn } from './ui/utils';

const LOGO_SRC = '/unison-petrocon-logo.png';

type AppLogoProps = {
  className?: string;
  variant?: 'full' | 'mark';
};

export function AppLogo({ className, variant = 'full' }: AppLogoProps) {
  if (variant === 'mark') {
    return (
      <div className={cn('h-8 w-8 overflow-hidden shrink-0 rounded-md bg-white', className)}>
        <img
          src={LOGO_SRC}
          alt="Unison Petrocon"
          className="h-full w-auto max-w-none object-left object-contain bg-white"
        />
      </div>
    );
  }

  return (
    <img
      src={LOGO_SRC}
      alt="Unison Petrocon Fixing Technologie"
      className={cn('block h-12 w-auto max-w-full mx-auto object-contain object-center bg-white rounded-md', className)}
    />
  );
}
