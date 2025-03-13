import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Plus,
  Loader2,
  CheckCircle,
  X,
  Users,
  UserPlus,
  UserMinus,
} from "lucide-react";

interface ManageGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInvestors: any[];
  onComplete: () => void;
}

interface Group {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  project_id?: string;
  member_count?: number;
  isSelected?: boolean;
  isMember?: boolean;
}

const ManageGroupsDialog = ({
  open,
  onOpenChange,
  selectedInvestors,
  onComplete,
}: ManageGroupsDialogProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [memberGroups, setMemberGroups] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");
  const { toast } = useToast();

  // Fetch all groups when dialog opens
  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  // Filter groups based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups]);

  // Fetch all investor groups and check membership
  const fetchGroups = async () => {
    try {
      setIsLoading(true);

      // Fetch all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("investor_groups")
        .select("id, name, created_at, updated_at, project_id");

      if (groupsError) throw groupsError;

      // If no investors are selected, just show all groups
      if (selectedInvestors.length === 0) {
        setGroups(groupsData || []);
        setFilteredGroups(groupsData || []);
        setIsLoading(false);
        return;
      }

      // Get all investor IDs
      const investorIds = selectedInvestors.map(
        (investor) => investor.id || investor.investor_id,
      );

      // Fetch group memberships for selected investors
      const { data: membershipsData, error: membershipsError } = await supabase
        .from("investor_group_members")
        .select("group_id")
        .in("investor_id", investorIds);

      if (membershipsError) throw membershipsError;

      // Count how many investors from selection are in each group
      const membershipCounts: Record<string, number> = {};
      membershipsData?.forEach((membership) => {
        membershipCounts[membership.group_id] =
          (membershipCounts[membership.group_id] || 0) + 1;
      });

      // Mark groups where all selected investors are members
      const memberGroupIds = Object.keys(membershipCounts).filter(
        (groupId) => membershipCounts[groupId] === investorIds.length,
      );

      setMemberGroups(memberGroupIds);

      // Enhance groups data with membership info
      const enhancedGroups = (groupsData || []).map((group) => ({
        ...group,
        isMember: memberGroupIds.includes(group.id),
      }));

      setGroups(enhancedGroups);
      setFilteredGroups(enhancedGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      toast({
        title: "Error",
        description: "Failed to load investor groups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle group selection
  const handleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  // Handle adding investors to selected groups
  const handleAddToGroups = async () => {
    if (selectedGroups.length === 0 || selectedInvestors.length === 0) return;

    try {
      setIsProcessing(true);

      const investorIds = selectedInvestors.map(
        (investor) => investor.id || investor.investor_id,
      );
      const now = new Date().toISOString();

      // Prepare batch of memberships to add
      const memberships = [];

      for (const groupId of selectedGroups) {
        for (const investorId of investorIds) {
          memberships.push({
            group_id: groupId,
            investor_id: investorId,
            created_at: now,
          });
        }
      }

      // Insert memberships (upsert to avoid duplicates)
      const { error } = await supabase
        .from("investor_group_members")
        .upsert(memberships, { onConflict: "group_id,investor_id" });

      if (error) throw error;

      // Update member counts for each group
      for (const groupId of selectedGroups) {
        await updateGroupMemberCount(groupId);
      }

      toast({
        title: "Success",
        description: `Added ${selectedInvestors.length} investors to ${selectedGroups.length} groups`,
      });

      // Reset selection and refresh groups
      setSelectedGroups([]);
      fetchGroups();
      onComplete();
    } catch (err) {
      console.error("Error adding investors to groups:", err);
      toast({
        title: "Error",
        description: "Failed to add investors to groups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle removing investors from selected groups
  const handleRemoveFromGroups = async () => {
    if (selectedGroups.length === 0 || selectedInvestors.length === 0) return;

    try {
      setIsProcessing(true);

      const investorIds = selectedInvestors.map(
        (investor) => investor.id || investor.investor_id,
      );

      // Delete memberships
      const { error } = await supabase
        .from("investor_group_members")
        .delete()
        .in("group_id", selectedGroups)
        .in("investor_id", investorIds);

      if (error) throw error;

      // Update member counts for each group
      for (const groupId of selectedGroups) {
        await updateGroupMemberCount(groupId);
      }

      toast({
        title: "Success",
        description: `Removed ${selectedInvestors.length} investors from ${selectedGroups.length} groups`,
      });

      // Reset selection and refresh groups
      setSelectedGroups([]);
      fetchGroups();
      onComplete();
    } catch (err) {
      console.error("Error removing investors from groups:", err);
      toast({
        title: "Error",
        description:
          "Failed to remove investors from groups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Update member count for a group
  const updateGroupMemberCount = async (groupId: string) => {
    try {
      // Count members in the group
      const { count, error: countError } = await supabase
        .from("investor_group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);

      if (countError) throw countError;

      // Update the group's updated_at timestamp
      const { error: updateError } = await supabase
        .from("investor_groups")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", groupId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error(`Error updating member count for group ${groupId}:`, err);
    }
  };

  // Handle creating a new group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Create new group
      const { data: newGroup, error: createError } = await supabase
        .from("investor_groups")
        .insert({
          name: newGroupName.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      // If investors are selected, add them to the new group
      if (selectedInvestors.length > 0 && newGroup) {
        const investorIds = selectedInvestors.map(
          (investor) => investor.id || investor.investor_id,
        );
        const now = new Date().toISOString();

        const memberships = investorIds.map((investorId) => ({
          group_id: newGroup.id,
          investor_id: investorId,
          created_at: now,
        }));

        const { error: membershipError } = await supabase
          .from("investor_group_members")
          .insert(memberships);

        if (membershipError) throw membershipError;

        // Update member count
        await updateGroupMemberCount(newGroup.id);
      }

      toast({
        title: "Success",
        description: `Group "${newGroupName}" created successfully${selectedInvestors.length > 0 ? ` with ${selectedInvestors.length} investors` : ""}`,
      });

      // Reset form and refresh groups
      setNewGroupName("");
      setIsCreatingGroup(false);
      fetchGroups();
    } catch (err) {
      console.error("Error creating group:", err);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Manage Investor Groups</span>
          </DialogTitle>
          <DialogDescription>
            {selectedInvestors.length > 0
              ? `Manage group memberships for ${selectedInvestors.length} selected investor(s)`
              : "Browse and manage investor groups"}
          </DialogDescription>
        </DialogHeader>

        {isCreatingGroup ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>

            {selectedInvestors.length > 0 && (
              <div className="bg-muted/20 p-4 rounded-md">
                <p className="text-sm">
                  The selected {selectedInvestors.length} investor(s) will be
                  automatically added to this group.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {selectedInvestors.length > 0 && (
              <div className="flex space-x-2 mb-4">
                <Button
                  variant={activeTab === "add" ? "default" : "outline"}
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => {
                    setActiveTab("add");
                    setSelectedGroups([]);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add to Groups</span>
                </Button>
                <Button
                  variant={activeTab === "remove" ? "default" : "outline"}
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => {
                    setActiveTab("remove");
                    setSelectedGroups([]);
                  }}
                >
                  <UserMinus className="h-4 w-4" />
                  <span>Remove from Groups</span>
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsCreatingGroup(true)}
              >
                <Plus className="h-4 w-4" />
                <span>New Group</span>
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-md">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No groups found. Create a new group to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {filteredGroups.map((group) => {
                  const isInGroup = memberGroups.includes(group.id);
                  // In add mode, hide groups where all investors are already members
                  // In remove mode, only show groups where all investors are members
                  const shouldShow =
                    activeTab === "add"
                      ? selectedInvestors.length === 0 || !isInGroup
                      : selectedInvestors.length === 0 || isInGroup;

                  if (!shouldShow) return null;

                  return (
                    <div
                      key={group.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${selectedGroups.includes(group.id) ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => handleGroupSelection(group.id)}
                          id={`group-${group.id}`}
                        />
                        <div>
                          <Label
                            htmlFor={`group-${group.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {group.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Created{" "}
                            {new Date(
                              group.created_at || "",
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isInGroup && selectedInvestors.length > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            Member
                          </Badge>
                        )}
                        <Badge variant="outline">Group</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {isCreatingGroup ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingGroup(false);
                  setNewGroupName("");
                  setNewGroupDescription("");
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Group"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              {activeTab === "add" ? (
                <Button
                  onClick={handleAddToGroups}
                  disabled={
                    selectedGroups.length === 0 ||
                    selectedInvestors.length === 0 ||
                    isProcessing
                  }
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add to {selectedGroups.length} Group
                      {selectedGroups.length !== 1 && "s"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleRemoveFromGroups}
                  disabled={
                    selectedGroups.length === 0 ||
                    selectedInvestors.length === 0 ||
                    isProcessing
                  }
                  variant="destructive"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove from {selectedGroups.length} Group
                      {selectedGroups.length !== 1 && "s"}
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageGroupsDialog;
