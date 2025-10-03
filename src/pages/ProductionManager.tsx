import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";

const ProductionManager = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["pending-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("pm_review_status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: "continued" | "cancelled"; reason?: string }) => {
      const { error } = await supabase
        .from("inquiries")
        .update({
          pm_review_status: status,
          cancellation_reason: reason || null,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["inquiries-stats"] });
      setReviewDialogOpen(false);
      setSelectedInquiry(null);
      setCancellationReason("");
      toast.success("Inquiry status updated");
    },
    onError: () => {
      toast.error("Failed to update inquiry");
    },
  });

  const handleReview = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setReviewDialogOpen(true);
  };

  const handleContinue = () => {
    if (selectedInquiry) {
      updateInquiryMutation.mutate({
        id: selectedInquiry.id,
        status: "continued",
      });
    }
  };

  const handleCancel = () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    if (selectedInquiry) {
      updateInquiryMutation.mutate({
        id: selectedInquiry.id,
        status: "cancelled",
        reason: cancellationReason,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending Review", variant: "default" as const, icon: Clock },
      continued: { label: "Continued", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading inquiries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Production Manager Dashboard</h1>
        <p className="text-muted-foreground">
          Review and process pending inquiries
        </p>
      </div>

      {inquiries && inquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">No pending inquiries to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inquiries?.map((inquiry) => (
            <Card key={inquiry.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{inquiry.client_name}</CardTitle>
                    <CardDescription className="text-xs">
                      {inquiry.inquiry_id}
                    </CardDescription>
                  </div>
                  {getStatusBadge(inquiry.pm_review_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {inquiry.reference_image_url && (
                  <div className="aspect-square rounded-md overflow-hidden bg-muted">
                    <img
                      src={inquiry.reference_image_url}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 text-sm">
                  {inquiry.product_category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium capitalize">{inquiry.product_category}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{inquiry.quantity}</span>
                  </div>
                  {inquiry.due_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">
                        {format(new Date(inquiry.due_date), "MMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="font-medium">
                      {format(new Date(inquiry.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleReview(inquiry)}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review Inquiry
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Inquiry</DialogTitle>
            <DialogDescription>
              {selectedInquiry?.inquiry_id} - {selectedInquiry?.client_name}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              {selectedInquiry.reference_image_url && (
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedInquiry.reference_image_url}
                    alt="Reference"
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Client Name</Label>
                  <p className="font-medium">{selectedInquiry.client_name}</p>
                </div>
                {selectedInquiry.client_email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedInquiry.client_email}</p>
                  </div>
                )}
                {selectedInquiry.client_phone && (
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedInquiry.client_phone}</p>
                  </div>
                )}
                {selectedInquiry.product_category && (
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium capitalize">{selectedInquiry.product_category}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Quantity</Label>
                  <p className="font-medium">{selectedInquiry.quantity}</p>
                </div>
                {selectedInquiry.metal_details && (
                  <div>
                    <Label className="text-muted-foreground">Metal Details</Label>
                    <p className="font-medium">{selectedInquiry.metal_details}</p>
                  </div>
                )}
                {selectedInquiry.polish_color && (
                  <div>
                    <Label className="text-muted-foreground">Polish Color</Label>
                    <p className="font-medium">{selectedInquiry.polish_color}</p>
                  </div>
                )}
                {selectedInquiry.due_date && (
                  <div>
                    <Label className="text-muted-foreground">Due Date</Label>
                    <p className="font-medium">
                      {format(new Date(selectedInquiry.due_date), "MMMM dd, yyyy")}
                    </p>
                  </div>
                )}
              </div>

              {selectedInquiry.special_instructions && (
                <div>
                  <Label className="text-muted-foreground">Special Instructions</Label>
                  <p className="font-medium mt-1">{selectedInquiry.special_instructions}</p>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <Label>Decision</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancellation-reason">
                      To cancel this order, provide a reason:
                    </Label>
                    <Textarea
                      id="cancellation-reason"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Reason for cancellation..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false);
                setCancellationReason("");
              }}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancellationReason.trim() || updateInquiryMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
            <Button
              onClick={handleContinue}
              disabled={updateInquiryMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Continue Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionManager;
