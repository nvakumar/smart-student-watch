import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Eye, Brain, Monitor, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMonitoringStatus } from "@/api"; // ✅ NEW

interface StudentData {
  student_name: string;
  registration_id: string;
}

interface MonitoringData {
  detected_student_id: string;
  emotion: string;
  posture: string;
  eyes_status: string;
  attention: string;
  confidence: number;
}

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    detected_student_id: "Not Detected",
    emotion: "Neutral",
    posture: "Good",
    eyes_status: "Open",
    attention: "Focused",
    confidence: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedData = localStorage.getItem("studentData");
    if (!savedData) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(savedData);
      setStudentData(parsed);
    } catch (error) {
      console.error("Error parsing student data:", error);
      navigate("/login");
    }

    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchMonitoringData = async () => {
    if (!studentData) return;

    try {
      const data = await getMonitoringStatus(studentData.registration_id); // ✅ call backend
      setMonitoringData(data);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentData");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const getStatusColor = (status: string, type: string) => {
    switch (type) {
      case "attention":
        return status === "Focused" ? "success" : status === "Distracted" ? "warning" : "destructive";
      case "posture":
        return status === "Good" ? "success" : "warning";
      case "eyes":
        return status === "Open" ? "success" : "warning";
      case "emotion":
        return status === "Happy" || status === "Focused" ? "success" :
               status === "Neutral" ? "secondary" : "warning";
      default:
        return "secondary";
    }
  };

  if (!studentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we verify your session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {studentData.student_name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Feed */}
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Live Monitoring Feed
              </CardTitle>
              <CardDescription>
                Real-time video stream with AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <img
                  src="http://192.168.0.194:5050/video_feed_multi"
                  alt="Live monitoring feed"
                  className="w-full h-64 object-cover rounded-lg border border-border"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='480' viewBox='0 0 640 480'%3E%3Crect width='640' height='480' fill='%23f0f0f0'/%3E%3Ctext x='320' y='240' text-anchor='middle' font-family='Arial' font-size='24' fill='%23666'%3ECamera Feed%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="animate-pulse">
                    ● LIVE
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Panel */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{studentData.student_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-medium">{studentData.registration_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Detected ID:</span>
                    <Badge variant={monitoringData.detected_student_id === studentData.registration_id ? "success" : "warning"}>
                      {monitoringData.detected_student_id}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Analysis Status
                </CardTitle>
                <CardDescription>
                  Live monitoring results updated every 2 seconds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Emotion", icon: <Brain />, value: monitoringData.emotion, type: "emotion" },
                    { label: "Posture", icon: <Monitor />, value: monitoringData.posture, type: "posture" },
                    { label: "Eyes", icon: <Eye />, value: monitoringData.eyes_status, type: "eyes" },
                    { label: "Attention", icon: <AlertCircle />, value: monitoringData.attention, type: "attention" }
                  ].map(({ label, icon, value, type }) => (
                    <div key={label} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <Badge variant={getStatusColor(value, type)} className="w-full justify-center">
                        {value}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Confidence Level:</span>
                    <span className="font-medium">{monitoringData.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${monitoringData.confidence}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
