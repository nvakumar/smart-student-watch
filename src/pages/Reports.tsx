import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getStudentReports, deleteAllStudentData } from "@/api"; // ✅ NEW

interface StudentReport {
  id: string;
  student_name: string;
  registration_id: string;
  report_date: string;
  sessions_count: number;
  avg_attention: number;
  avg_emotion_score: number;
  posture_issues: number;
  download_url_csv: string;
  download_url_pdf: string;
}

const Reports = () => {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getStudentReports(); // ✅ Updated
      setReports(data.reports || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports. Showing demo data.",
        variant: "destructive",
      });

      // Optional: fallback demo data (remove if backend is ready)
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      toast({
        title: "Download Started",
        description: `Downloading ${filename}...`,
      });

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the report file.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllData = async () => {
    setDeleting(true);
    try {
      await deleteAllStudentData(); // ✅ Updated
      setReports([]);
      toast({
        title: "Data Deleted",
        description: "All student data has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete student data.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "success";
    if (score >= 70) return "warning";
    return "destructive";
  };

  const totalSessions = reports.reduce((sum, r) => sum + r.sessions_count, 0);
  const avgAttention = reports.length > 0
    ? reports.reduce((sum, r) => sum + r.avg_attention, 0) / reports.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Reports</h1>
            <p className="text-muted-foreground">Download and manage student monitoring reports</p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete All Student Data
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all student data, monitoring records, and reports. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {reports.length}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              {totalSessions}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg Attention</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              {avgAttention.toFixed(1)}%
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Reports
            </CardTitle>
            <CardDescription>
              Download detailed analytics and monitoring reports for each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reports available</p>
                <p className="text-sm">Reports will appear here as students complete monitoring sessions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{report.student_name}</h3>
                            <Badge variant="outline">{report.registration_id}</Badge>
                            <Badge variant="secondary">{report.sessions_count} sessions</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Attention:</span>
                              <Badge variant={getScoreColor(report.avg_attention)} className="text-xs mt-1">
                                {report.avg_attention.toFixed(1)}%
                              </Badge>
                            </div>

                            <div>
                              <span className="text-muted-foreground">Emotion:</span>
                              <Badge variant={getScoreColor(report.avg_emotion_score)} className="text-xs mt-1">
                                {report.avg_emotion_score.toFixed(1)}%
                              </Badge>
                            </div>

                            <div>
                              <span className="text-muted-foreground">Posture Issues:</span>
                              <Badge variant={report.posture_issues > 5 ? "destructive" : "warning"} className="text-xs mt-1">
                                {report.posture_issues}
                              </Badge>
                            </div>

                            <div>
                              <span className="text-muted-foreground">Report Date:</span>
                              <div className="text-xs font-medium mt-1">
                                {new Date(report.report_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(report.download_url_csv, `${report.student_name}_report.csv`)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            CSV
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleDownload(report.download_url_pdf, `${report.student_name}_report.pdf`)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
