import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, CreditCard, Package } from "lucide-react";
import SubscriptionPlans from "./SubscriptionPlans";
import SubscriptionDetails from "./SubscriptionDetails";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionManagerProps {
  onBack?: () => void;
  currentSubscription?: any;
  onSubscribe?: (planId: string) => void;
  onCancelSubscription?: () => void;
  onRenewSubscription?: () => void;
  onUpdatePaymentMethod?: () => void;
}

const SubscriptionManager = ({
  onBack = () => {},
  currentSubscription = null,
  onSubscribe = () => {},
  onCancelSubscription = () => {},
  onRenewSubscription = () => {},
  onUpdatePaymentMethod = () => {},
}: SubscriptionManagerProps) => {
  const [activeTab, setActiveTab] = useState(
    currentSubscription ? "details" : "plans",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] =
    useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { toast } = useToast();

  const handleSubscribe = async (planId: string) => {
    try {
      setIsLoading(true);
      // Call the subscription service to create a new subscription
      // This is a placeholder for the actual implementation
      console.log(`Subscribing to plan ${planId}`);

      // Simulate a successful subscription
      setTimeout(() => {
        if (onSubscribe) {
          onSubscribe(planId);
        }
        toast({
          title: "Success",
          description: "Subscription created successfully",
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      // Call the subscription service to cancel the subscription
      // This is a placeholder for the actual implementation
      console.log("Cancelling subscription");

      // Simulate a successful cancellation
      setTimeout(() => {
        if (onCancelSubscription) {
          onCancelSubscription();
        }
        toast({
          title: "Success",
          description: "Subscription cancelled successfully",
        });
        setIsLoading(false);
        setIsCancelDialogOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      setIsCancelDialogOpen(false);
    }
  };

  const handleRenewSubscription = async () => {
    try {
      setIsLoading(true);
      // Call the subscription service to renew the subscription
      // This is a placeholder for the actual implementation
      console.log("Renewing subscription");

      // Simulate a successful renewal
      setTimeout(() => {
        if (onRenewSubscription) {
          onRenewSubscription();
        }
        toast({
          title: "Success",
          description: "Subscription renewed successfully",
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error renewing subscription:", error);
      toast({
        title: "Error",
        description: "Failed to renew subscription. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async (data: any) => {
    try {
      setIsLoading(true);
      // Call the subscription service to update the payment method
      // This is a placeholder for the actual implementation
      console.log("Updating payment method", data);

      // Simulate a successful update
      setTimeout(() => {
        if (onUpdatePaymentMethod) {
          onUpdatePaymentMethod(data);
        }
        toast({
          title: "Success",
          description: "Payment method updated successfully",
        });
        setIsLoading(false);
        setIsPaymentMethodDialogOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription plans and billing details
          </p>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Subscription Plans</span>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex items-center gap-2"
              disabled={!currentSubscription}
            >
              <CreditCard className="h-4 w-4" />
              <span>Subscription Details</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="plans" className="mt-0">
          <SubscriptionPlans
            currentPlanId={currentSubscription?.planId}
            onSelectPlan={handleSubscribe}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-0">
          {currentSubscription ? (
            <SubscriptionDetails
              subscriptionId={currentSubscription.id}
              planName={currentSubscription.planName}
              planDescription={currentSubscription.planDescription}
              status={currentSubscription.status}
              startDate={currentSubscription.startDate}
              endDate={currentSubscription.endDate}
              trialEndDate={currentSubscription.trialEndDate}
              billingCycle={currentSubscription.billingCycle}
              price={currentSubscription.price}
              nextPaymentDate={currentSubscription.nextPaymentDate}
              lastPaymentDate={currentSubscription.lastPaymentDate}
              paymentMethod={currentSubscription.paymentMethod}
              invoices={currentSubscription.invoices}
              onCancelSubscription={handleCancelSubscription}
              onRenewSubscription={handleRenewSubscription}
              onUpdatePaymentMethod={handleUpdatePaymentMethod}
              onViewInvoice={(invoiceId) =>
                console.log("View invoice", invoiceId)
              }
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>
                  You don't have an active subscription yet. Please select a
                  plan to subscribe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab("plans")}>
                  View Subscription Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionManager;
