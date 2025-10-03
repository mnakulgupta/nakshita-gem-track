import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Eye, Filter, Package } from "lucide-react";
import { format } from "date-fns";

const Inquiries = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["all-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredInquiries = inquiries?.filter((inquiry) => {
    const matchesSearch = 
      inquiry.inquiry_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inquiry.pm_review_status === statusFilter;
    const matchesCategory = categoryFilter === "all" || inquiry.product_category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-status-pending text-warning-foreground" },
      continued: { label: "In Production", className: "bg-status-in-progress text-white" },
      cancelled: { label: "Cancelled", className: "bg-status-cancelled text-destructive-foreground" },
    };

    const config = variants[status] || variants.pending;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleViewDetails = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setDetailsOpen(true);
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
        <h1 className="text-3xl font-bold tracking-tight">All Inquiries</h1>
        <p className="text-muted-foreground">
          View and manage all customer inquiries
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="continued">In Production</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="kundan">Kundan</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredInquiries?.length || 0} of {inquiries?.length || 0} inquiries
        </p>
      </div>

      {filteredInquiries && filteredInquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No inquiries found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInquiries?.map((inquiry) => (
            <Card key={inquiry.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {inquiry.reference_image_url && (
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={inquiry.reference_image_url}
                        alt="Reference"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{inquiry.client_name}</h3>
                        <p className="text-sm text-muted-foreground">{inquiry.inquiry_id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(inquiry.pm_review_status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(inquiry)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {inquiry.product_category && (
                        <div>
                          <p className="text-muted-foreground">Category</p>
                          <p className="font-medium capitalize">{inquiry.product_category}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-medium">{inquiry.quantity}</p>
                      </div>
                      {inquiry.due_date && (
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p className="font-medium">
                            {format(new Date(inquiry.due_date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">
                          {format(new Date(inquiry.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    
                    {inquiry.cancellation_reason && (
                      <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive font-medium">
                          Cancellation reason: {inquiry.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              {selectedInquiry?.inquiry_id}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedInquiry.client_name}</h3>
                {getStatusBadge(selectedInquiry.pm_review_status)}
              </div>

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
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="font-medium">
                    {format(new Date(selectedInquiry.created_at), "MMMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="font-medium">
                    {format(new Date(selectedInquiry.updated_at), "MMMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>

              {selectedInquiry.special_instructions && (
                <div>
                  <Label className="text-muted-foreground">Special Instructions</Label>
                  <p className="font-medium mt-1 p-3 rounded-lg bg-muted">
                    {selectedInquiry.special_instructions}
                  </p>
                </div>
              )}

              {selectedInquiry.cancellation_reason && (
                <div>
                  <Label className="text-muted-foreground">Cancellation Reason</Label>
                  <p className="font-medium mt-1 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                    {selectedInquiry.cancellation_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inquiries;
