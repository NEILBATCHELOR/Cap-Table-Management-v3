import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Check, UserCheck } from "lucide-react";

interface Approver {
  id: string;
  name: string;
  role: string;
  avatar: string;
  approved: boolean;
}

interface MultiSigModalProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  requiredSignatures?: number;
  approvers?: Approver[];
  onApprove?: () => void;
}

const APPROVAL_TIMEOUT_MINUTES = 30;

const MultiSigModal = ({
  open = true,
  onClose = () => {},
  title = "Action Requires Approval",
  description = "This action requires multi-signature approval to proceed",
  requiredSignatures = 3,
  approvers = [
    {
      id: "1",
      name: "John Doe",
      role: "Super Admin",
      avatar:
        "https://api.dicebear.com/7.x/micah/svg?seed=john&backgroundColor=2563eb",
      approved: true,
    },
    {
      id: "2",
      name: "Jane Smith",
      role: "Owner",
      avatar:
        "https://api.dicebear.com/7.x/micah/svg?seed=jane&backgroundColor=2563eb",
      approved: false,
    },
    {
      id: "3",
      name: "Bob Johnson",
      role: "Compliance Manager",
      avatar:
        "https://api.dicebear.com/7.x/micah/svg?seed=bob&backgroundColor=2563eb",
      approved: true,
    },
    {
      id: "4",
      name: "Alice Brown",
      role: "Compliance Officer",
      avatar:
        "https://api.dicebear.com/7.x/micah/svg?seed=alice&backgroundColor=2563eb",
      approved: false,
    },
    {
      id: "5",
      name: "Charlie Wilson",
      role: "Owner",
      avatar:
        "https://api.dicebear.com/7.x/micah/svg?seed=charlie&backgroundColor=2563eb",
      approved: false,
    },
  ],
  onApprove = () => console.log("Approved"),
}: MultiSigModalProps) => {
  const approvedCount = approvers.filter((a) => a.approved).length;
  const [timeRemaining, setTimeRemaining] = React.useState(
    APPROVAL_TIMEOUT_MINUTES * 60,
  );
  const progress = (approvedCount / requiredSignatures) * 100;

  React.useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onClose]);

  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Owner":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Compliance Manager":
        return "bg-green-100 text-green-800 border-green-200";
      case "Compliance Officer":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "Agent":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-gray-500">{description}</p>
          <p className="text-sm text-amber-600">
            Time remaining: {formatTimeRemaining()}
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Approval Progress ({approvedCount}/{requiredSignatures})
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Approvers</h4>
            <div className="space-y-3">
              {approvers.map((approver) => (
                <div
                  key={approver.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-600 text-white font-medium border-2 border-gray-200">
                        {approver.name
                          .split(" ")
                          .map((name) => name.charAt(0))
                          .join("")}
                      </div>
                      <span className="text-sm font-medium">
                        {approver.name}
                      </span>
                    </div>
                    <div className="ml-13 pl-13">
                      <Badge
                        variant="outline"
                        className={`ml-13 mt-1 ${getRoleBadgeColor(approver.role)}`}
                      >
                        {approver.role}
                      </Badge>
                    </div>
                  </div>
                  {approver.approved ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-1" />
                      <span className="text-sm">Approved</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onApprove}
            className="space-x-2"
            disabled={approvedCount >= requiredSignatures}
          >
            <UserCheck className="h-4 w-4" />
            <span>Approve</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MultiSigModal;
