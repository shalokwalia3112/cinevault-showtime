import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Clapperboard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-background via-background/80 to-transparent">
      <nav className="flex items-center gap-8 px-6 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <Clapperboard className="text-primary" size={26} />
          <span className="font-display text-xl tracking-[0.15em] uppercase">
            Cine<span className="text-primary">Vault</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            activeProps={{ className: "text-foreground font-medium" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            activeOptions={{ exact: true }}
            className="transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/browse"
            search={{ q: "" }}

            activeProps={{ className: "text-foreground font-medium" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="transition-colors hover:text-foreground"
          >
            Browse
          </Link>
        </div>
        <form
          className="ml-auto flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) navigate({ to: "/browse", search: { q: q.trim() } });
          }}
        >
          {open && (
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies or series"
              className="w-40 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm outline-none focus:border-primary md:w-56"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            type={open ? "submit" : "button"}
            aria-label="Search"
            onClick={() => !open && setOpen(true)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search size={20} />
          </Button>
        </form>
      </nav>
    </header>
  );
}
