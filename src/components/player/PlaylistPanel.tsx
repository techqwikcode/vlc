import { X, Music, Film, Trash2 } from "lucide-react";
import type { MediaFile } from "@/lib/media-utils";

interface PlaylistPanelProps {
  playlist: MediaFile[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  onClose: () => void;
}

export function PlaylistPanel({
  playlist,
  currentIndex,
  onSelect,
  onRemove,
  onClear,
  onClose,
}: PlaylistPanelProps) {
  return (
    <div className="w-72 bg-card border-l border-border flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Playlist</h3>
        <div className="flex items-center gap-1">
          {playlist.length > 0 && (
            <button onClick={onClear} className="player-control-btn p-1" title="Clear playlist">
              <Trash2 size={14} />
            </button>
          )}
          <button onClick={onClose} className="player-control-btn p-1" title="Close playlist">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
            <Music size={32} className="opacity-30" />
            <p>No media files</p>
            <p className="text-xs">Drop files or click Open</p>
          </div>
        ) : (
          playlist.map((file, index) => (
            <div
              key={file.id}
              className={`playlist-item flex items-center gap-2 group ${
                index === currentIndex ? "playlist-item-active" : ""
              }`}
              onClick={() => onSelect(index)}
            >
              {file.type === "video" ? (
                <Film size={14} className="shrink-0 opacity-50" />
              ) : (
                <Music size={14} className="shrink-0 opacity-50" />
              )}
              <span className="truncate flex-1">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-destructive"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
        {playlist.length} item{playlist.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
