import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface JobCardPrintViewProps {
  jobcard: any;
  stages: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobCardPrintView = ({ jobcard, stages, open, onOpenChange }: JobCardPrintViewProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Job Card - ${jobcard.jobcard_no}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              font-size: 12px;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              border-bottom: 3px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 { 
              font-size: 24px; 
              font-weight: bold;
            }
            .qr-section { 
              text-align: center;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item label { 
              font-weight: bold; 
              display: block;
              margin-bottom: 5px;
            }
            .info-item value { 
              display: block;
              border-bottom: 1px solid #ccc;
              padding: 5px 0;
            }
            .reference-image {
              width: 100%;
              max-width: 400px;
              height: auto;
              border: 2px solid #000;
              margin: 20px 0;
            }
            .stages-table { 
              width: 100%; 
              border-collapse: collapse;
              margin-top: 20px;
            }
            .stages-table th, 
            .stages-table td { 
              border: 1px solid #000; 
              padding: 10px;
              text-align: left;
            }
            .stages-table th { 
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .signature-box {
              height: 60px;
              border: 1px solid #ccc;
              background-color: #fafafa;
            }
            .stage-details {
              font-size: 10px;
              color: #666;
              margin-top: 5px;
            }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getStageDetails = (stage: any) => {
    const details = [];
    if (stage.track_pcs_in) details.push("Pcs In");
    if (stage.track_pcs_out) details.push("Pcs Out");
    if (stage.track_weight_in) details.push("Weight In");
    if (stage.track_weight_out) details.push("Weight Out");
    return details.join(", ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Job Card - {jobcard.jobcard_no}</span>
            <div className="flex gap-2">
              <Button onClick={handlePrint} size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="bg-white p-8">
          {/* Header Section */}
          <div className="flex justify-between items-start border-b-4 border-primary pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">JOB CARD</h1>
              <p className="text-xl font-semibold">{jobcard.jobcard_no}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Created: {new Date(jobcard.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <QRCodeSVG 
                value={`${window.location.origin}/workshop/${jobcard.id}`}
                size={120}
                level="H"
                includeMargin
              />
              <p className="text-xs mt-2">Scan for tracking</p>
            </div>
          </div>

          {/* Job Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-bold text-sm">Client Name</label>
              <div className="border-b border-border py-2">
                {jobcard.inquiries?.client_name || "N/A"}
              </div>
            </div>
            <div>
              <label className="font-bold text-sm">Inquiry ID</label>
              <div className="border-b border-border py-2">
                {jobcard.inquiries?.inquiry_id || "N/A"}
              </div>
            </div>
            <div>
              <label className="font-bold text-sm">Product Category</label>
              <div className="border-b border-border py-2">
                {jobcard.product_category}
              </div>
            </div>
            <div>
              <label className="font-bold text-sm">Order Type</label>
              <div className="border-b border-border py-2">
                {jobcard.order_type === "new_design" ? "New Design" : "Repeated Design"}
              </div>
            </div>
            <div>
              <label className="font-bold text-sm">Status</label>
              <div className="border-b border-border py-2">
                {jobcard.status.replace("_", " ").toUpperCase()}
              </div>
            </div>
            <div>
              <label className="font-bold text-sm">Current Stage</label>
              <div className="border-b border-border py-2">
                {jobcard.current_stage || "Not Started"}
              </div>
            </div>
          </div>

          {/* Reference Image */}
          {jobcard.inquiries?.reference_image_url && (
            <div className="mb-6">
              <label className="font-bold text-sm block mb-2">Reference Image</label>
              <div className="border-2 border-primary p-2 inline-block">
                <img
                  src={jobcard.inquiries.reference_image_url}
                  alt="Product Reference"
                  className="max-w-md h-auto"
                />
              </div>
            </div>
          )}

          {/* Production Stages Table */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Production Stages</h2>
            <table className="w-full border-collapse border-2 border-primary">
              <thead>
                <tr className="bg-primary/10">
                  <th className="border border-primary p-3 text-left w-12">#</th>
                  <th className="border border-primary p-3 text-left">Stage Name</th>
                  <th className="border border-primary p-3 text-left">Department</th>
                  <th className="border border-primary p-3 text-left">Details to Track</th>
                  <th className="border border-primary p-3 text-left w-48">Handover Person Signature</th>
                  <th className="border border-primary p-3 text-left w-32">Date</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage, index) => (
                  <tr key={stage.id} className="hover:bg-muted/50">
                    <td className="border border-primary p-3 font-bold">{index + 1}</td>
                    <td className="border border-primary p-3">
                      <div className="font-semibold">{stage.stage_name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getStageDetails(stage)}
                      </div>
                    </td>
                    <td className="border border-primary p-3">{stage.department}</td>
                    <td className="border border-primary p-3 text-xs">
                      <div className="space-y-1">
                        {stage.track_pcs_in && <div>• Pieces In: _______</div>}
                        {stage.track_pcs_out && <div>• Pieces Out: _______</div>}
                        {stage.track_weight_in && <div>• Weight In: _______g</div>}
                        {stage.track_weight_out && <div>• Weight Out: _______g</div>}
                      </div>
                    </td>
                    <td className="border border-primary p-3">
                      <div className="h-16 border-b border-dashed border-muted-foreground"></div>
                      <div className="text-xs mt-1">Name: _______________</div>
                    </td>
                    <td className="border border-primary p-3">
                      <div className="h-10 border-b border-dashed border-muted-foreground"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 border-t-2 border-primary pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-sm">Special Instructions:</label>
                <div className="min-h-20 border border-border p-2 mt-2"></div>
              </div>
              <div>
                <label className="font-bold text-sm">Final Quality Check:</label>
                <div className="min-h-20 border border-border p-2 mt-2">
                  <div className="flex justify-between mt-8">
                    <span>Signature: __________________</span>
                    <span>Date: __________</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};