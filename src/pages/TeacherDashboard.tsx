import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Users, FileText, RefreshCw, Eye, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActiveStudent {
  id: string;
  name: string;
  emotion: string;
  attention: string;
  posture: string;
  last_seen: string;
  confidence: number;
}

const TeacherDashboard = () => {
  const [activeStudents, setActiveStudents] = useState<ActiveStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveStudents();
    
    // Refresh data every 5 seconds
    const interval = setInterval(fetchActiveStudents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveStudents = async () => {
    try {
      const response = await fetch('/get_current_students');
      
      if (response.ok) {
        const data = await response.json();
        setActiveStudents(data.students || []);
      } else {
        // Fallback demo data when Flask backend is not available
        const demoStudents: ActiveStudent[] = [
          {
            id: "STU001",
            name: "Alice Johnson",
            emotion: "Focused",
            attention: "High",
            posture: "Good",
            last_seen: new Date().toLocaleTimeString(),
            confidence: 95.2
          },
          {
            id: "STU002", 
            name: "Bob Smith",
            emotion: "Tired",
            attention: "Low",
            posture: "Slouching",
            last_seen: new Date().toLocaleTimeString(),
            confidence: 87.5
          },
          {
            id: "STU003",
            name: "Carol White",
            emotion: "Happy",
            attention: "High",
            posture: "Good",
            last_seen: new Date().toLocaleTimeString(),
            confidence: 92.8
          }
        ];
        setActiveStudents(demoStudents);
      }
    } catch (error) {
      console.error('Error fetching active students:', error);
      
      // Show demo data on error
      const demoStudents: ActiveStudent[] = [
        {
          id: "DEMO001",
          name: "Demo Student 1",
          emotion: "Neutral",
          attention: "Medium",
          posture: "Good",
          last_seen: new Date().toLocaleTimeString(),
          confidence: 90.0
        }
      ];
      setActiveStudents(demoStudents);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchActiveStudents();
    setTimeout(() => setLoading(false), 1000);
    
    toast({
      title: "Data Refreshed",
      description: "Student monitoring data has been updated.",
    });
  };

  const getStatusColor = (status: string, type: string) => {
    switch (type) {
      case 'attention':
        return status === 'High' ? 'success' : status === 'Medium' ? 'warning' : 'destructive';
      case 'posture':
        return status === 'Good' ? 'success' : 'warning';
      case 'emotion':
        return status === 'Happy' || status === 'Focused' ? 'success' : 
               status === 'Neutral' ? 'secondary' : 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
              <p className="text-muted-foreground">Monitor all active students in real-time</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link to="/reports">
                <Button variant="default">
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Teacher Feed */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Teacher Camera
                </CardTitle>
                <CardDescription>
                  Your monitoring view
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <img
                    src="/teacher_video_feed"
                    alt="Teacher video feed"
                    className="w-full h-48 object-cover rounded-lg border border-border"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'%3E%3Crect width='320' height='240' fill='%23f0f0f0'/%3E%3Ctext x='160' y='120' text-anchor='middle' font-family='Arial' font-size='18' fill='%23666'%3ETeacher View%3C/text%3E%3C/svg%3E";
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

            {/* Summary Stats */}
            <Card className="bg-gradient-card border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Class Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Students:</span>
                  <Badge variant="default">{activeStudents.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Focused:</span>
                  <Badge variant="success">
                    {activeStudents.filter(s => s.attention === 'High').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Need Attention:</span>
                  <Badge variant="warning">
                    {activeStudents.filter(s => s.attention === 'Low').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Students List */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Students ({activeStudents.length})
                </CardTitle>
                <CardDescription>
                  Real-time monitoring status for all students
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active students detected</p>
                    <p className="text-sm">Students will appear here when they join the session</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeStudents.map((student) => (
                      <Card key={student.id} className="border border-border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{student.name}</h3>
                                <Badge variant="outline">{student.id}</Badge>
                              </div>
                              
                              <div className="flex gap-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Brain className="h-3 w-3 text-muted-foreground" />
                                  <Badge variant={getStatusColor(student.emotion, 'emotion')} className="text-xs">
                                    {student.emotion}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                  <Badge variant={getStatusColor(student.attention, 'attention')} className="text-xs">
                                    {student.attention} Attention
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Monitor className="h-3 w-3 text-muted-foreground" />
                                  <Badge variant={getStatusColor(student.posture, 'posture')} className="text-xs">
                                    {student.posture}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <div className="text-sm text-muted-foreground">
                                Last seen: {student.last_seen}
                              </div>
                              <div className="text-sm">
                                Confidence: <span className="font-medium">{student.confidence.toFixed(1)}%</span>
                              </div>
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
      </div>
    </div>
  );
};

export default TeacherDashboard;