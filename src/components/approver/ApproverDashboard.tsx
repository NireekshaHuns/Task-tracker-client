import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useTaskAnalytics } from "@/hooks/useAnalytics";

export default function ApproverDashboard() {
  const { analyticsData, isLoading, error } = useTaskAnalytics();
  const [activeTab, setActiveTab] = useState("overview");

  // Loading state
  if (isLoading) {
    return <h1>Loading</h1>;
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "Failed to load analytics data"}
        </AlertDescription>
      </Alert>
    );
  }

  // No data state
  if (!analyticsData) {
    return (
      <Alert className="mb-6">
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          There isn't enough task data to display analytics yet. Try creating
          some tasks first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Task Analytics Dashboard</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="submitters">Submitters</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>
                  Current breakdown of all tasks by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.tasksByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {analyticsData.tasksByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} tasks`, "Count"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Task Counts */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Task Activity by Month</CardTitle>
                <CardDescription>
                  Number of tasks by status per month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.tasksByMonth}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="pending"
                        stackId="a"
                        fill="#fbbf24"
                        name="Pending"
                      />
                      <Bar
                        dataKey="approved"
                        stackId="a"
                        fill="#34d399"
                        name="Approved"
                      />
                      <Bar
                        dataKey="done"
                        stackId="a"
                        fill="#3b82f6"
                        name="Done"
                      />
                      <Bar
                        dataKey="rejected"
                        stackId="a"
                        fill="#ef4444"
                        name="Rejected"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Creation & Completion Trends</CardTitle>
              <CardDescription>
                How task statuses change over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.tasksByMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="#fbbf24"
                      name="Pending"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      stroke="#34d399"
                      name="Approved"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="done"
                      stroke="#3b82f6"
                      name="Done"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="rejected"
                      stroke="#ef4444"
                      name="Rejected"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Approval Time</CardTitle>
              <CardDescription>
                Hours from task creation to approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.approvalTime.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analyticsData.approvalTime}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `${value} hours`,
                          "Avg. Time to Approve",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="average"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    No approval time data available yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submitters Tab */}
        <TabsContent value="submitters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Task Submitters</CardTitle>
              <CardDescription>
                Users with the most submitted tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.topSubmitters.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={analyticsData.topSubmitters}
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip
                        formatter={(value) => [`${value} tasks`, "Submitted"]}
                      />
                      <Bar dataKey="tasks" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    No submitter data available yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
