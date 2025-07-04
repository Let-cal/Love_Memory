"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGroup {
  id: string;
  name: string;
  dateRange: { start: Date; end: Date };
  description: string;
}

interface GroupSelectorProps {
  currentGroup: string;
  onChange: (groupId: string) => void;
  groups: ImageGroup[];
}

export default function GroupSelector({
  currentGroup,
  onChange,
  groups,
}: GroupSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 bg-white/20 text-white hover:bg-white/40"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-800 border-slate-700">
        {groups.map((group) => (
          <DropdownMenuItem
            key={group.id}
            onClick={() => onChange(group.id)}
            className={cn(
              "text-white hover:bg-slate-700",
              currentGroup === group.id && "bg-slate-700"
            )}
          >
            {group.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}