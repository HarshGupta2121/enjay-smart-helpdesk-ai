import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading Enjay Smart HelpDesk AI...</p>
      </div>
    </div>
  );
}