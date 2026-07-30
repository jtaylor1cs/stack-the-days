// Placeholder for a future ad/sponsor block. Renders nothing functional yet —
// it just marks where that would go once there's an audience worth monetizing.
export function AdSlot({ label = "Sponsor slot" }: { label?: string }) {
  return <div className="ad-slot">{label} — reserved for later</div>;
}
