import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Palette, Upload } from "lucide-react";

const DesignDepartment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJobcard, setSelectedJobcard] = useState<any>(null);
  const [designDialogOpen, setDesignDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    cad_photo_url: "",
    size_dimensions: "",
    stone_specifications: "",
    cad_by: "",
    cad_completion_date: "",
    cad_file_link: "",
    cam_vendor: "",
    cam_sent_date: "",
    cam_received_date: "",
    cam_weight_grams: "",
    dye_vendor: "",
    dye_weight: "",
    final_dye_no: "",
    dye_creation_date: "",
  });

  const { data: jobcards, isLoading } = useQuery({
    queryKey: ["design-jobcards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobcards")
        .select(`
          *,
          inquiries (client_name, inquiry_id),
          design_details (*)
        `)
        .eq("order_type", "new_design")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveDesignDetailsMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("design_details").upsert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["design-jobcards"] });
      toast({ title: "Design details saved successfully" });
      setDesignDialogOpen(false);
    },
  });

  const handleOpenDesignForm = (jobcard: any) => {
    setSelectedJobcard(jobcard);
    const existingDetails = jobcard.design_details?.[0];
    if (existingDetails) {
      setFormData({
        date: existingDetails.date || new Date().toISOString().split("T")[0],
        cad_photo_url: existingDetails.cad_photo_url || "",
        size_dimensions: existingDetails.size_dimensions || "",
        stone_specifications: existingDetails.stone_specifications || "",
        cad_by: existingDetails.cad_by || "",
        cad_completion_date: existingDetails.cad_completion_date || "",
        cad_file_link: existingDetails.cad_file_link || "",
        cam_vendor: existingDetails.cam_vendor || "",
        cam_sent_date: existingDetails.cam_sent_date || "",
        cam_received_date: existingDetails.cam_received_date || "",
        cam_weight_grams: existingDetails.cam_weight_grams?.toString() || "",
        dye_vendor: existingDetails.dye_vendor || "",
        dye_weight: existingDetails.dye_weight?.toString() || "",
        final_dye_no: existingDetails.final_dye_no || "",
        dye_creation_date: existingDetails.dye_creation_date || "",
      });
    }
    setDesignDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedJobcard) return;

    const existingDetails = selectedJobcard.design_details?.[0];

    saveDesignDetailsMutation.mutate({
      id: existingDetails?.id,
      jobcard_id: selectedJobcard.id,
      date: formData.date,
      cad_photo_url: formData.cad_photo_url,
      size_dimensions: formData.size_dimensions,
      stone_specifications: formData.stone_specifications,
      cad_by: formData.cad_by,
      cad_completion_date: formData.cad_completion_date || null,
      cad_file_link: formData.cad_file_link,
      cam_vendor: formData.cam_vendor,
      cam_sent_date: formData.cam_sent_date || null,
      cam_received_date: formData.cam_received_date || null,
      cam_weight_grams: formData.cam_weight_grams ? parseFloat(formData.cam_weight_grams) : null,
      dye_vendor: formData.dye_vendor,
      dye_weight: formData.dye_weight ? parseFloat(formData.dye_weight) : null,
      final_dye_no: formData.final_dye_no,
      dye_creation_date: formData.dye_creation_date || null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Palette className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Design Department</h1>
        </div>

        <div className="grid gap-4">
          {jobcards?.map((jobcard) => (
            <Card key={jobcard.id}>
              <CardHeader>
                <CardTitle>{jobcard.jobcard_no}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Client: {jobcard.inquiries?.client_name}
                </p>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleOpenDesignForm(jobcard)} size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  {jobcard.design_details?.length > 0 ? "Update" : "Add"} Design Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={designDialogOpen} onOpenChange={setDesignDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Design Details - {selectedJobcard?.jobcard_no}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>CAD Photo URL</Label>
              <Input
                value={formData.cad_photo_url}
                onChange={(e) => setFormData({ ...formData, cad_photo_url: e.target.value })}
                placeholder="Enter CAD photo URL"
              />
            </div>

            <div className="space-y-2">
              <Label>Size/Dimensions</Label>
              <Input
                value={formData.size_dimensions}
                onChange={(e) => setFormData({ ...formData, size_dimensions: e.target.value })}
                placeholder="e.g., 18mm diameter"
              />
            </div>

            <div className="space-y-2">
              <Label>Stone Specifications</Label>
              <Input
                value={formData.stone_specifications}
                onChange={(e) => setFormData({ ...formData, stone_specifications: e.target.value })}
                placeholder="e.g., CZ, 2mm round"
              />
            </div>

            <div className="space-y-2">
              <Label>CAD By</Label>
              <Input
                value={formData.cad_by}
                onChange={(e) => setFormData({ ...formData, cad_by: e.target.value })}
                placeholder="Designer name"
              />
            </div>

            <div className="space-y-2">
              <Label>CAD Completion Date</Label>
              <Input
                type="date"
                value={formData.cad_completion_date}
                onChange={(e) => setFormData({ ...formData, cad_completion_date: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>CAD File Link</Label>
              <Input
                value={formData.cad_file_link}
                onChange={(e) => setFormData({ ...formData, cad_file_link: e.target.value })}
                placeholder="Cloud storage link"
              />
            </div>

            <div className="space-y-2">
              <Label>CAM Vendor</Label>
              <Input
                value={formData.cam_vendor}
                onChange={(e) => setFormData({ ...formData, cam_vendor: e.target.value })}
                placeholder="Vendor name"
              />
            </div>

            <div className="space-y-2">
              <Label>CAM Sent Date</Label>
              <Input
                type="date"
                value={formData.cam_sent_date}
                onChange={(e) => setFormData({ ...formData, cam_sent_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>CAM Received Date</Label>
              <Input
                type="date"
                value={formData.cam_received_date}
                onChange={(e) => setFormData({ ...formData, cam_received_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>CAM Weight (grams)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.cam_weight_grams}
                onChange={(e) => setFormData({ ...formData, cam_weight_grams: e.target.value })}
                placeholder="Weight in grams"
              />
            </div>

            <div className="space-y-2">
              <Label>DYE Vendor</Label>
              <Input
                value={formData.dye_vendor}
                onChange={(e) => setFormData({ ...formData, dye_vendor: e.target.value })}
                placeholder="Vendor name"
              />
            </div>

            <div className="space-y-2">
              <Label>DYE Weight (grams)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.dye_weight}
                onChange={(e) => setFormData({ ...formData, dye_weight: e.target.value })}
                placeholder="Weight in grams"
              />
            </div>

            <div className="space-y-2">
              <Label>Final DYE Number</Label>
              <Input
                value={formData.final_dye_no}
                onChange={(e) => setFormData({ ...formData, final_dye_no: e.target.value })}
                placeholder="DYE number"
              />
            </div>

            <div className="space-y-2">
              <Label>DYE Creation Date</Label>
              <Input
                type="date"
                value={formData.dye_creation_date}
                onChange={(e) => setFormData({ ...formData, dye_creation_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={saveDesignDetailsMutation.isPending}>
              Save Design Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesignDepartment;
