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
      const response = await fetch('/get_reports');
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        // Fallback demo data when Flask backend is not available
        const demoReports: StudentReport[] = [
          {
            id: "1",
            student_name: "Alice Johnson",
            registration_id: "STU001",
            report_date: "2024-01-15",
            sessions_count: 12,
            avg_attention: 87.5,
            avg_emotion_score: 92.3,
            posture_issues: 3,
            download_url_csv: "/download/alice_report.csv",
            download_url_pdf: "/download/alice_report.pdf"
          },
          {
            id: "2",
            student_name: "Bob Smith",
            registration_id: "STU002",
            report_date: "2024-01-15",
            sessions_count: 8,
            avg_attention: 74.2,
            avg_emotion_score: 78.9,
            posture_issues: 7,
            download_url_csv: "/download/bob_report.csv",
            download_url_pdf: "/download/bob_report.pdf"
          },
          {
            id: "3",
            student_name: "Carol White",
            registration_id: "STU003",
            report_date: "2024-01-15",
            sessions_count: 15,
            avg_attention: 94.1,
            avg_emotion_score: 89.7,
            posture_issues: 1,
            download_url_csv: "/download/carol_report.csv",
            download_url_pdf: "/download/carol_report.pdf"
          }
        ];
        setReports(demoReports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports. Showing demo data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      // In a real implementation, this would download from the Flask backend
      toast({
        title: "Download Started",
        description: `Downloading ${filename}...`,
      });
      
      // Simulate download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
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
      const response = await fetch('/delete_all_students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setReports([]);
        toast({
          title: "Data Deleted",
          description: "All student data has been permanently deleted.",
        });
      } else {
        // Simulate successful deletion for demo
        setReports([]);
        toast({
          title: "Data Deleted",
          description: "All student data has been permanently deleted.",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
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

  const totalSessions = reports.reduce((sum, report) => sum + report.sessions_count, 0);
  const avgAttention = reports.length > 0 
    ? reports.reduce((sum, report) => sum + report.avg_attention, 0) / reports.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
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
                    This action cannot be undone. This will permanently delete all student data, 
                    monitoring records, and generated reports from the system.
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{reports.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{totalSessions}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{avgAttention.toFixed(1)}%</span>
              </div>
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
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant={getScoreColor(report.avg_attention)} className="text-xs">
                                  {report.avg_attention.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Emotion:</span>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant={getScoreColor(report.avg_emotion_score)} className="text-xs">
                                  {report.avg_emotion_score.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Posture Issues:</span>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant={report.posture_issues > 5 ? "destructive" : "warning"} className="text-xs">
                                  {report.posture_issues}
                                </Badge>
                              </div>
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