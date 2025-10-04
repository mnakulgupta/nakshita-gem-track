import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, Play, ArrowRight } from "lucide-react";

const WorkshopTracking = () => {
  const { jobcardId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    pcs_in: "",
    pcs_out: "",
    weight_in: "",
    weight_out: "",
    notes: "",
    handover_person_name: "",
  });

  const { data: jobcard } = useQuery({
    queryKey: ["jobcard", jobcardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobcards")
        .select("*, inquiries(client_name, inquiry_id, reference_image_url)")
        .eq("id", jobcardId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: stages } = useQuery({
    queryKey: ["production-stages", jobcard?.product_category],
    queryFn: async () => {
      if (!jobcard?.product_category) return [];
      const { data, error } = await supabase
        .from("production_stages_config")
        .select("*")
        .eq("product_category", jobcard.product_category)
        .order("stage_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!jobcard,
  });

  const { data: stageTracking } = useQuery({
    queryKey: ["stage-tracking", jobcardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_tracking")
        .select("*")
        .eq("jobcard_id", jobcardId);
      if (error) throw error;
      return data;
    },
    enabled: !!jobcardId,
  });

  const updateStageMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("stage_tracking").upsert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stage-tracking"] });
      toast({ title: "Stage updated successfully" });
      setUpdateDialogOpen(false);
      setFormData({ pcs_in: "", pcs_out: "", weight_in: "", weight_out: "", notes: "", handover_person_name: "" });
    },
  });

  const handleStageClick = (stage: any) => {
    setSelectedStage(stage);
    const existingTracking = stageTracking?.find((st) => st.stage_name === stage.stage_name);
    if (existingTracking) {
      setFormData({
        pcs_in: existingTracking.pcs_in?.toString() || "",
        pcs_out: existingTracking.pcs_out?.toString() || "",
        weight_in: existingTracking.weight_in?.toString() || "",
        weight_out: existingTracking.weight_out?.toString() || "",
        notes: existingTracking.notes || "",
        handover_person_name: existingTracking.handover_person_name || "",
      });
    }
    setUpdateDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedStage) return;

    const existingTracking = stageTracking?.find((st) => st.stage_name === selectedStage.stage_name);

    updateStageMutation.mutate({
      id: existingTracking?.id,
      jobcard_id: jobcardId,
      stage_name: selectedStage.stage_name,
      department: selectedStage.department,
      pcs_in: formData.pcs_in ? parseInt(formData.pcs_in) : null,
      pcs_out: formData.pcs_out ? parseInt(formData.pcs_out) : null,
      weight_in: formData.weight_in ? parseFloat(formData.weight_in) : null,
      weight_out: formData.weight_out ? parseFloat(formData.weight_out) : null,
      notes: formData.notes,
      handover_person_name: formData.handover_person_name,
      handover_timestamp: new Date().toISOString(),
      status: "completed",
      completed_at: new Date().toISOString(),
    });
  };

  const getStageStatus = (stageName: string) => {
    const tracking = stageTracking?.find((st) => st.stage_name === stageName);
    return tracking?.status || "pending";
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Workshop Tracking - {jobcard?.jobcard_no}
            </CardTitle>
            <p className="text-muted-foreground">
              Client: {jobcard?.inquiries?.client_name}
            </p>
            {jobcard?.inquiries?.reference_image_url && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Reference Image</p>
                <img 
                  src={jobcard.inquiries.reference_image_url} 
                  alt="Reference" 
                  className="w-48 h-48 object-cover rounded-md border"
                />
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {stages?.map((stage, index) => {
            const status = getStageStatus(stage.stage_name);
            const tracking = stageTracking?.find((st) => st.stage_name === stage.stage_name);
            
            return (
              <Card key={stage.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        {status === "completed" ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : status === "in_progress" ? (
                          <Play className="h-6 w-6 text-blue-500" />
                        ) : (
                          <Clock className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{stage.stage_name}</h3>
                        <p className="text-sm text-muted-foreground">{stage.department}</p>
                        
                        {tracking && (
                          <div className="flex gap-4 mt-2 text-sm">
                            {stage.track_pcs_in && (
                              <span>In: {tracking.pcs_in || 0} pcs</span>
                            )}
                            {stage.track_pcs_out && (
                              <span>Out: {tracking.pcs_out || 0} pcs</span>
                            )}
                            {stage.track_weight_in && (
                              <span>Weight In: {tracking.weight_in || 0}g</span>
                            )}
                            {stage.track_weight_out && (
                              <span>Weight Out: {tracking.weight_out || 0}g</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        status === "completed" ? "default" :
                        status === "in_progress" ? "secondary" :
                        "outline"
                      }>
                        {status === "completed" ? "Completed" :
                         status === "in_progress" ? "In Progress" :
                         "Pending"}
                      </Badge>
                      <Button
                        onClick={() => handleStageClick(stage)}
                        size="sm"
                        variant="outline"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Stage - {selectedStage?.stage_name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            {selectedStage?.track_pcs_in && (
              <div className="space-y-2">
                <Label>Pieces In</Label>
                <Input
                  type="number"
                  value={formData.pcs_in}
                  onChange={(e) => setFormData({ ...formData, pcs_in: e.target.value })}
                  placeholder="Enter pieces in"
                />
              </div>
            )}
            
            {selectedStage?.track_pcs_out && (
              <div className="space-y-2">
                <Label>Pieces Out</Label>
                <Input
                  type="number"
                  value={formData.pcs_out}
                  onChange={(e) => setFormData({ ...formData, pcs_out: e.target.value })}
                  placeholder="Enter pieces out"
                />
              </div>
            )}
            
            {selectedStage?.track_weight_in && (
              <div className="space-y-2">
                <Label>Weight In (grams)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.weight_in}
                  onChange={(e) => setFormData({ ...formData, weight_in: e.target.value })}
                  placeholder="Enter weight in"
                />
              </div>
            )}
            
            {selectedStage?.track_weight_out && (
              <div className="space-y-2">
                <Label>Weight Out (grams)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.weight_out}
                  onChange={(e) => setFormData({ ...formData, weight_out: e.target.value })}
                  placeholder="Enter weight out"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Handover Person Name <span className="text-destructive">*</span></Label>
            <Input
              value={formData.handover_person_name}
              onChange={(e) => setFormData({ ...formData, handover_person_name: e.target.value })}
              placeholder="Name of person completing this stage"
              required
            />
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={updateStageMutation.isPending || !formData.handover_person_name}
            >
              Update Stage & Sign Off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkshopTracking;
