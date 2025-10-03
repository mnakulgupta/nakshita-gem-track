import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Package, Clock, CheckCircle } from "lucide-react";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const Analytics = () => {
  const { data: inquiries } = useQuery({
    queryKey: ["analytics-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: jobcards } = useQuery({
    queryKey: ["analytics-jobcards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobcards")
        .select("*, stage_tracking(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const totalInquiries = inquiries?.length || 0;
  const totalJobcards = jobcards?.length || 0;
  const completedJobcards = jobcards?.filter((j) => j.status === "completed").length || 0;
  const inProgressJobcards = jobcards?.filter((j) => j.status === "in_progress").length || 0;

  // Inquiry status distribution
  const inquiryStatusData = [
    { name: "Pending", value: inquiries?.filter((i) => i.pm_review_status === "pending").length || 0 },
    { name: "In Review", value: inquiries?.filter((i) => i.pm_review_status === "in_review").length || 0 },
    { name: "Production Ready", value: inquiries?.filter((i) => i.pm_review_status === "production_ready").length || 0 },
    { name: "Continued", value: inquiries?.filter((i) => i.pm_review_status === "continued").length || 0 },
  ];

  // Jobcard status distribution
  const jobcardStatusData = [
    { name: "In Progress", value: inProgressJobcards },
    { name: "Completed", value: completedJobcards },
    { name: "On Hold", value: jobcards?.filter((j) => j.status === "on_hold").length || 0 },
    { name: "Cancelled", value: jobcards?.filter((j) => j.status === "cancelled").length || 0 },
  ];

  // Category distribution
  const categoryData = jobcards?.reduce((acc: any, jc) => {
    const category = jc.product_category;
    const existing = acc.find((item: any) => item.name === category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
    return acc;
  }, []) || [];

  // Monthly trend (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    
    const monthInquiries = inquiries?.filter((inq) => {
      const inqDate = new Date(inq.created_at);
      return inqDate.getMonth() === date.getMonth() && inqDate.getFullYear() === year;
    }).length || 0;
    
    const monthJobcards = jobcards?.filter((jc) => {
      const jcDate = new Date(jc.created_at);
      return jcDate.getMonth() === date.getMonth() && jcDate.getFullYear() === year;
    }).length || 0;
    
    return { month, inquiries: monthInquiries, jobcards: monthJobcards };
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInquiries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobcards</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobcards}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressJobcards}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedJobcards}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inquiry Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inquiryStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inquiryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jobcard Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobcardStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6-Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="inquiries" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="jobcards" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
