import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, Plus, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";

interface TokenAllocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  projectId: string;
  subscriptionId?: string;
  investorId?: string;
}

// Token types available for allocation
const TOKEN_TYPES = [
  "ERC-20",
  "ERC-721",
  "ERC-1155",
  "ERC-1400",
  "ERC-3525",
  "ERC-4626",
];

// Form validation schema
const tokenAllocationSchema = z.object({
  subscription_id: z.string().min(1, { message: "Subscription is required" }),
  allocations: z
    .array(
      z.object({
        token_type: z.string().min(1, { message: "Token type is required" }),
        token_amount: z.coerce
          .number()
          .min(0.000001, { message: "Amount must be greater than 0" }),
      }),
    )
    .min(1, { message: "At least one token allocation is required" }),
  notes: z.string().optional(),
});

type TokenAllocationFormValues = z.infer<typeof tokenAllocationSchema>;

const TokenAllocationForm = ({
  open,
  onOpenChange,
  onSubmit,
  projectId,
  subscriptionId,
  investorId,
}: TokenAllocationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<TokenAllocationFormValues>({
    resolver: zodResolver(tokenAllocationSchema),
    defaultValues: {
      subscription_id: subscriptionId || "",
      allocations: [
        {
          token_type: "ERC-20",
          token_amount: 0,
        },
      ],
      notes: "",
    },
  });

  // Watch for changes to subscription_id
  const watchedSubscriptionId = form.watch("subscription_id");

  // Fetch subscriptions when dialog opens
  useEffect(() => {
    if (open) {
      fetchSubscriptions();
    }
  }, [open]);

  // Update selected subscription when subscription_id changes
  useEffect(() => {
    if (watchedSubscriptionId) {
      const subscription = subscriptions.find(
        (sub) => sub.id === watchedSubscriptionId,
      );
      setSelectedSubscription(subscription);
    } else {
      setSelectedSubscription(null);
    }
  }, [watchedSubscriptionId, subscriptions]);

  // Fetch subscriptions for the project
  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from("subscriptions")
        .select(
          `
          id,
          investor_id,
          subscription_id,
          currency,
          fiat_amount,
          subscription_date,
          confirmed,
          allocated,
          notes,
          investors!inner(name, email, wallet_address)
        `,
        )
        .eq("project_id", projectId);

      // If investorId is provided, filter by investor
      if (investorId) {
        query = query.eq("investor_id", investorId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSubscriptions(data || []);

      // If subscriptionId is provided, set it as selected
      if (subscriptionId) {
        const subscription = data?.find((sub) => sub.id === subscriptionId);
        setSelectedSubscription(subscription);
        form.setValue("subscription_id", subscriptionId);
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      toast({
        title: "Error",
        description: "Failed to load subscriptions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new token allocation field
  const addTokenAllocation = () => {
    const currentAllocations = [...form.getValues("allocations")] || [];
    currentAllocations.push({ token_type: "ERC-20", token_amount: 0 });
    form.setValue("allocations", currentAllocations, { shouldDirty: true });
  };

  // Remove a token allocation field
  const removeTokenAllocation = (index: number) => {
    const currentAllocations = [...form.getValues("allocations")] || [];
    if (currentAllocations.length <= 1) return; // Keep at least one allocation

    currentAllocations.splice(index, 1);
    form.setValue("allocations", currentAllocations, { shouldDirty: true });
  };

  // Handle form submission
  const handleSubmit = async (formData: TokenAllocationFormValues) => {
    try {
      setIsLoading(true);

      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID is required.",
          variant: "destructive",
        });
        return;
      }

      // Find the selected subscription
      const subscription = subscriptions.find(
        (sub) => sub.id === formData.subscription_id,
      );

      if (!subscription) {
        toast({
          title: "Error",
          description: "Selected subscription not found.",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for submission
      const allocationData = {
        subscription_id: formData.subscription_id,
        investor_id: subscription.investor_id,
        project_id: projectId,
        investor_name: subscription.investors.name,
        investor_email: subscription.investors.email,
        wallet_address: subscription.investors.wallet_address,
        fiat_amount: subscription.fiat_amount,
        currency: subscription.currency,
        allocations: formData.allocations,
        notes: formData.notes,
      };

      // Call the onSubmit callback
      await onSubmit(allocationData);

      // Reset form
      form.reset();

      toast({
        title: "Success",
        description: `Token allocations added for ${subscription.investors.name}`,
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      toast({
        title: "Error",
        description: "Failed to add token allocations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add Token Allocation</span>
          </DialogTitle>
          <DialogDescription>
            Allocate tokens to an investor subscription
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="subscription_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Subscription</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isLoading || !!subscriptionId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subscription" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading...</span>
                          </div>
                        ) : subscriptions.length === 0 ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No subscriptions found
                          </div>
                        ) : (
                          subscriptions.map((subscription) => (
                            <SelectItem
                              key={subscription.id}
                              value={subscription.id}
                            >
                              {subscription.investors.name} -{" "}
                              {subscription.currency}{" "}
                              {subscription.fiat_amount.toLocaleString()}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a subscription to allocate tokens
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedSubscription && (
                <div className="bg-muted/20 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    Subscription Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Investor:</p>
                      <p className="font-medium">
                        {selectedSubscription.investors.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount:</p>
                      <p className="font-medium">
                        {selectedSubscription.currency}{" "}
                        {selectedSubscription.fiat_amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email:</p>
                      <p className="font-medium">
                        {selectedSubscription.investors.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Wallet:</p>
                      <p className="font-medium truncate">
                        {selectedSubscription.investors.wallet_address ||
                          "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Token Allocations</h3>
                  {/* Add Token Type button removed, but functionality preserved */}
                </div>

                {form.watch("allocations").map((_, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name={`allocations.${index}.token_type`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Token Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select token type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TOKEN_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
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
                      name={`allocations.${index}.token_amount`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Token Amount
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                              value={field.value || ""}
                              step="0.000001"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-1 mb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTokenAllocation(index)}
                        disabled={form.watch("allocations").length <= 1}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                      {index === form.watch("allocations").length - 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={addTokenAllocation}
                          title="Add another token type"
                        >
                          <Plus className="h-4 w-4 text-blue-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add any notes about this allocation"
                        {...field}
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
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !selectedSubscription}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Allocation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TokenAllocationForm;
