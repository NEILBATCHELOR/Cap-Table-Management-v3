import React from "react";
import { MoreHorizontal, UserX, UserCog, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

interface BulkActionMenuProps {
  selectedCount?: number;
  onRevoke?: () => void;
  onReassign?: () => void;
  onSuspend?: () => void;
}

const BulkActionMenu = ({
  selectedCount = 2,
  onRevoke = () => console.log("Revoke clicked"),
  onReassign = () => console.log("Reassign clicked"),
  onSuspend = () => console.log("Suspend clicked"),
}: BulkActionMenuProps) => {
  return (
    <div className="bg-white p-2 rounded-lg shadow-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            Bulk Actions ({selectedCount})
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onRevoke} className="cursor-pointer">
            <UserX className="mr-2 h-4 w-4" />
            <span>Revoke Access</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onReassign} className="cursor-pointer">
            <UserCog className="mr-2 h-4 w-4" />
            <span>Reassign Role</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSuspend} className="cursor-pointer">
            <Ban className="mr-2 h-4 w-4" />
            <span>Suspend Users</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BulkActionMenu;
