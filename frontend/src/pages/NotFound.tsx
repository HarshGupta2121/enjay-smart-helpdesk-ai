import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-extrabold text-primary">404</h1>
      <h2 className="text-xl font-semibold text-muted-foreground">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md text-center">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
        Return to Dashboard
      </Link>
    </div>
  );
}