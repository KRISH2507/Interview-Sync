import { Button } from "./ui/button";

export function DashboardHeader({ role, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          className="p-2 lg:hidden"
          onClick={onMenuClick}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>

        <div className="flex flex-1 items-center justify-between">
          {/* Greeting */}
          <div className="text-sm text-muted-foreground">
            Welcome back,{" "}
            {role === "candidate" ? "Candidate" : "Recruiter"}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="p-2">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </Button>

            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-primary/10" />
          </div>
        </div>
      </div>
    </header>
  );
}
