import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Brain, Eye, Users, ShieldCheck, TrendingUp } from "lucide-react";
import { startRecognition } from "@/api"; // Make sure this exists in src/api.ts

const Home = () => {
  const [status, setStatus] = useState("");

  const testBackend = async () => {
    try {
      const res = await startRecognition();
      setStatus("✅ Success: " + res.message);
    } catch (err) {
      setStatus("❌ Failed to connect to backend.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            AI Student Monitoring System
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Real-time emotion, posture, attention, and attendance tracking using advanced AI technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                Student Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="xl" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                Register Now
              </Button>
            </Link>
            <Link to="/teacher">
              <Button variant="accent" size="xl" className="w-full sm:w-auto">
                Teacher Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Comprehensive Monitoring Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Emotion Detection</CardTitle>
                <CardDescription>
                  Real-time analysis of student emotional states during learning sessions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Eye className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Attention Tracking</CardTitle>
                <CardDescription>
                  Monitor focus levels and detect when students become distracted
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Monitor className="h-10 w-10 text-success mb-2" />
                <CardTitle>Posture Analysis</CardTitle>
                <CardDescription>
                  Track sitting posture and alert for ergonomic improvements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-warning mb-2" />
                <CardTitle>Attendance System</CardTitle>
                <CardDescription>
                  Automated attendance tracking through facial recognition
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Privacy Protection</CardTitle>
                <CardDescription>
                  Secure data handling with privacy-first monitoring approach
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Detailed insights and progress tracking for educators
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Backend Test Section */}
      <section className="py-8 px-4 bg-muted text-center">
        <h3 className="text-xl font-semibold mb-4">Test Backend Integration</h3>
        <Button onClick={testBackend} variant="secondary">Start Recognition (Test)</Button>
        {status && <p className="mt-2 text-muted-foreground">{status}</p>}
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-muted-foreground">
            Join thousands of educators using AI-powered monitoring to enhance learning outcomes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="hero" size="xl">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/teacher">
              <Button variant="outline" size="xl">
                Teacher Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2024 AI Student Monitoring System. All rights reserved.</p>
          <p className="text-sm opacity-75 mt-2">
            Enhancing education through intelligent monitoring technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
