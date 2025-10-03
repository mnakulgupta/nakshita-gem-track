import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, userRole } = useAuth();

  const { data: inquiries } = useQuery({
    queryKey: ["inquiries-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("pm_review_status");
      
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: inquiries?.length || 0,
    pending: inquiries?.filter(i => i.pm_review_status === "pending").length || 0,
    inProgress: inquiries?.filter(i => ["in_review", "continued", "in_design", "production_ready", "in_production"].includes(i.pm_review_status)).length || 0,
    completed: inquiries?.filter(i => i.pm_review_status === "completed").length || 0,
    cancelled: inquiries?.filter(i => i.pm_review_status === "cancelled").length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email}
          {userRole && <span className="ml-2 capitalize">({userRole.replace('_', ' ')})</span>}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting PM review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-status-in-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            What would you like to do today?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(userRole === "sales" || userRole === "admin") && (
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium">Create New Inquiry</p>
                  <p className="text-sm text-muted-foreground">
                    Submit a new sales inquiry with customer details
                  </p>
                </div>
                <a href="/inquiry/new" className="text-primary hover:underline">
                  Create →
                </a>
              </div>
            )}
            
            {(userRole === "production_manager" || userRole === "admin") && (
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium">Review Inquiries</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.pending} inquiries awaiting your review
                  </p>
                </div>
                <a href="/production" className="text-primary hover:underline">
                  Review →
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
