import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { WebcamCapture } from "@/components/WebcamCapture";
import { useToast } from "@/hooks/use-toast";
import { registerStudent } from "@/api"; // 🔗 new import

const Register = () => {
  const [studentName, setStudentName] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !registrationId.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setShowCamera(true);
  };

  const handleImageCapture = async (images: string[]) => {
    setCapturedImages(images);
    setLoading(true);

    try {
      const data = await registerStudent(studentName, registrationId, images); // 🔗 API call

      toast({
        title: "Registration Successful",
        description: `Welcome ${studentName}! You can now login with your registration ID.`,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to connect to the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowCamera(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
            <h1 className="text-2xl font-bold text-center">Face Registration</h1>
            <p className="text-center text-muted-foreground mt-2">
              Registering: <span className="font-medium">{studentName}</span> (ID: {registrationId})
            </p>
          </div>

          <WebcamCapture
            onCapture={handleImageCapture}
            captureCount={5}
            isCapturing={loading}
          />

          {loading && (
            <div className="text-center mt-6">
              <p className="text-primary font-medium">Processing registration...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="bg-gradient-card border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Student Registration</CardTitle>
            <CardDescription>
              Create your account and register your face for monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationId">Registration ID</Label>
                <Input
                  id="registrationId"
                  type="text"
                  placeholder="Create a unique registration ID"
                  value={registrationId}
                  onChange={(e) => setRegistrationId(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12" variant="hero">
                Continue to Face Registration
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
