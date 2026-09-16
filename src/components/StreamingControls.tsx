import { Clapperboard, Languages, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StreamingServer = 1 | 2 | 3 | 4;

const servers: { id: StreamingServer; name: string; note: string }[] = [
  { id: 1, name: "Server 1", note: "Fast HD" },
  { id: 2, name: "Server 2", note: "Multi-Embed" },
  { id: 3, name: "Server 3", note: "Alpha Direct" },
  { id: 4, name: "Server 4", note: "Hollywood Ultimate" },
];

type StreamingControlsProps = {
  activeServer: StreamingServer;
  onServerChange: (server: StreamingServer) => void;
  seasonControl?: React.ReactNode;
  episodeControl?: React.ReactNode;
};

export function StreamingControls({
  activeServer,
  onServerChange,
  seasonControl,
  episodeControl,
}: StreamingControlsProps) {
  return (
    <div className="border-b border-border bg-card/45 px-4 py-5 sm:px-5" aria-label="Streaming controls">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase">
          <Server size={16} className="text-primary" /> Streaming servers
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Languages size={15} /> Audio and subtitles are available inside each player
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {servers.map((server) => {
          const active = activeServer === server.id;
          return (
            <Button
              key={server.id}
              type="button"
              variant={active ? "default" : "outline"}
              aria-pressed={active}
              onClick={() => onServerChange(server.id)}
              className={cn(
                "h-auto min-h-12 min-w-0 flex-col items-start gap-0.5 whitespace-normal px-3 py-2 text-left",
                !active && "bg-background/40",
              )}
            >
              <span className="w-full truncate font-bold">{server.name}</span>
              <span className={cn("w-full truncate text-xs", active ? "text-primary-foreground/75" : "text-muted-foreground")}>
                {server.note}
              </span>
            </Button>
          );
        })}
      </div>

      {(seasonControl || episodeControl) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Clapperboard size={16} className="text-primary" /> Episode
          </span>
          {seasonControl}
          {episodeControl}
        </div>
      )}
    </div>
  );
}