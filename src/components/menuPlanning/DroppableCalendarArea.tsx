"use client";
import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableCalendarAreaProps {
  dayId: string;
  children: ReactNode;
  className?: string;
}
// TODO: figure out how this looks and if I can reuse it
export default function DroppableCalendarArea({ dayId, children }: DroppableCalendarAreaProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${dayId}`,
    data: {
      type: "calendar",
      dayId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-h-55 w-full flex-1 flex-col gap-2 rounded-[10px] p-4 transition-colors ${
        isOver ? "bg-radish-100 border-2 border-radish-900" : "border border-medium-gray/20 bg-white/30"
      }`}
    >
      {children}
    </div>
  );
}
