export default function ErrorPage() {
  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-extrabold text-destructive">Oops!</h1>
      <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred. Please try refreshing the page or contact support if the issue persists.
      </p>
    </div>
  );
}