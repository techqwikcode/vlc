export interface SubtitleCue {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

function parseTimestamp(ts: string): number {
  const [h, m, rest] = ts.trim().split(":");
  const [s, ms] = rest.split(",");
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
}

export function parseSRT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const blocks = content.trim().replace(/\r\n/g, "\n").split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split("\n");
    if (lines.length < 3) continue;

    const id = lines[0].trim();
    const timeMatch = lines[1].match(
      /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/
    );
    if (!timeMatch) continue;

    cues.push({
      id,
      startTime: parseTimestamp(timeMatch[1]),
      endTime: parseTimestamp(timeMatch[2]),
      text: lines.slice(2).join("\n").replace(/<[^>]+>/g, ""),
    });
  }

  return cues;
}

export function getActiveCues(cues: SubtitleCue[], time: number): SubtitleCue[] {
  return cues.filter((c) => time >= c.startTime && time <= c.endTime);
}
