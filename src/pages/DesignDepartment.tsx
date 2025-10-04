import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Palette, Upload, Printer, Plus, Trash2 } from "lucide-react";
import { JobCardPrintView } from "@/components/JobCardPrintView";

const DesignDepartment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJobcard, setSelectedJobcard] = useState<any>(null);
  const [designDialogOpen, setDesignDialogOpen] = useState(false);
  const [printViewOpen, setPrintViewOpen] = useState(false);
  const [printJobcard, setPrintJobcard] = useState<any>(null);
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
  });

  const [dyes, setDyes] = useState<any[]>([]);

  const { data: jobcards, isLoading } = useQuery({
    queryKey: ["design-jobcards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobcards")
        .select(`
          *,
          inquiries (client_name, inquiry_id, reference_image_url),
          design_details (*),
          dye_details (*)
        `)
        .eq("order_type", "new_design")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: stages } = useQuery({
    queryKey: ["production-stages", printJobcard?.product_category],
    queryFn: async () => {
      if (!printJobcard?.product_category) return [];
      const { data, error } = await supabase
        .from("production_stages_config")
        .select("*")
        .eq("product_category", printJobcard.product_category)
        .order("stage_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!printJobcard,
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
      });
    }
    // Load existing dyes
    setDyes(jobcard.dye_details || []);
    setDesignDialogOpen(true);
  };

  const addDye = () => {
    setDyes([...dyes, {
      dye_number: "",
      dye_weight: "",
      dye_creation_date: "",
      dye_vendor: "",
      part_name: "",
      notes: "",
    }]);
  };

  const removeDye = (index: number) => {
    setDyes(dyes.filter((_, i) => i !== index));
  };

  const updateDye = (index: number, field: string, value: any) => {
    const newDyes = [...dyes];
    newDyes[index] = { ...newDyes[index], [field]: value };
    setDyes(newDyes);
  };

  const handleSubmit = async () => {
    if (!selectedJobcard) return;

    const existingDetails = selectedJobcard.design_details?.[0];

    try {
      // Save design details
      const { error: designError } = await supabase.from("design_details").upsert({
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
      });

      if (designError) throw designError;

      // Delete existing dyes and insert new ones
      const { error: deleteError } = await supabase
        .from("dye_details")
        .delete()
        .eq("jobcard_id", selectedJobcard.id);

      if (deleteError) throw deleteError;

      if (dyes.length > 0) {
        const dyeData = dyes.map(dye => ({
          jobcard_id: selectedJobcard.id,
          dye_number: dye.dye_number,
          dye_weight: dye.dye_weight ? parseFloat(dye.dye_weight) : null,
          dye_creation_date: dye.dye_creation_date || null,
          dye_vendor: dye.dye_vendor,
          part_name: dye.part_name,
          notes: dye.notes,
        }));

        const { error: dyeError } = await supabase
          .from("dye_details")
          .insert(dyeData);

        if (dyeError) throw dyeError;
      }

      queryClient.invalidateQueries({ queryKey: ["design-jobcards"] });
      toast({ title: "Design details saved successfully" });
      setDesignDialogOpen(false);
    } catch (error) {
      toast({ 
        title: "Error saving design details", 
        variant: "destructive" 
      });
    }
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
                <div className="flex gap-2">
                  <Button onClick={() => handleOpenDesignForm(jobcard)} size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    {jobcard.design_details?.length > 0 ? "Update" : "Add"} Design Details
                  </Button>
                  <Button 
                    onClick={() => {
                      setPrintJobcard(jobcard);
                      setPrintViewOpen(true);
                    }} 
                    size="sm" 
                    variant="outline"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Job Card
                  </Button>
                </div>
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

          <Tabs defaultValue="cad" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cad">CAD Details</TabsTrigger>
              <TabsTrigger value="cam">CAM Details</TabsTrigger>
              <TabsTrigger value="dye">Dye Details</TabsTrigger>
            </TabsList>

            <TabsContent value="cad" className="space-y-4">
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
              </div>
            </TabsContent>

            <TabsContent value="cam" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </TabsContent>

            <TabsContent value="dye" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Dye Details (Multiple Parts)</h3>
                <Button onClick={addDye} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dye
                </Button>
              </div>

              {dyes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dyes added yet. Click "Add Dye" to add dye details.</p>
              ) : (
                <div className="space-y-6">
                  {dyes.map((dye, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dye {index + 1}</CardTitle>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeDye(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Dye Number *</Label>
                            <Input
                              value={dye.dye_number}
                              onChange={(e) => updateDye(index, "dye_number", e.target.value)}
                              placeholder="e.g., DYE-001"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Part Name</Label>
                            <Input
                              value={dye.part_name}
                              onChange={(e) => updateDye(index, "part_name", e.target.value)}
                              placeholder="e.g., Top Ring, Base"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Dye Weight (grams)</Label>
                            <Input
                              type="number"
                              step="0.001"
                              value={dye.dye_weight}
                              onChange={(e) => updateDye(index, "dye_weight", e.target.value)}
                              placeholder="Weight in grams"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Dye Vendor</Label>
                            <Input
                              value={dye.dye_vendor}
                              onChange={(e) => updateDye(index, "dye_vendor", e.target.value)}
                              placeholder="Vendor name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Dye Creation Date</Label>
                            <Input
                              type="date"
                              value={dye.dye_creation_date}
                              onChange={(e) => updateDye(index, "dye_creation_date", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2 col-span-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={dye.notes}
                              onChange={(e) => updateDye(index, "notes", e.target.value)}
                              placeholder="Additional notes about this dye"
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={handleSubmit}>
              Save All Design Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {printJobcard && stages && (
        <JobCardPrintView
          jobcard={printJobcard}
          stages={stages}
          open={printViewOpen}
          onOpenChange={setPrintViewOpen}
        />
      )}
    </div>
  );
};

export default DesignDepartment;
