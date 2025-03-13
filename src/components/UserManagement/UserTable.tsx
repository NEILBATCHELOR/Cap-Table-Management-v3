import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { MoreHorizontal, Plus, Search, SortAsc, SortDesc } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import BulkActionMenu from "./BulkActionMenu";
import AddUserModal from "./AddUserModal";
import { getUsers } from "@/lib/users";
import { User } from "@/types/users";
import { useToast } from "../ui/use-toast";

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface UserTableProps {
  initialUsers?: User[];
  onSort?: (column: string) => void;
  onFilter?: (text: string) => void;
  onUserAction?: (action: string, userId: string) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
}

const UserTable = ({
  initialUsers,
  onSort = () => {},
  onFilter = () => {},
  onUserAction = () => {},
  pagination = { page: 1, pageSize: 10, total: 30 },
  onPageChange = () => {},
}: UserTableProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    userId: string;
  } | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      filterUsers(searchQuery);
    }
  }, [users, searchQuery]);

  const filterUsers = (query: string) => {
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery) ||
        user.role.toLowerCase().includes(lowercaseQuery) ||
        user.status.toLowerCase().includes(lowercaseQuery),
    );

    setFilteredUsers(filtered);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = async (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user.id || ""));

      // Log the bulk selection to audit logs
      try {
        const { logAction } = await import("@/lib/auditLogger");
        await logAction(
          "Bulk Selection",
          "current-user@example.com", // In a real app, this would be the current user
          `Selected all ${filteredUsers.length} users`,
          "Success",
        );
      } catch (error) {
        console.error("Failed to log bulk selection:", error);
      }
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleUserCreated = (userData: {
    name: string;
    email: string;
    role: string;
  }) => {
    // Refresh the user list after a new user is created
    fetchUsers();
    setShowAddModal(false);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "revoked":
        return "bg-red-100 text-red-800 border-red-200";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superAdmin":
      case "Super Admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "owner":
      case "Owner":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "complianceManager":
      case "Compliance Manager":
        return "bg-green-100 text-green-800 border-green-200";
      case "complianceOfficer":
      case "Compliance Officer":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "agent":
      case "Agent":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const toggleSort = (column: string) => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    onSort(column);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 w-1/3">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onFilter(e.target.value);
            }}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-4">
          {selectedUsers.length > 0 && (
            <BulkActionMenu selectedCount={selectedUsers.length} />
          )}
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedUsers.length === filteredUsers.length &&
                    filteredUsers.length > 0
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked === true)
                  }
                  disabled={filteredUsers.length === 0}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                Name{" "}
                {sortDirection === "asc" ? (
                  <SortAsc className="inline w-4 h-4" />
                ) : (
                  <SortDesc className="inline w-4 h-4" />
                )}
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-4 text-gray-500"
                >
                  {searchQuery ? "No matching users found" : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id || "")}
                      onCheckedChange={(checked) =>
                        handleSelectUser(user.id || "", checked === true)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-600 text-white font-medium border border-gray-200">
                        {user.name
                          .split(" ")
                          .map((name) => name.charAt(0))
                          .join("")}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeColor(user.role)}
                    >
                      {user.role.includes("Admin") ||
                      user.role.includes("Manager") ||
                      user.role.includes("Officer")
                        ? user.role
                        : user.role.charAt(0).toUpperCase() +
                          user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeColor(user.status)}
                    >
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onUserAction("edit", user.id || "")}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({
                              type: "revoke",
                              userId: user.id || "",
                            })
                          }
                          className="text-red-600"
                        >
                          Revoke Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
          {pagination.total} users
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page * pagination.pageSize >= pagination.total}
          >
            Next
          </Button>
        </div>
      </div>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "revoke"
                ? "Are you sure you want to revoke access for this user? This action requires multi-signature approval and cannot be easily undone."
                : "Are you sure you want to proceed with this action?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) {
                  onUserAction(confirmAction.type, confirmAction.userId);
                  setConfirmAction(null);
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddUserModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleUserCreated}
      />
    </div>
  );
};

export default UserTable;
