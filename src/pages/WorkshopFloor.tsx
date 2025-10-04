import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Hammer, Search, ArrowRight, QrCode, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const WorkshopFloor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: jobcards, isLoading } = useQuery({
    queryKey: ["workshop-jobcards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobcards")
        .select(`
          *,
          inquiries (
            client_name,
            inquiry_id,
            reference_image_url
          )
        `)
        .in("status", ["in_progress", "on_hold"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: allStageTracking } = useQuery({
    queryKey: ["all-stage-tracking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_tracking")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const filteredJobcards = jobcards?.filter(
    (jc) =>
      jc.jobcard_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jc.inquiries?.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jc.current_stage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getJobcardProgress = (jobcardId: string) => {
    const stages = allStageTracking?.filter(st => st.jobcard_id === jobcardId) || [];
    const completed = stages.filter(st => st.status === "completed").length;
    const total = stages.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "on_hold":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading workshop jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Hammer className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Workshop Floor</h1>
            <p className="text-muted-foreground">Active job cards for production</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by jobcard number, client name, or current stage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4">
          {filteredJobcards && filteredJobcards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Hammer className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No active job cards</p>
                <p className="text-sm text-muted-foreground">All work is complete or on hold</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobcards?.map((jobcard) => {
              const progress = getJobcardProgress(jobcard.id);
              
              return (
                <Card key={jobcard.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(jobcard.status)}
                          <CardTitle className="text-2xl">{jobcard.jobcard_no}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Client: {jobcard.inquiries?.client_name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={jobcard.status === "in_progress" ? "default" : "secondary"}>
                          {jobcard.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <QrCode className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Product Category</p>
                          <Badge variant="outline">{jobcard.product_category}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Order Type</p>
                          <Badge variant={jobcard.order_type === "new_design" ? "default" : "secondary"}>
                            {jobcard.order_type === "new_design" ? "New Design" : "Repeated"}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Current Stage</p>
                        <p className="font-semibold text-lg">{jobcard.current_stage || "Not Started"}</p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {progress.completed} / {progress.total} stages completed
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate(`/workshop/${jobcard.id}`)}
                        className="w-full"
                        size="lg"
                      >
                        Open Job Card
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopFloor;
