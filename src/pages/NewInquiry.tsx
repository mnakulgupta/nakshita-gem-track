import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, ImageIcon } from "lucide-react";
import { z } from "zod";

const inquirySchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters").max(100),
  clientEmail: z.string().email("Invalid email address").max(255).optional().or(z.literal("")),
  clientPhone: z.string().min(10, "Phone number must be at least 10 characters").max(20).optional().or(z.literal("")),
  quantity: z.number().min(1, "Quantity must be at least 1").max(10000),
  metalDetails: z.string().max(500).optional(),
  polishColor: z.string().max(100).optional(),
  specialInstructions: z.string().max(1000).optional(),
});

const NewInquiry = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be less than 20MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      // Validate form data
      const validatedData = inquirySchema.parse({
        clientName: formData.get("clientName") as string,
        clientEmail: formData.get("clientEmail") as string,
        clientPhone: formData.get("clientPhone") as string,
        quantity: parseInt(formData.get("quantity") as string),
        metalDetails: formData.get("metalDetails") as string,
        polishColor: formData.get("polishColor") as string,
        specialInstructions: formData.get("specialInstructions") as string,
      });

      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("inquiry-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("inquiry-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Generate inquiry ID
      const inquiryId = `INQ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Create inquiry
      const { error: insertError } = await supabase.from("inquiries").insert({
        inquiry_id: inquiryId,
        client_name: validatedData.clientName,
        client_email: validatedData.clientEmail || null,
        client_phone: validatedData.clientPhone || null,
        reference_image_url: imageUrl,
        product_category: formData.get("productCategory") as any || null,
        quantity: validatedData.quantity,
        metal_details: validatedData.metalDetails || null,
        polish_color: validatedData.polishColor || null,
        due_date: formData.get("dueDate") as string || null,
        special_instructions: validatedData.specialInstructions || null,
        sales_person_id: user?.id,
        pm_review_status: "pending",
      });

      if (insertError) throw insertError;

      toast.success("Inquiry created successfully!");
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error creating inquiry:", error);
        toast.error("Failed to create inquiry. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Sales Inquiry</h1>
        <p className="text-muted-foreground">
          Create a new inquiry with customer details and reference image
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry Details</CardTitle>
          <CardDescription>
            Fill in all required information. Fields marked with * are mandatory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reference Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="referenceImage">Reference Image *</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="referenceImage"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                      <p className="text-xs text-muted-foreground">Max 20MB</p>
                    </div>
                  )}
                  <input
                    id="referenceImage"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* Client Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input id="clientName" name="clientName" required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input id="clientEmail" name="clientEmail" type="email" maxLength={255} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input id="clientPhone" name="clientPhone" type="tel" maxLength={20} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" />
              </div>
            </div>

            {/* Product Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productCategory">Product Category</Label>
                <Select name="productCategory">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kundan">Kundan</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="metalDetails">Metal Details</Label>
                <Input id="metalDetails" name="metalDetails" placeholder="e.g., 22K Gold" maxLength={500} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="polishColor">Polish Color</Label>
                <Input id="polishColor" name="polishColor" placeholder="e.g., Rose Gold" maxLength={100} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                name="specialInstructions"
                rows={4}
                placeholder="Any special requirements or notes..."
                maxLength={1000}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting || !imageFile}>
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewInquiry;
