import React, { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Save } from "lucide-react";

// Form validation schema
const projectFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  status: z.string().min(1, { message: "Please select a status." }),
  project_type: z.string().min(1, { message: "Please select a project type." }),
  token_symbol: z.string().optional(),
  target_raise: z.coerce.number().optional(),
  authorized_shares: z.coerce.number().optional(),
  share_price: z.coerce.number().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormValues) => void;
  isProcessing: boolean;
  title: string;
  description: string;
  defaultValues?: any;
}

const ProjectDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isProcessing,
  title,
  description,
  defaultValues,
}: ProjectDialogProps) => {
  // Initialize form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
      project_type: "equity",
      token_symbol: "",
      target_raise: undefined,
      authorized_shares: undefined,
      share_price: undefined,
    },
  });

  // Set form values when editing a project
  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        name: defaultValues.name || "",
        description: defaultValues.description || "",
        status: defaultValues.status || "draft",
        project_type: defaultValues.project_type || "equity",
        token_symbol: defaultValues.token_symbol || "",
        target_raise: defaultValues.target_raise,
        authorized_shares: defaultValues.authorized_shares,
        share_price: defaultValues.share_price,
      });
    } else if (open) {
      form.reset({
        name: "",
        description: "",
        status: "draft",
        project_type: "equity",
        token_symbol: "",
        target_raise: undefined,
        authorized_shares: undefined,
        share_price: undefined,
      });
    }
  }, [open, defaultValues, form]);

  // Get project type options
  const projectTypeOptions = [
    // Traditional Assets
    { value: "structured_products", label: "Structured Products" },
    { value: "equity", label: "Equity" },
    { value: "commodities", label: "Commodities" },
    { value: "funds_etfs_etps", label: "Funds, ETFs, ETPs" },
    { value: "bonds", label: "Bonds" },
    {
      value: "quantitative_investment_strategies",
      label: "Quantitative Investment Strategies",
    },
    // Alternative Assets
    { value: "private_equity", label: "Private Equity" },
    { value: "private_debt", label: "Private Debt" },
    { value: "real_estate", label: "Real Estate" },
    { value: "energy", label: "Energy" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "collectibles", label: "Collectibles & Other Assets" },
    // Digital Assets
    { value: "digital_tokenised_fund", label: "Digital Tokenised Fund" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {defaultValues ? (
              <Save className="h-5 w-5 text-primary" />
            ) : (
              <Plus className="h-5 w-5 text-primary" />
            )}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="token_symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BTC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_raise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Raise ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter target amount"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorized_shares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authorized Shares</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter number of shares"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="share_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Share Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="Enter share price"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {defaultValues ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{defaultValues ? "Update Project" : "Create Project"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
