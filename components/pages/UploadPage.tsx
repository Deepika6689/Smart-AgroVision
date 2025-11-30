
import React, { useState, useRef, useEffect } from 'react';
import { DetectionResult, HistoryEntry, Theme, User, Language, Notification } from '../../types';
import { getMockDetection, generateEmailReport, sendEmail } from '../../services/geminiService';
import { useLocalization } from '../../hooks/useLocalization';
import ThreeDPlot from '../ThreeDPlot';
import DetectionHistory from '../DetectionHistory';
import { FiUpload, FiLoader, FiCheckCircle, FiAlertCircle, FiDownload, FiMail, FiMaximize, FiX, FiRefreshCw, FiEye, FiCopy, FiExternalLink, FiCpu, FiCamera, FiVideo, FiMapPin } from 'react-icons/fi';

// Declare third-party libraries for TypeScript
declare const html2canvas: any;
declare const jspdf: any;
declare const Plotly: any;

// --- Helper & Modal Components ---

interface EmailInputModalProps {
    onSubmit: (email: string) => void;
    onClose: () => void;
}

const EmailInputModal: React.FC<EmailInputModalProps> = ({ onSubmit, onClose }) => {
    const [email, setEmail] = useState('');
    const { t } = useLocalization();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && email.includes('@')) {
            onSubmit(email);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 animate-slide-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                        <FiMail className="mr-2" /> {t('enterEmail')}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <FiX size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{t('enterEmailDesc')}</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-white mb-4"
                        required
                        autoFocus
                    />
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                        >
                            {t('sendEmail')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main UploadPage Component ---

interface UploadPageProps {
  theme: Theme;
  user: User | null;
  uploadData: {
    result: DetectionResult | null;
    history: HistoryEntry[];
    imagePreview: string | null;
    grayscalePreview: string | null;
  };
  setUploadData: React.Dispatch<React.SetStateAction<{
    result: DetectionResult | null;
    history: HistoryEntry[];
    imagePreview: string | null;
    grayscalePreview: string | null;
  }>>;
  setAgriBotContext: (context: string) => void;
  addNotification: (message: string, type: Notification['type']) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ theme, user, uploadData, setUploadData, setAgriBotContext, addNotification }) => {
  const { t, language } = useLocalization();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Email State
  const [emailInputModalOpen, setEmailInputModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Camera Functions ---
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(t('cameraError'));
      addNotification(t('cameraError'), 'error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      // Create a File object from the base64 data
      fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
          const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
          handleFile(file);
          stopCamera();
      });
    }
  };

  // --- File Handling ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFile(event.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      addNotification(t('msgs.fileSizeError'), 'warning');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setUploadData(prev => ({
        ...prev,
        imagePreview: base64String,
        grayscalePreview: null, // Reset grayscale on new upload
        result: null, // Reset result on new upload
      }));
      // Auto-scroll to preview
      setTimeout(() => {
          window.scrollTo({ top: 300, behavior: 'smooth' });
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  // --- Analysis ---
  const handleAnalyze = async () => {
    if (!uploadData.imagePreview) return;
    
    setIsAnalyzing(true);
    setLoadingStep(0);
    setLoadingText(t('msgs.locating'));
    
    // Attempt to get location first
    let locationData: { lat: number, lng: number } | null = null;
    
    try {
        if ("geolocation" in navigator) {
            await new Promise<void>((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        locationData = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        resolve();
                    },
                    (error) => {
                        console.warn("Geolocation denied or error:", error);
                        addNotification("Location access denied. Continuing analysis without location data.", "info");
                        resolve();
                    },
                    { timeout: 5000 } // 5s timeout
                );
            });
        }
    } catch (e) {
        console.error("Geo error", e);
    }
    
    setLoadingText(t('analyzing'));

    // Simulate loading steps for UX
    const interval = setInterval(() => {
        setLoadingStep(prev => (prev < 90 ? prev + 10 : prev));
    }, 200);

    try {
      // INTERNAL PREPROCESSING: Convert to Grayscale for Analysis ONLY
      // Using manual pixel manipulation instead of ctx.filter to guarantee 
      // grayscale conversion across all browsers.
      
      const img = new Image();
      img.src = uploadData.imagePreview;
      
      // Wait for image to load to ensure dimensions are correct
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create an internal canvas for processing
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error("Canvas context failed");

      // Draw original image first
      ctx.drawImage(img, 0, 0);

      // Get raw pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Loop through every pixel and apply grayscale formula
      for (let i = 0; i < data.length; i += 4) {
        // Luminosity formula: 0.2126*R + 0.7152*G + 0.0722*B
        const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        data[i] = gray;     // Red
        data[i + 1] = gray; // Green
        data[i + 2] = gray; // Blue
        // Alpha (data[i+3]) remains unchanged
      }
      
      // Put the modified grayscale data back
      ctx.putImageData(imageData, 0, 0);

      // Extract Grayscale Data
      const grayscaleBase64 = canvas.toDataURL('image/jpeg');
      const res = await fetch(grayscaleBase64);
      const blob = await res.blob();
      
      // Create a specific file for the API call
      const grayscaleFile = new File([blob], "analysis_grayscale.jpg", { type: "image/jpeg" });

      // Send the GRAYSCALE version AND LOCATION AND LANGUAGE to the AI Service
      // This ensures the AI result text is in the selected language.
      const result = await getMockDetection(grayscaleFile, grayscaleBase64, locationData, language);
      
      clearInterval(interval);
      setLoadingStep(100);
      
      // Format Timestamp: dd/mm/yyyy - hh:mm:ss
      const now = new Date();
      const formattedTimestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Store the ORIGINAL COLOR image in history (per requirements)
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        date: formattedTimestamp,
        plantType: result.disease_name.split('___')[0] || 'Unknown',
        imageUrl: uploadData.imagePreview, // Preserving original image in history
        result: result,
      };

      setUploadData(prev => ({
        ...prev,
        result: result,
        grayscalePreview: grayscaleBase64, // Save grayscale to state for UI display
        history: [newEntry, ...prev.history],
      }));
      
      // Update AgriBot context
      setAgriBotContext(result.disease_name.replace(/_/g, ' '));
      addNotification(t('msgs.analysisComplete', { disease: result.disease_name.replace(/_/g, ' ') }), 'success');

      setTimeout(() => {
          setIsAnalyzing(false);
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (error) {
      clearInterval(interval);
      console.error("Analysis failed", error);
      setIsAnalyzing(false);
      addNotification(t('msgs.analysisFailed'), 'error');
    }
  };
  
  // --- Export & Email ---
  const handleGeneratePDF = async () => {
    if (!resultsRef.current || !uploadData.result) return;
    
    const element = resultsRef.current;
    
    // 1. Capture original styles to restore later
    const originalFilter = element.style.filter;
    const originalOpacity = element.style.opacity;
    const originalTransform = element.style.transform;
    const originalBackdrop = element.style.backdropFilter;
    const originalShadow = element.style.boxShadow;
    const originalRadius = element.style.borderRadius;
    const originalBg = element.style.background;
    const originalTransition = element.style.transition;

    try {
        // 2. Temporarily disable effects for sharp PDF capture
        element.style.transition = 'none'; // Disable transitions to prevent capture mid-animation
        element.style.filter = 'none';
        element.style.opacity = '1';
        element.style.transform = 'none'; // Reset any scaling/rotation
        element.style.backdropFilter = 'none'; // Remove glassmorphism blur
        element.style.boxShadow = 'none'; // Remove shadows for flat print
        element.style.borderRadius = '0'; // Sharp corners
        // Force solid background color to remove transparency
        element.style.background = theme === 'dark' ? '#111827' : '#ffffff'; 

        const canvas = await html2canvas(element, { 
            scale: 2, // High resolution for print
            useCORS: true, // Handle cross-origin images if any
            backgroundColor: theme === 'dark' ? '#111827' : '#ffffff', // Ensure canvas background is opaque
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`AgroVision_Report_${new Date().toISOString().slice(0,10)}.pdf`);
        addNotification(t('msgs.pdfDownloaded'), 'success');
    } catch (e) {
        console.error("PDF Generation Error", e);
        addNotification(t('msgs.pdfFailed'), 'error');
    } finally {
        // 3. Restore original UI state
        element.style.filter = originalFilter;
        element.style.opacity = originalOpacity;
        element.style.transform = originalTransform;
        element.style.backdropFilter = originalBackdrop;
        element.style.boxShadow = originalShadow;
        element.style.borderRadius = originalRadius;
        element.style.background = originalBg;
        element.style.transition = originalTransition;
    }
  };

  const handleEmailButtonClick = () => {
      // Check if logged in user has email, otherwise prompt
      if (user?.email) {
          performEmailSend(user.email);
      } else {
          setEmailInputModalOpen(true);
      }
  };
  
  const performEmailSend = async (email: string) => {
      if (!uploadData.result) return;
      
      setIsSendingEmail(true);
      setEmailInputModalOpen(false); // Close modal if it was open
      
      try {
          // Generate content first
          const content = await generateEmailReport(uploadData.result, { name: email.split('@')[0], email }, language);
          
          // Send via simulated backend
          await sendEmail(email, content.subject, content.body);
          
          addNotification(t('msgs.emailSent', { email }), 'success');
      } catch (e) {
          console.error("Email send failed", e);
          addNotification(t('msgs.emailFailed'), 'error');
      } finally {
          setIsSendingEmail(false);
      }
  };

  const handleViewHistoryReport = (entry: HistoryEntry) => {
      setUploadData(prev => ({
          ...prev,
          imagePreview: entry.imageUrl,
          grayscalePreview: null, // History doesn't typically store the grayscale version, so we clear it
          result: entry.result
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteHistory = (id: string) => {
      setUploadData(prev => ({
          ...prev,
          history: prev.history.filter(h => h.id !== id)
      }));
  };

  const getFormattedTimestamp = () => {
    if (uploadData.history.length > 0 && uploadData.result) {
        // Return timestamp from the history entry corresponding to current result
        // This is a bit of a workaround to get the "created at" time
        return uploadData.history[0].date; 
    }
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4">
          <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
                {t('uploadTitle')}
              </h2>
              <p className="text-gray-400 mt-2">
                 {t('uploadSubtitle')}
              </p>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-blue-400 hover:text-blue-300 underline mt-2 md:mt-0">
             {showHistory ? t('hideHistory') : t('showHistory')}
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Upload & Preview */}
        <div className="space-y-6">
            
            {/* Upload Card */}
            <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border-2 border-dashed border-gray-600 hover:border-green-500 transition-all duration-300 group text-center relative overflow-hidden">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                />
                
                {!isCameraOpen ? (
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <FiUpload className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-200 mb-2">{t('uploadCardTitle')}</h3>
                        <p className="text-sm text-gray-500 mb-6">{t('uploadCardSub')}</p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                             <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-300 font-semibold flex items-center justify-center"
                            >
                                <FiUpload className="mr-2" /> {t('selectImage')}
                            </button>
                            <button
                                onClick={startCamera}
                                className="px-6 py-3 bg-gray-700 text-white rounded-xl shadow-lg hover:bg-gray-600 transition-all duration-300 font-semibold flex items-center justify-center"
                            >
                                <FiCamera className="mr-2" /> {t('useCamera')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 animate-fade-in">
                        <div className="relative rounded-lg overflow-hidden shadow-xl border border-gray-500 mb-4 bg-black">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-64 object-cover"
                            />
                            <div className="absolute top-2 right-2 flex space-x-2">
                                <button 
                                    onClick={stopCamera} 
                                    className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition-colors"
                                    title={t('closeCamera')}
                                >
                                    <FiX />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button 
                                onClick={capturePhoto} 
                                className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-transform hover:scale-105 font-bold flex items-center"
                            >
                                <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                                {t('capture')}
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-all duration-500"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
            </div>

            {/* Preview Section */}
            {uploadData.imagePreview && (
                <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/10 animate-slide-up">
                    <h3 className="text-lg font-semibold mb-4 text-gray-300 flex items-center">
                        <FiEye className="mr-2"/> {t('imagePreview')}
                    </h3>
                    <div className="relative rounded-lg overflow-hidden shadow-2xl group">
                        <img 
                            src={uploadData.imagePreview} 
                            alt="Preview" 
                            className="w-full h-64 object-cover transform transition-transform duration-700 group-hover:scale-105" 
                        />
                        {/* Overlay Scan Effect */}
                         {isAnalyzing && (
                            <div className="absolute inset-0 bg-green-500/10 z-10">
                                <div className="w-full h-1 bg-green-400 absolute top-0 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center
                                ${isAnalyzing 
                                    ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-blue-500/30 transform hover:-translate-y-1'
                                }
                            `}
                        >
                            {isAnalyzing ? (
                                <><FiLoader className="animate-spin mr-3" /> {loadingText} {loadingStep > 0 && `${loadingStep}%`}</>
                            ) : (
                                <><FiCpu className="mr-3" /> {t('analyze')}</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Results & History */}
        <div className="space-y-6">
            {uploadData.result ? (
                // This div is captured by html2canvas. 
                // CRITICAL: Must be solid background, high contrast, no blur for PDF generation.
                <div 
                    ref={resultsRef} 
                    className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 animate-fade-in relative overflow-hidden text-gray-900 dark:text-gray-100"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <FiCheckCircle size={100} className="text-green-600"/>
                    </div>
                    
                    <div className="border-b border-gray-300 dark:border-gray-700 pb-4 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {t('detectionResult')}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    Timestamp: {getFormattedTimestamp()}
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg font-bold border-2 ${
                                uploadData.result.disease_name.toLowerCase().includes('healthy') 
                                ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                               Status: {uploadData.result.disease_name.toLowerCase().includes('healthy') ? t('healthy') : t('diseased')}
                            </div>
                        </div>
                    </div>

                    {/* DUAL IMAGE DISPLAY FOR ANALYSIS */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-300 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-bold">Original Image</p>
                            <img src={uploadData.imagePreview || ''} alt="Original" className="w-full h-32 object-cover rounded-md" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-300 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-bold">Analysis View (Grayscale)</p>
                            {/* Grayscale view from state, or fallback to original with CSS filter if history view */}
                            <img 
                                src={uploadData.grayscalePreview || uploadData.imagePreview || ''} 
                                alt="Grayscale Analysis" 
                                className="w-full h-32 object-cover rounded-md grayscale" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">{t('disease')}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white truncate" title={uploadData.result.disease_name.replace(/_/g, ' ')}>
                                {uploadData.result.disease_name.replace(/_/g, ' ')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">{t('severity')}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {uploadData.result.severity}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">{t('confidence')}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {uploadData.result.confidence}%
                            </p>
                        </div>
                    </div>
                    
                    {/* 3D Plot Section - Added Back */}
                     <div className="h-64 w-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 mb-6 relative">
                        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-white/50 dark:bg-black/50 rounded text-xs font-bold text-gray-600 dark:text-gray-300 uppercase backdrop-blur-sm">
                            {t('plotTitle')}
                        </div>
                        <ThreeDPlot 
                            scores={uploadData.result.confidence_scores} 
                            theme={theme} 
                            plotId="confidence-3d-plot" 
                        />
                    </div>

                    {/* Location Information */}
                    {uploadData.result.location && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center mb-2">
                                <FiMapPin className="text-green-600 dark:text-green-400 mr-2" />
                                <h4 className="font-bold text-gray-800 dark:text-gray-200">{t('location')}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                                    <span className="text-gray-500 dark:text-gray-400">{t('village')}:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{uploadData.result.location.village}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                                    <span className="text-gray-500 dark:text-gray-400">{t('district')}:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{uploadData.result.location.district}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                                    <span className="text-gray-500 dark:text-gray-400">{t('latitude')}:</span>
                                    <span className="font-mono text-gray-900 dark:text-white">{uploadData.result.location.latitude}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                                    <span className="text-gray-500 dark:text-gray-400">{t('longitude')}:</span>
                                    <span className="font-mono text-gray-900 dark:text-white">{uploadData.result.location.longitude}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mb-8">
                         <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                             <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">{t('treatmentRec')}</h4>
                             <div className="grid md:grid-cols-2 gap-6">
                                 <div>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1 font-bold">{t('curative')}</p>
                                     <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">{uploadData.result.recommended_treatment.curative}</p>
                                 </div>
                                 <div>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1 font-bold">{t('preventive')}</p>
                                     <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">{uploadData.result.recommended_treatment.preventive}</p>
                                 </div>
                             </div>
                         </div>
                         
                         {/* Analysis Reasoning Display - SUMMARY */}
                         <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-800 dark:text-blue-300 uppercase mb-1 font-bold">Summary</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 italic leading-relaxed">
                                {uploadData.result.analysis_reasoning}
                            </p>
                         </div>
                    </div>

                    <div className="flex space-x-3">
                         <button 
                            onClick={handleGeneratePDF}
                            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium shadow-md"
                        >
                            <FiDownload className="mr-2"/> PDF
                        </button>
                        <button 
                            onClick={handleEmailButtonClick}
                            disabled={isSendingEmail}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all shadow-md flex items-center justify-center font-medium disabled:opacity-70"
                        >
                            {isSendingEmail ? <FiLoader className="animate-spin" /> : <><FiMail className="mr-2"/> Email Report</>}
                        </button>
                    </div>
                </div>
            ) : (
               <div className="h-full flex items-center justify-center min-h-[400px] border-2 border-dashed border-gray-700 rounded-3xl p-8 text-center text-gray-500">
                   <div>
                       <FiMaximize size={48} className="mx-auto mb-4 opacity-50" />
                       <p>{t('uploadSubtitle')}</p>
                   </div>
               </div>
            )}
        </div>
      </div>
      
      {/* History Section */}
      {showHistory && uploadData.history.length > 0 && (
          <div className="mt-12 animate-fade-in">
              <DetectionHistory 
                history={uploadData.history} 
                onViewReport={handleViewHistoryReport}
                onDelete={handleDeleteHistory}
              />
          </div>
      )}

      {/* Email Input Modal */}
      {emailInputModalOpen && (
          <EmailInputModal 
            onSubmit={performEmailSend}
            onClose={() => setEmailInputModalOpen(false)}
          />
      )}
    </div>
  );
};

export default UploadPage;
