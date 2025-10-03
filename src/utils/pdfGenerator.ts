import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateJobcardPDF = (jobcard: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("Nakshita Jewellers", 105, 15, { align: "center" });
  doc.setFontSize(16);
  doc.text("Job Card", 105, 25, { align: "center" });
  
  // Job Card Details
  doc.setFontSize(12);
  doc.text(`Jobcard No: ${jobcard.jobcard_no}`, 20, 40);
  doc.text(`Client: ${jobcard.inquiries?.client_name || "N/A"}`, 20, 50);
  doc.text(`Order Type: ${jobcard.order_type === "new_design" ? "New Design" : "Repeated Design"}`, 20, 60);
  doc.text(`Category: ${jobcard.product_category}`, 20, 70);
  doc.text(`Status: ${jobcard.status}`, 20, 80);
  doc.text(`Current Stage: ${jobcard.current_stage || "Not Started"}`, 20, 90);
  
  // Stage Tracking Table
  if (jobcard.stage_tracking && jobcard.stage_tracking.length > 0) {
    autoTable(doc, {
      startY: 100,
      head: [["Stage", "Department", "Status", "Started", "Completed"]],
      body: jobcard.stage_tracking.map((stage: any) => [
        stage.stage_name,
        stage.department,
        stage.status,
        stage.started_at ? new Date(stage.started_at).toLocaleDateString() : "-",
        stage.completed_at ? new Date(stage.completed_at).toLocaleDateString() : "-",
      ]),
    });
  }
  
  doc.save(`jobcard_${jobcard.jobcard_no}.pdf`);
};

export const generateInquiryPDF = (inquiry: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("Nakshita Jewellers", 105, 15, { align: "center" });
  doc.setFontSize(16);
  doc.text("Inquiry Details", 105, 25, { align: "center" });
  
  // Inquiry Details
  doc.setFontSize(12);
  doc.text(`Inquiry ID: ${inquiry.inquiry_id}`, 20, 40);
  doc.text(`Client Name: ${inquiry.client_name}`, 20, 50);
  doc.text(`Email: ${inquiry.client_email || "N/A"}`, 20, 60);
  doc.text(`Phone: ${inquiry.client_phone || "N/A"}`, 20, 70);
  doc.text(`Category: ${inquiry.product_category}`, 20, 80);
  doc.text(`Quantity: ${inquiry.quantity}`, 20, 90);
  doc.text(`Status: ${inquiry.pm_review_status}`, 20, 100);
  doc.text(`Due Date: ${inquiry.due_date ? new Date(inquiry.due_date).toLocaleDateString() : "N/A"}`, 20, 110);
  
  if (inquiry.special_instructions) {
    doc.text("Special Instructions:", 20, 120);
    const splitText = doc.splitTextToSize(inquiry.special_instructions, 170);
    doc.text(splitText, 20, 130);
  }
  
  doc.save(`inquiry_${inquiry.inquiry_id}.pdf`);
};

export const generateProductionReportPDF = (data: {
  jobcards: any[];
  dateRange: { from: Date; to: Date };
}) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("Nakshita Jewellers", 105, 15, { align: "center" });
  doc.setFontSize(16);
  doc.text("Production Report", 105, 25, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(
    `Period: ${data.dateRange.from.toLocaleDateString()} - ${data.dateRange.to.toLocaleDateString()}`,
    105,
    35,
    { align: "center" }
  );
  
  // Summary Stats
  const totalJobs = data.jobcards.length;
  const completed = data.jobcards.filter((j) => j.status === "completed").length;
  const inProgress = data.jobcards.filter((j) => j.status === "in_progress").length;
  const onHold = data.jobcards.filter((j) => j.status === "on_hold").length;
  
  doc.setFontSize(12);
  doc.text(`Total Jobs: ${totalJobs}`, 20, 50);
  doc.text(`Completed: ${completed}`, 20, 60);
  doc.text(`In Progress: ${inProgress}`, 20, 70);
  doc.text(`On Hold: ${onHold}`, 20, 80);
  
  // Jobcards Table
  autoTable(doc, {
    startY: 90,
    head: [["Jobcard No", "Client", "Category", "Status", "Stage"]],
    body: data.jobcards.map((jc) => [
      jc.jobcard_no,
      jc.inquiries?.client_name || "N/A",
      jc.product_category,
      jc.status,
      jc.current_stage || "Not Started",
    ]),
  });
  
  doc.save(`production_report_${new Date().toISOString().split("T")[0]}.pdf`);
};
