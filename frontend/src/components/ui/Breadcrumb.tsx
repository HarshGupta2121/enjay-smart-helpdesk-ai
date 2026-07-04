import { useLocation, Link } from 'react-router-dom';

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        // Capitalize and clean up path segment
        const title = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

        return (
          <div key={to} className="flex items-center space-x-1">
            <span>/</span>
            {last ? (
              <span className="font-medium text-foreground">{title}</span>
            ) : (
              <Link to={to} className="hover:text-foreground transition-colors">
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}