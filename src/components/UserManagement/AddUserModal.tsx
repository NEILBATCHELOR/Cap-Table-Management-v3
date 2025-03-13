import React, { useState, useEffect } from "react";
import { generateKeyPair } from "@/lib/crypto";
import { createUser } from "@/lib/users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card } from "../ui/card";
import { useToast } from "../ui/use-toast";

interface AddUserModalProps {
  open?: boolean;
  onClose?: () => void;
  onSubmit?: (data: { name: string; email: string; role: string }) => void;
}

const AddUserModal = ({
  open = true,
  onClose = () => {},
  onSubmit = () => {},
}: AddUserModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("superAdmin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyPair, setKeyPair] = useState<{
    publicKey: string;
    encryptedPrivateKey: string;
  } | null>(null);

  useEffect(() => {
    generateNewKeyPair();
  }, []);

  const generateNewKeyPair = async () => {
    try {
      const newKeyPair = await generateKeyPair();
      setKeyPair(newKeyPair);
    } catch (error) {
      console.error("Error generating key pair:", error);
      toast({
        title: "Error",
        description: "Failed to generate key pair",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role || !keyPair) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user in the database
      const user = await createUser({
        name,
        email,
        role,
        publicKey: keyPair.publicKey,
        encryptedPrivateKey: keyPair.encryptedPrivateKey,
      });

      toast({
        title: "Success",
        description: `User ${name} has been created successfully`,
      });

      // Call the onSubmit callback with the user data
      onSubmit({ name, email, role });

      // Reset form
      setName("");
      setEmail("");
      setRole("superAdmin");
      generateNewKeyPair();

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "superAdmin":
        return "Highest authority with full control over system settings, security protocols, and user management. Can configure multi-signature policies, manage cryptographic keys, and oversee critical governance actions. Requires multi-sig approval for high-risk actions.";
      case "owner":
        return "Represents the issuer with full control over token settings, issuance configurations, and user invitations within project scope. Manages investor qualification and token distribution with multi-sig approval requirements.";
      case "complianceManager":
        return "Oversees regulatory approvals, compliance automation, and investor validation. Manages KYC/AML checks, jurisdiction restrictions, and participates in multi-sig approvals for regulatory actions.";
      case "agent":
        return "Supports issuers and investors with onboarding, token distribution, and reporting. Manages investor interactions and facilitates compliance checks without system-level access.";
      case "complianceOfficer":
        return "Reviews and approves investor applications based on KYC/AML requirements, monitors compliance with regulations, and participates in multi-signature flows for high-risk transactions.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter user's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter user's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superAdmin">Super Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="complianceManager">
                    Compliance Manager
                  </SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="complianceOfficer">
                    Compliance Officer
                  </SelectItem>
                </SelectContent>
              </Select>
              {role && (
                <p className="mt-2 text-sm text-gray-500">
                  {getRoleDescription(role)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label>Generated Key Pair</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateNewKeyPair}
                  type="button"
                >
                  Regenerate Keys
                </Button>
              </div>
              <Card className="p-4 space-y-2 bg-gray-50">
                <div>
                  <Label className="text-sm text-gray-500">Public Key</Label>
                  <div className="mt-1 text-sm font-mono break-all">
                    {keyPair?.publicKey || "Generating..."}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Private Key</Label>
                  <div className="mt-1 text-sm font-mono break-all">
                    {keyPair?.encryptedPrivateKey
                      ? "********"
                      : "Generating..."}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
