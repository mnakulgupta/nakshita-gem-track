import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Search, Package, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobcardManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobcard, setSelectedJobcard] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { data: jobcards, isLoading } = useQuery({
    queryKey: ["jobcards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobcards")
        .select(`
          *,
          inquiries (
            client_name,
            inquiry_id,
            reference_image_url,
            product_category
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredJobcards = jobcards?.filter(
    (jc) =>
      jc.jobcard_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jc.inquiries?.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      in_progress: { variant: "default", label: "In Progress" },
      completed: { variant: "secondary", label: "Completed" },
      on_hold: { variant: "outline", label: "On Hold" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || variants.in_progress;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleViewDetails = (jobcard: any) => {
    setSelectedJobcard(jobcard);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading jobcards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Jobcard Management</h1>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by jobcard number or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Jobcards</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredJobcards?.map((jobcard) => (
              <Card key={jobcard.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xl">{jobcard.jobcard_no}</CardTitle>
                  {getStatusBadge(jobcard.status)}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{jobcard.inquiries?.client_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <Badge variant="outline">{jobcard.product_category}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Type</p>
                      <Badge variant={jobcard.order_type === "new_design" ? "default" : "secondary"}>
                        {jobcard.order_type === "new_design" ? "New Design" : "Repeated Design"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Stage</p>
                      <p className="font-medium">{jobcard.current_stage || "Not Started"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleViewDetails(jobcard)} variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      onClick={() => navigate(`/workshop/${jobcard.id}`)} 
                      variant="default" 
                      size="sm"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Track Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            {filteredJobcards
              ?.filter((jc) => jc.status === "in_progress")
              .map((jobcard) => (
                <Card key={jobcard.id}>
                  {/* Same card content as above */}
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredJobcards
              ?.filter((jc) => jc.status === "completed")
              .map((jobcard) => (
                <Card key={jobcard.id}>
                  {/* Same card content as above */}
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Jobcard Details - {selectedJobcard?.jobcard_no}</DialogTitle>
          </DialogHeader>
          {selectedJobcard && (
            <div className="space-y-6">
              {selectedJobcard.inquiries?.reference_image_url && (
                <img
                  src={selectedJobcard.inquiries.reference_image_url}
                  alt="Reference"
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Jobcard Number</p>
                  <p className="font-medium">{selectedJobcard.jobcard_no}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="font-medium">{selectedJobcard.inquiries?.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Type</p>
                  <Badge variant={selectedJobcard.order_type === "new_design" ? "default" : "secondary"}>
                    {selectedJobcard.order_type === "new_design" ? "New Design" : "Repeated Design"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedJobcard.status)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobcardManagement;
