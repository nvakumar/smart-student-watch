import { useRef, useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebcamCaptureProps {
  onCapture: (imageData: string[]) => void;
  captureCount?: number;
  isCapturing?: boolean;
}

export const WebcamCapture = ({ onCapture, captureCount = 5, isCapturing = false }: WebcamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentCapture, setCurrentCapture] = useState(0);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const handleCapture = useCallback(async () => {
    const images: string[] = [];
    
    for (let i = 0; i < captureCount; i++) {
      setCurrentCapture(i + 1);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between captures
      
      const imageData = captureImage();
      if (imageData) {
        images.push(imageData);
      }
    }
    
    setCapturedImages(images);
    setCurrentCapture(0);
    onCapture(images);
    
    toast({
      title: "Capture Complete",
      description: `Successfully captured ${images.length} images for registration.`,
    });
  }, [captureImage, captureCount, onCapture, toast]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Face Registration Camera
        </CardTitle>
        <CardDescription>
          Position your face in the camera view and click capture to register {captureCount} face samples.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto rounded-lg border border-border"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {isCapturing && currentCapture > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-white text-xl font-bold">
                Capturing {currentCapture}/{captureCount}...
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleCapture}
            disabled={!stream || isCapturing}
            variant="hero"
            size="lg"
          >
            <Camera className="h-4 w-4" />
            Capture & Register
          </Button>
          
          <Button
            onClick={stream ? stopCamera : startCamera}
            variant="outline"
            size="lg"
          >
            {stream ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {stream ? "Stop Camera" : "Start Camera"}
          </Button>
        </div>
        
        {capturedImages.length > 0 && (
          <div className="text-center text-sm text-success">
            ✓ {capturedImages.length} images captured successfully
          </div>
        )}
      </CardContent>
    </Card>
  );
};