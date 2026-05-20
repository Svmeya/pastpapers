/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  ChevronRight, 
  School as SchoolIcon, 
  GraduationCap, 
  Layers, 
  FileText, 
  MessageSquare, 
  Send,
  ArrowLeft,
  Search,
  Sparkles,
  Bot,
  ArrowRight,
  Ruler,
  Pencil,
  Zap,
  FlaskConical,
  Dna,
  Globe,
  Scroll,
  BarChart,
  Plus,
  User,
  Shield,
  X,
  Check,
  AlertCircle,
  Download,
  FileUp
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { MOCK_SCHOOLS } from "./data";
import { School, GradeData, SubjectData, Category, PastPaper } from "./types";
import { 
  auth, 
  db, 
  storage,
  googleProvider, 
  signInWithPopup, 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  orderBy,
  limit,
  ref,
  uploadBytes,
  getDownloadURL,
  handleFirestoreError,
  OperationType
} from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

// Initialize Gemini safely
const ai = (() => {
  try {
    const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key || key === "undefined") return null;
    return new GoogleGenAI({ apiKey: key });
  } catch (e) {
    console.warn("Gemini AI initialization failed:", e);
    return null;
  }
})();

type NavigationState = {
  school?: School;
  grade?: GradeData;
  subject?: SubjectData;
  category?: Category;
  paper?: PastPaper;
};

// Error Boundary Component
function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Global Error Caught:", error);
      setHasError(true);
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#E3D6BF] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="font-serif text-3xl text-[#933B5B] mb-4">Oops! Something went wrong.</h1>
        <p className="text-stone-700 mb-8 max-w-md">The application encountered an unexpected error. This might be due to missing configuration or a temporary connection issue.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#933B5B] text-white px-8 py-3 rounded-full font-bold shadow-lg"
        >
          Reload Page
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function App() {
  const [nav, setNav] = useState<NavigationState>({});
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth & Admin State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<'upload' | 'users'>('upload');
  const [authError, setAuthError] = useState<{ code: string; message: string; domain?: string } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });
  const [firestorePapers, setFirestorePapers] = useState<PastPaper[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [activePaperTab, setActivePaperTab] = useState<'document' | 'summary'>('document');
  
  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: "",
    content: "",
    schoolId: "",
    grade: "",
    subject: "",
    category: "Periodically" as Category,
    unitNumber: "",
    description: "",
    year: new Date().getFullYear().toString(),
    externalFileUrl: ""
  });

  // Admin Management Sync
  const syncUserProfile = async (authUser: FirebaseUser) => {
    if (!authUser.email) {
      console.warn("Cannot sync user profile without email");
      return;
    }
    
    // Check if email is verified
    if (!authUser.emailVerified) {
      console.warn("User email not verified - matching rules will reject writes");
    }

    const userPath = `users/${authUser.uid}`;
    try {
      await setDoc(doc(db, "users", authUser.uid), {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName || "Resource Contributor",
        photoURL: authUser.photoURL || "",
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (e: any) {
      console.error("Error syncing user:", e);
      // We don't throw here to avoid breaking the app for the user, 
      // but admins will see errors in console
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setIsCheckingAdmin(true);
        // Super admin check
        const isSuper = user.email === "sumeyaferejo@gmail.com";
        setIsSuperAdmin(isSuper);

        // Sync user to firestore
        await syncUserProfile(user);

        // Check admin status in Firestore
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          setIsAdmin(adminDoc.exists() || isSuper);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(isSuper);
        } finally {
          setIsCheckingAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setIsCheckingAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUsersAndAdmins = async () => {
    if (!isAdmin) return;
    const path = "users & admins";
    try {
      const usersSnap = await getDocs(query(collection(db, "users"), orderBy("lastSeen", "desc"), limit(50)));
      setUsers(usersSnap.docs.map(d => d.data()));

      const adminsSnap = await getDocs(collection(db, "admins"));
      setAdmins(adminsSnap.docs.map(d => d.data()));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  };

  useEffect(() => {
    if (showAdminPanel && adminTab === 'users') {
      fetchUsersAndAdmins();
    }
  }, [showAdminPanel, adminTab]);

  const toggleAdmin = async (targetUser: any) => {
    if (!isSuperAdmin) return;
    const isAdminNow = admins.some(a => a.uid === targetUser.uid);
    const path = `admins/${targetUser.uid}`;
    try {
      if (isAdminNow) {
        await deleteDoc(doc(db, "admins", targetUser.uid));
      } else {
        await setDoc(doc(db, "admins", targetUser.uid), {
          uid: targetUser.uid,
          email: targetUser.email,
          displayName: targetUser.displayName,
          role: "admin",
          promotedAt: serverTimestamp(),
          promotedBy: user?.email
        });
      }
      fetchUsersAndAdmins();
    } catch (e: any) {
      handleFirestoreError(e, isAdminNow ? OperationType.DELETE : OperationType.WRITE, path);
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Sign in error:", error);
      setAuthError({
        code: error?.code || "auth/unknown",
        message: error?.message || "An unexpected error occurred during authentication.",
        domain: window.location.hostname
      });
    }
  };

  const handleBecomeAdmin = async () => {
    if (!user) return;
    try {
      setUploadStatus({ type: 'loading', message: 'Requesting admin access...' });
      await setDoc(doc(db, "admins", user.uid), {
        uid: user.uid,
        email: user.email,
        role: "admin"
      });
      setIsAdmin(true);
      setUploadStatus({ type: 'success', message: 'You are now an administrator!' });
      setTimeout(() => setUploadStatus({ type: 'idle' }), 3000);
    } catch (error: any) {
      console.error("Admin promotion error:", error);
      setUploadStatus({ type: 'error', message: "Failed to gain admin access. Ensure your email is sumeyaferejo@gmail.com" });
    }
  };

  const fetchPapers = async () => {
    if (!nav.school || !nav.grade || !nav.subject) return;
    
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "papers"),
        where("schoolId", "==", nav.school.id),
        where("grade", "==", nav.grade.grade.toString()),
        where("subject", "==", nav.subject.name),
        where("category", "==", nav.category || "Periodically")
      );
      
      const querySnapshot = await getDocs(q);
      const papers: PastPaper[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          url: data.fileUrl || "#",
        };
      }) as PastPaper[];
      
      setFirestorePapers(papers);
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [nav.school, nav.grade, nav.subject, nav.category]);

  const handleUploadPaper = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) {
      setUploadStatus({ type: 'error', message: 'Not authenticated or admin permission is missing.' });
      return;
    }
    
    // Check for email verification as required by rules
    if (!user.emailVerified && user.email !== "sumeyaferejo@gmail.com") {
      setUploadStatus({ type: 'error', message: 'Email verification is required for uploading resources.' });
      return;
    }
    
    setUploadStatus({ type: 'loading', message: 'Starting upload...' });
    
    try {
      let fileData: any = {};
      
      if (uploadForm.externalFileUrl) {
        fileData = {
          fileUrl: uploadForm.externalFileUrl,
          fileType: uploadForm.externalFileUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'text/html'
        };
      } else if (selectedFile) {
        setUploadStatus({ type: 'loading', message: `Uploading ${selectedFile.name}...` });
        
        const uploadTaskPromise = (async () => {
          const fileRef = ref(storage, `papers/${Date.now()}_${selectedFile.name}`);
          await uploadBytes(fileRef, selectedFile);
          const downloadUrl = await getDownloadURL(fileRef);
          return {
            fileUrl: downloadUrl,
            fileType: selectedFile.type
          };
        })();

        const storageTimeout = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Storage Timeout: Upload is taking too long. Check your connection or file size.")), 25000)
        );

        fileData = await Promise.race([uploadTaskPromise, storageTimeout]);
      }

      setUploadStatus({ type: 'loading', message: 'Registering paper metadata in database...' });
      
      // Clean up empty fields to match rules strictly if needed
      const finalForm = { ...uploadForm };
      if (!finalForm.unitNumber) delete (finalForm as any).unitNumber;
      if (!finalForm.content) delete (finalForm as any).content;
      delete (finalForm as any).externalFileUrl;

      const firestoreWritePromise = addDoc(collection(db, "papers"), {
        ...finalForm,
        ...fileData,
        uploadedBy: user.uid,
        createdAt: serverTimestamp()
      });

      const firestoreTimeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Database Timeout: The insert is taking too long to respond. This usually means your credentials/security rules did not match or the connection was interrupted.")), 20000)
      );

      await Promise.race([firestoreWritePromise, firestoreTimeout]);
      
      setUploadStatus({ type: 'success', message: 'Paper successfully published!' });
      // Reset form
      setUploadForm({
        title: "",
        content: "",
        schoolId: "",
        grade: "",
        subject: "",
        category: "Periodically",
        unitNumber: "",
        description: "",
        year: new Date().getFullYear().toString(),
        externalFileUrl: ""
      });
      setSelectedFile(null);
      setTimeout(() => setUploadStatus({ type: 'idle' }), 3000);
      fetchPapers();
    } catch (error: any) {
      console.error("Critical Upload Error:", error);
      let errorMsg = error.message || 'An unknown error occurred during upload.';
      
      if (errorMsg.includes('storage/unauthorized') || errorMsg.includes('permission-denied')) {
        errorMsg = "Access Denied: You do not have permission to upload. Ensure your account is allowed and your email is verified if required.";
      } else if (errorMsg.includes('quota exceeded')) {
        errorMsg = "Cloud Storage quota exceeded. Please try again tomorrow.";
      } else if (errorMsg.includes('missing or insufficient permissions')) {
        errorMsg = "Firestore Permission Denied: Check your security rules or admin status.";
      }
      
      setUploadStatus({ type: 'error', message: errorMsg });
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Simulate loading state for better UX
  useEffect(() => {
    if (nav.school || nav.grade || nav.subject || nav.paper) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [nav]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (nav.paper && nav.paper.url && nav.paper.url !== "#") {
      setActivePaperTab('document');
    } else {
      setActivePaperTab('summary');
    }
  }, [nav.paper]);

  const handleBack = () => {
    if (nav.paper) setNav(prev => ({ ...prev, paper: undefined }));
    else if (nav.category) setNav(prev => ({ ...prev, category: undefined }));
    else if (nav.subject) setNav(prev => ({ ...prev, subject: undefined }));
    else if (nav.grade) setNav(prev => ({ ...prev, grade: undefined }));
    else if (nav.school) setNav(prev => ({ ...prev, school: undefined }));
  };

  const resetNav = () => setNav({});

  const getSubjectIcon = (name: string) => {
    switch (name) {
      case "Math": return <Ruler size={20} />;
      case "English": return <Pencil size={20} />;
      case "Physics": return <Zap size={20} />;
      case "Chemistry": return <FlaskConical size={20} />;
      case "Biology": return <Dna size={20} />;
      case "Geography": return <Globe size={20} />;
      case "History": return <Scroll size={20} />;
      case "Economics": return <BarChart size={20} />;
      default: return <Layers size={20} />;
    }
  };

  const openUploadModal = () => {
    if (nav.school && nav.grade && nav.subject) {
      setUploadForm({
        title: "",
        content: "",
        schoolId: nav.school.id,
        grade: nav.grade.grade.toString(),
        subject: nav.subject.name,
        category: nav.category || "Topically",
        unitNumber: "",
        description: "",
        year: new Date().getFullYear().toString()
      });
    }
    setShowAdminPanel(true);
    setAdminTab('upload');
  };

  const openUploadModalForUnit = (unitNum: number, unitTitle: string) => {
    if (nav.school && nav.grade && nav.subject) {
      const pureTitle = unitTitle.includes(":") ? unitTitle.split(":")[1].trim() : unitTitle;
      setUploadForm({
        title: `Topical Test - ${pureTitle}`,
        content: "",
        schoolId: nav.school.id,
        grade: nav.grade.grade.toString(),
        subject: nav.subject.name,
        category: "Topically",
        unitNumber: unitNum.toString(),
        description: `Questions covering ${pureTitle}`,
        year: new Date().getFullYear().toString()
      });
    }
    setShowAdminPanel(true);
    setAdminTab('upload');
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !nav.paper || !ai) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsTyping(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are an expert tutor helping a student study a past paper for ${nav.subject?.name} (Grade ${nav.grade?.grade}). 
          The paper content is: "${nav.paper.content}". 
          Answer questions about the paper, explain difficult concepts, and provide guidance based ONLY on the provided content when possible. 
          If the student asks something outside the paper, try to relate it back to the subject matter. Keep responses educational and encouraging.`,
        }
      });

      const result = await chat.sendMessage({ message: userMessage });
      const modelResponse = result.text;
      
      setChatMessages(prev => [...prev, { role: "model", text: modelResponse || "I'm sorry, I couldn't process that request." }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setChatMessages(prev => [...prev, { role: "model", text: "Something went wrong. Please check your connection or AI configuration." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const filteredSchools = MOCK_SCHOOLS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`shimmer rounded-xl ${className} ${isDarkMode ? "bg-slate-800" : "bg-gray-100"}`} />
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${isDarkMode ? "bg-slate-900 text-slate-200" : "bg-bg-light text-stone-900"}`}>
      {/* Header */}
      <header className={`py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-gray-100"}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetNav}>
          <div className="bg-primary p-1.5 rounded-lg text-white shadow-lg shadow-primary/20">
            <GraduationCap size={20} />
          </div>
          <span className={`font-serif font-bold text-xl tracking-tight transition-colors ${isDarkMode ? "text-white" : "text-primary"}`}>PastPaper</span>
        </div>

        <div className="flex items-center gap-4">
          {(isAdmin || isCheckingAdmin) && (
            <button 
              disabled={isCheckingAdmin}
              onClick={() => setShowAdminPanel(true)}
              className={`flex items-center gap-2 p-2 px-3 rounded-full transition-all text-xs font-bold uppercase tracking-wider ${isCheckingAdmin ? "opacity-50" : ""} ${isDarkMode ? "bg-accent-green text-slate-900" : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"}`}
            >
              <Plus size={16} /> <span className="hidden sm:inline">{isCheckingAdmin ? "Verifying..." : "Upload Paper"}</span>
            </button>
          )}

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? "bg-slate-800 text-yellow-400" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {isDarkMode ? <Sparkles size={18} /> : <Bot size={18} />}
          </button>
          
          <div className="hidden md:flex gap-4 items-center">
             {user ? (
               <div className="flex items-center gap-2 bg-stone-100 dark:bg-slate-800 p-1 pl-1 pr-3 rounded-full border border-stone-200 dark:border-slate-700">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt="" /> : <User size={14} />}
                  </div>
                  <span className="text-[10px] font-bold uppercase truncate max-w-[80px]">Admin Access</span>
               </div>
             ) : (
               <button 
                 onClick={handleSignIn}
                 className="text-sm font-medium opacity-70 hover:opacity-100 flex items-center gap-2 bg-stone-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-stone-200 dark:border-slate-700"
               >
                 <User size={14} /> Sign In
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* Homepage / Hero */}
          {!nav.school && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Hero Background */}
              <div className={`w-full py-24 px-6 text-center flex flex-col items-center relative overflow-hidden transition-colors ${isDarkMode ? "bg-slate-950 text-white" : "bg-primary text-white"}`}>
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                   <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
                   <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-accent-olive rounded-full blur-[80px]" />
                   <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent-green rounded-full blur-[120px]" />
                   <div className="absolute bottom-[10%] left-[20%] w-[15%] h-[15%] rounded-full border border-secondary/20" />
                </div>

                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-4xl md:text-6xl max-w-3xl leading-tight mb-6 relative z-10"
                >
                  Past papers, <span className="text-secondary italic underline decoration-secondary/30">perfectly</span> organized.
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-200 text-lg md:text-xl max-w-2xl mb-12 font-light"
                >
                  Browse thousands of past examination papers across schools, grades and subjects — and study smarter with an AI tutor at your side.
                </motion.p>
                
                {/* Search Bar */}
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`w-full max-w-2xl rounded-full p-1.5 flex items-center shadow-2xl relative z-10 transition-colors ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
                >
                  <Search className="ml-5 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search for a school..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 px-4 py-3 placeholder-gray-400 bg-transparent focus:outline-none ${isDarkMode ? "text-white" : "text-gray-800"}`}
                  />
                  <button className="bg-secondary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg active:scale-95">
                    Search <ArrowRight size={18} />
                  </button>
                </motion.div>
              </div>

              {/* School Grid */}
              <div className="max-w-7xl mx-auto w-full px-6 py-20 text-center">
                <h2 className="font-serif text-3xl mb-4 relative inline-block">
                  Select Your School
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent-green rounded-full" />
                </h2>

                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredSchools.map((school, idx) => (
                    <motion.div
                      key={school.id}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setNav({ school })}
                      className={`group rounded-[40px] p-8 text-left border shadow-sm hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full ${
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-stone-200"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-colors ${
                        isDarkMode 
                          ? "bg-slate-700 text-accent-green" 
                          : idx % 3 === 0 ? "bg-primary/10 text-primary" : idx % 3 === 1 ? "bg-secondary/10 text-secondary" : "bg-accent-green/20 text-accent-green"
                      }`}>
                        <GraduationCap size={28} />
                      </div>
                      <h3 className="font-serif font-bold text-2xl mb-4 flex-1">{school.name}</h3>
                      <div className="flex items-center justify-between mt-6">
                        <span className={`text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all ${
                          idx % 3 === 0 ? "text-primary" : idx % 3 === 1 ? "text-secondary" : "text-accent-olive"
                        }`}>
                          Browse Papers <ArrowRight size={14} />
                        </span>
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className={`w-6 h-6 rounded-full border-2 ${
                               isDarkMode ? "bg-slate-600 border-slate-800" : 
                               i === 1 ? "bg-primary border-white" : i === 2 ? "bg-secondary border-white" : "bg-accent-green border-white"
                             }`} />
                           ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* School Details / Grade Selection */}
          {nav.school && !nav.grade && (
            <motion.div 
              key="grades"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto px-12 py-12"
            >
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-400 text-sm hover:text-gray-900 transition-colors mb-8"
              >
                <ArrowLeft size={16} /> Back to Schools
              </button>
              
              <h1 className={`font-serif text-3xl md:text-4xl mb-2 ${isDarkMode ? "text-accent-green" : "text-primary"}`}>{nav.school.name}</h1>
              <p className="text-stone-500 text-sm mb-12">Select a grade level to begin your study session</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className={`p-10 rounded-[40px] border flex flex-col items-center ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"}`}>
                      <Skeleton className="w-16 h-16 rounded-full mb-8" />
                      <Skeleton className="w-24 h-6 mb-2" />
                      <Skeleton className="w-32 h-4" />
                    </div>
                  ))
                ) : (
                  nav.school.grades.map((grade, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setNav(prev => ({ ...prev, grade }))}
                      className={`p-10 rounded-[40px] border transition-all group flex flex-col items-center text-center ${
                        isDarkMode ? "bg-slate-800 border-slate-700 hover:border-accent-green" : 
                        i % 2 === 0 ? "bg-white border-primary/5 hover:border-primary hover:shadow-xl" : "bg-white border-accent-green/5 hover:border-accent-green hover:shadow-xl"
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform ${
                        isDarkMode ? "bg-slate-700 text-accent-green" : 
                        i % 3 === 0 ? "bg-primary-light text-primary" : 
                        i % 3 === 1 ? "bg-secondary/10 text-secondary" : 
                        "bg-accent-green/10 text-accent-green"
                      }`}>
                        <GraduationCap size={32} />
                      </div>
                      <span className="font-serif text-2xl font-bold mb-2">Grade {grade.grade}</span>
                      <span className="text-stone-400 text-sm font-medium">
                        {grade.streams ? "Natural & Social" : `${grade.subjects?.length} Subjects`}
                      </span>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Grade Details / Subject Selection */}
          {nav.grade && !nav.subject && (
            <motion.div 
              key="subjects"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto px-12 py-12"
            >
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-400 text-sm hover:text-gray-900 transition-colors mb-8"
              >
                <ArrowLeft size={16} /> Back to Grades
              </button>
              
              <h1 className={`font-serif text-3xl md:text-4xl mb-2 ${isDarkMode ? "text-accent-green" : "text-primary"}`}>{nav.school?.name} - Grade {nav.grade.grade}</h1>
              <p className="text-stone-500 text-sm mb-12 font-medium opacity-70 italic">{nav.grade.streams ? "Dual-stream academic path detected. Choose your focus:" : "Select a subject to view available papers"}</p>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {Array(6).fill(0).map((_, i) => (
                     <div key={i} className={`p-6 rounded-[32px] border flex items-center gap-4 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"}`}>
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                        <Skeleton className="w-24 h-4" />
                     </div>
                   ))}
                </div>
              ) : nav.grade.streams ? (
                <div className="space-y-12">
                  {nav.grade.streams.map((stream, idx) => (
                    <div key={idx} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? "bg-slate-800 text-accent-green" : idx % 2 === 0 ? "bg-primary-light text-primary" : "bg-accent-green/10 text-accent-green"}`}>
                          {stream.name === "Natural Science" ? <FlaskConical size={20} /> : <Globe size={20} />}
                        </div>
                        <h2 className={`font-serif text-2xl font-bold ${isDarkMode ? "text-slate-100" : idx % 2 === 0 ? "text-primary" : "text-accent-green"}`}>{stream.name}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {stream.subjects.map((subject, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.02, x: 5 }}
                            onClick={() => setNav(prev => ({ ...prev, subject }))}
                            className={`p-6 rounded-[32px] border transition-all flex items-center gap-4 group text-left ${
                              isDarkMode ? "bg-slate-800 border-slate-700 hover:border-accent-green" : "bg-white border-stone-200 hover:shadow-md"
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 ${
                              isDarkMode ? "bg-slate-700 text-accent-green group-hover:bg-accent-green group-hover:text-slate-900" : 
                              i % 4 === 0 ? "bg-primary-light text-primary group-hover:bg-primary group-hover:text-white" :
                              i % 4 === 1 ? "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white" :
                              i % 4 === 2 ? "bg-accent-green/10 text-accent-green group-hover:bg-accent-green group-hover:text-white" :
                              "bg-accent-olive/10 text-accent-olive group-hover:bg-accent-olive group-hover:text-white"
                            }`}>
                              {getSubjectIcon(subject.name)}
                            </div>
                            <span className="font-bold text-sm">{subject.name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nav.grade.subjects?.map((subject, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => setNav(prev => ({ ...prev, subject }))}
                      className={`p-6 rounded-[32px] border transition-all flex items-center gap-4 group text-left ${
                        isDarkMode ? "bg-slate-800 border-slate-700 hover:border-accent-green" : "bg-white border-primary/5 hover:border-primary hover:shadow-md"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 ${
                        isDarkMode ? "bg-slate-700 text-accent-green group-hover:bg-accent-green group-hover:text-slate-900" : 
                        i % 4 === 0 ? "bg-primary-light text-primary group-hover:bg-primary group-hover:text-white" :
                        i % 4 === 1 ? "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white" :
                        i % 4 === 2 ? "bg-accent-green/10 text-accent-green group-hover:bg-accent-green group-hover:text-white" :
                        "bg-accent-olive/10 text-accent-olive group-hover:bg-accent-olive group-hover:text-white"
                      }`}>
                        {getSubjectIcon(subject.name)}
                      </div>
                      <span className="font-bold text-sm">{subject.name}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Subject Details / Category & Paper Listing */}
          {nav.subject && (
            <motion.div 
              key="subject-papers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-12 py-12"
            >
              {/* This covers both Category and Paper list to match screenshot 3 better */}
              {!nav.paper ? (
                <>
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-400 text-sm hover:text-gray-900 transition-colors mb-8"
                  >
                    <ArrowLeft size={16} /> Back to Subjects
                  </button>
                  
                      <div className="flex justify-between items-center mb-12">
                         <h1 className={`font-serif text-3xl md:text-4xl mb-2 ${isDarkMode ? "text-accent-green" : "text-primary"}`}>{nav.subject.name} - Grade {nav.grade?.grade}</h1>
                         {isAdmin && (
                            <button 
                              onClick={fetchPapers}
                              className={`p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors ${isLoading ? "animate-spin" : ""}`}
                              title="Refresh papers"
                            >
                              <Sparkles size={18} className="text-secondary" />
                            </button>
                         )}
                      </div>

                  {/* Category Pill Switcher */}
                          <div className={`flex p-1.5 rounded-2xl w-fit mb-12 shadow-inner border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-200 border-stone-300/20"}`}>
                    {(["Periodically", "Topically"] as Category[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNav(prev => ({ ...prev, category: cat }))}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                          (nav.category || "Periodically") === cat 
                            ? isDarkMode ? "bg-accent-green text-slate-900 shadow-lg" : "bg-white text-primary shadow-md" 
                            : isDarkMode ? "text-slate-400 hover:text-slate-100" : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        {cat === "Periodically" ? <BookOpen size={16} /> : <Layers size={16} />}
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Paper List */}
                  <div className="space-y-4">
                    {/* Chapters/Units section for Topically category */}
                    {nav.category === "Topically" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-8 rounded-[32px] mb-8 border transition-all ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-white border-stone-100 shadow-sm"}`}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h2 className={`font-serif text-2xl font-bold ${isDarkMode ? "text-slate-100" : "text-primary"}`}>Chapters & Units</h2>
                          <div className="bg-blue-600 p-1.5 rounded-full text-white shadow-lg shadow-blue-600/20">
                            <BookOpen size={18} />
                          </div>
                        </div>
                        <p className={`mb-6 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                          The curriculum for Grade {nav.grade?.grade} {nav.subject.name} is divided into units. Click on a unit to expand lesson contents, view custom past papers, or upload custom study material:
                        </p>
                        <ul className="space-y-4">
                          {(nav.subject.topical || []).map((paper, i) => {
                            const isExpanded = expandedChapter === i;
                            // Filter papers uploaded for this unit number
                            const unitPapers = firestorePapers.filter(
                              p => p.category === "Topically" && p.unitNumber === (i + 1).toString()
                            );

                            return (
                              <motion.li 
                                key={i} 
                                className={`flex flex-col rounded-[24px] border transition-all overflow-hidden ${
                                  isExpanded 
                                    ? isDarkMode ? "bg-slate-900/95 border-accent-green" : "bg-white border-primary shadow-md"
                                    : isDarkMode ? "bg-slate-900 border-slate-700 hover:border-accent-green/50" : "bg-stone-50 border-stone-100 hover:border-primary hover:bg-white hover:shadow-sm"
                                }`}
                              >
                                {/* Chapter header row */}
                                <div 
                                  className="flex items-center gap-4 p-5 cursor-pointer select-none"
                                  onClick={() => setExpandedChapter(isExpanded ? null : i)}
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${isExpanded ? "bg-primary text-white font-black" : isDarkMode ? "bg-slate-800 text-accent-green border border-slate-700" : "bg-white text-primary shadow-sm border border-stone-200"}`}>
                                    {i + 1}
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-bold text-sm block">{paper.title}</span>
                                    <span className="text-[10px] opacity-65 block mt-0.5">
                                      {unitPapers.length > 0 
                                        ? `${unitPapers.length} study document${unitPapers.length > 1 ? 's' : ''} available` 
                                        : "No custom papers uploaded yet"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {unitPapers.length > 0 && (
                                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${isExpanded ? "bg-primary/10 text-primary" : "bg-secondary/15 text-secondary"}`}>
                                        {unitPapers.length} file{unitPapers.length > 1 ? 's' : ''} available
                                      </span>
                                    )}
                                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                                      <ChevronRight size={14} className="opacity-50" />
                                    </motion.div>
                                  </div>
                                </div>

                                {/* Expanded content area */}
                                {isExpanded && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className={`px-5 pb-6 border-t ${isDarkMode ? "border-slate-800 bg-slate-950/20" : "border-stone-100 bg-stone-50/20"}`}
                                  >
                                    {paper.description && (
                                      <p className="text-xs opacity-70 mt-4 mb-4 italic font-light pl-2 border-l-2 border-secondary/30">
                                        "{paper.description}"
                                      </p>
                                    )}

                                    <div className="space-y-3 mt-4">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Contributor Papers & Past Material</h4>
                                      
                                      {/* List of custom papers uploaded for this unit from Firestore */}
                                      {unitPapers.length === 0 ? (
                                        <div className={`p-6 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center gap-2 ${isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-400" : "bg-stone-50 border-stone-200 text-stone-500"}`}>
                                          <FileUp size={24} className="opacity-40 text-primary mb-1" />
                                          <span className="text-xs font-bold">No custom papers/files uploaded yet for this unit.</span>
                                          <span className="text-[10px] opacity-70">Contributed materials uploaded by admins appear here instantly!</span>
                                        </div>
                                      ) : (
                                        unitPapers.map((up) => (
                                          <div 
                                            key={up.id}
                                            onClick={() => setNav(prev => ({ ...prev, paper: up }))}
                                            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                              isDarkMode ? "bg-slate-900 border-slate-800 hover:border-accent-green" : "bg-white border-stone-200/60 hover:border-primary hover:shadow-sm"
                                            }`}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 bg-yellow-400/10 text-yellow-500 rounded-xl">
                                                <Sparkles size={16} />
                                              </div>
                                              <div>
                                                <span className="text-xs font-bold block">{up.title}</span>
                                                <span className="text-[10px] opacity-50 block mt-0.5">
                                                  {up.description || `Uploaded Past Material`}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              {up.year && (
                                                <span className="text-[10px] font-bold text-stone-400">{up.year}</span>
                                              )}
                                              {up.fileUrl && up.fileUrl !== "#" && (
                                                <span className="text-[9px] font-black bg-stone-100 dark:bg-slate-800 text-stone-500 rounded px-2.5 py-0.5">PDF</span>
                                              )}
                                              <span className="text-[11px] font-black text-secondary uppercase tracking-wider pr-2">Open Paper</span>
                                            </div>
                                          </div>
                                        ))
                                      )}

                                      {/* Admin-only Upload button nested directly here inside the Chapter card! */}
                                      {isAdmin && (
                                        <button 
                                          onClick={() => openUploadModalForUnit(i + 1, paper.title)}
                                          className={`w-full mt-4 p-4 rounded-2xl border border-dashed transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                                            isDarkMode 
                                              ? "border-slate-850 hover:border-accent-green/50 bg-slate-950/40 text-accent-green" 
                                              : "border-stone-200 hover:border-primary bg-stone-50 text-primary"
                                          }`}
                                        >
                                          <Plus size={14} /> Upload Contributed Paper for Chapter {i + 1}
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </motion.li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}

                    {nav.category === "Periodically" && (
                      <div className="mt-6 space-y-4">
                        {isLoading ? (
                          Array(3).fill(0).map((_, i) => (
                             <div key={i} className={`p-6 rounded-[32px] border flex items-center justify-between ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"}`}>
                                <div className="flex items-center gap-6">
                                   <Skeleton className="w-12 h-12 rounded-xl" />
                                   <div>
                                      <Skeleton className="w-32 h-4 mb-2" />
                                      <Skeleton className="w-20 h-3" />
                                   </div>
                                </div>
                                <Skeleton className="w-6 h-6 rounded-full" />
                             </div>
                          ))
                        ) : (() => {
                            const mockPapers = nav.subject.periodical || [];
                            return [...firestorePapers, ...mockPapers];
                          })().map((paper, idx) => (
                      <motion.button
                        key={paper.id}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setNav(prev => ({ ...prev, paper }))}
                        className={`w-full p-6 rounded-[32px] border transition-all flex items-center justify-between text-left group ${
                          isDarkMode ? "bg-slate-800 border-slate-700 hover:border-accent-green" : "bg-white border-stone-200 hover:shadow-lg"
                        }`}
                      >
                         <div className="flex items-center gap-6">
                             <div className={`p-3 rounded-2xl transition-colors ${
                               isDarkMode ? "bg-slate-700 text-accent-green group-hover:bg-accent-green group-hover:text-slate-900" : 
                               idx % 4 === 0 ? "bg-primary-light text-primary group-hover:bg-primary group-hover:text-white" :
                               idx % 4 === 1 ? "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white" :
                               idx % 4 === 2 ? "bg-accent-green/10 text-accent-green group-hover:bg-accent-green group-hover:text-white" :
                               "bg-accent-olive/10 text-accent-olive group-hover:bg-accent-olive group-hover:text-white"
                             }`}>
                               <FileText size={24} />
                            </div>
                            <div>
                               <p className={`font-bold text-lg transition-colors group-hover:text-primary`}>{paper.title}</p>
                               <div className="flex items-center gap-3 mt-1">
                                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">{paper.year || "Topic-based"}</p>
                                  <span className="w-1 h-1 bg-stone-200 rounded-full" />
                                  {paper.url && paper.url !== "#" && (
                                     <div className="flex items-center gap-1 text-primary">
                                       <Download size={10} />
                                       <span className="text-[10px] font-black uppercase">Archive</span>
                                     </div>
                                  )}
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                                    idx % 3 === 0 ? "bg-secondary/10 text-secondary" : 
                                    idx % 3 === 1 ? "bg-accent-olive/10 text-accent-olive" :
                                    "bg-accent-green/20 text-accent-green"
                                  }`}>NEW</span>
                               </div>
                            </div>
                         </div>
                         <div className={`p-2 rounded-full transition-colors ${isDarkMode ? "bg-slate-700 text-slate-400 group-hover:text-accent-green" : "bg-stone-50 text-stone-300 group-hover:text-primary"}`}>
                            <ChevronRight size={20} />
                         </div>
                      </motion.button>
                    ))}
                        {([...firestorePapers, ...(nav.subject.periodical || [])]).length === 0 && (
                          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                            No periodical papers found yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Paper View / Chatbot - Split View */
                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
                  {/* Paper Content Wrapper */}
                  <div className={`flex-1 flex flex-col rounded-[40px] border overflow-hidden shadow-2xl ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-stone-200"}`}>
                    <div className={`p-8 border-b flex items-center justify-between ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-stone-50/50 border-stone-100"}`}>
                      <div>
                        <h2 className={`font-serif font-bold text-2xl ${isDarkMode ? "text-accent-green" : "text-primary"}`}>{nav.paper.title}</h2>
                        {nav.paper.url && nav.paper.url !== "#" && (
                          <div className="flex items-center gap-3 mt-1.5">
                            <a 
                              href={nav.paper.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                            >
                              <Download size={14} /> Download File
                            </a>
                          </div>
                        )}
                        <div className="flex gap-4 mt-2">
                           <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${isDarkMode ? "bg-slate-800 text-slate-400" : "bg-secondary/10 text-secondary"}`}>
                             Grade {nav.grade?.grade}
                           </span>
                           <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${isDarkMode ? "bg-slate-800 text-slate-400" : "bg-accent-green/20 text-accent-green"}`}>
                             {nav.subject?.name}
                           </span>
                        </div>
                      </div>
                      <button 
                        onClick={handleBack} 
                        className="text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-6 py-3 rounded-2xl transition-all border border-primary/20"
                      >
                        Exit Mode
                      </button>
                    </div>

                    {/* Integrated Switcher Tabs for Document file vs AI Notes */}
                    {nav.paper.url && nav.paper.url !== "#" && (
                      <div className={`px-8 py-2 border-b flex gap-4 text-xs font-bold ${isDarkMode ? "bg-slate-950 border-slate-850" : "bg-stone-100/50 border-stone-100"}`}>
                        <button
                          onClick={() => setActivePaperTab('document')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                            activePaperTab === 'document'
                              ? isDarkMode ? "bg-accent-green text-slate-900 font-extrabold shadow-md" : "bg-primary text-white font-extrabold shadow-sm"
                              : isDarkMode ? "text-slate-400 hover:text-slate-100" : "text-stone-500 hover:text-stone-850"
                          }`}
                        >
                          📄 Active Document File
                        </button>
                        <button
                          onClick={() => setActivePaperTab('summary')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                            activePaperTab === 'summary'
                              ? isDarkMode ? "bg-accent-green text-slate-900 font-extrabold shadow-md" : "bg-primary text-white font-extrabold shadow-sm"
                              : isDarkMode ? "text-slate-400 hover:text-slate-100" : "text-stone-500 hover:text-stone-850"
                          }`}
                        >
                          📝 Transcript & Summary
                        </button>
                      </div>
                    )}

                    {activePaperTab === 'document' && nav.paper.url && nav.paper.url !== "#" ? (
                      <div className="flex-1 w-full bg-stone-100 dark:bg-slate-950 min-h-0 relative">
                        {nav.paper.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(nav.paper.url) ? (
                          <div className="w-full h-full overflow-auto flex items-center justify-center p-8 bg-stone-100 dark:bg-slate-955">
                            <img 
                              src={nav.paper.url} 
                              alt={nav.paper.title} 
                              referrerPolicy="no-referrer"
                              className="max-w-full max-h-full object-contain rounded-2xl shadow-xl border border-stone-200 dark:border-slate-800"
                            />
                          </div>
                        ) : (
                          <iframe 
                            src={nav.paper.url} 
                            className="w-full h-full border-0 bg-white" 
                            title={nav.paper.title}
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    ) : (
                      <div className={`flex-1 p-8 overflow-y-auto ${isDarkMode ? "bg-slate-900" : "bg-gray-50/50"}`}>
                         <div className={`p-12 rounded-[32px] shadow-sm border min-h-full mx-auto max-w-3xl relative ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-gray-100"}`}>
                            <div className={`text-center mb-10 pb-8 border-b ${isDarkMode ? "border-slate-800" : "border-gray-100"}`}>
                                <div className="absolute top-8 left-8">
                                  <div className={`w-3 h-3 rounded-full ${isDarkMode ? "bg-slate-800" : "bg-gray-100"}`} />
                                </div>
                                <h3 className="font-serif text-3xl font-bold mb-3">Academic Repository</h3>
                                <p className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Authentication Level Alpha</p>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                              <p className="text-xl leading-[1.8] font-serif italic text-pretty text-stone-700 dark:text-slate-300">
                                {nav.paper.content || "No transcript/summary details available. Ask the study assistant or open the file above."}
                              </p>
                            </div>
                            {/* Progress Indicator - Fake gamified element */}
                            <div className="mt-12 pt-8 border-t border-dashed border-stone-200 dark:border-slate-800 flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full border-4 border-accent-green border-r-transparent animate-spin-slow" />
                                  <div>
                                     <p className="text-xs font-black uppercase tracking-widest text-accent-green">Focus Session</p>
                                     <p className="text-sm font-bold opacity-60">12:45 remaining</p>
                                  </div>
                               </div>
                               <div className="bg-accent-olive/10 text-accent-olive px-4 py-2 rounded-xl border border-accent-olive/20 flex items-center gap-2">
                                  <Bot size={16} />
                                  <span className="text-xs font-bold font-mono">STREAK: 14D</span>
                                </div>
                                <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-xl border border-secondary/20 flex items-center gap-2">
                                  <Sparkles size={16} />
                                  <span className="text-xs font-bold font-mono">LVL 42</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* AI Chatbot Column */}
                  <div className={`w-full lg:w-[450px] flex flex-col rounded-[40px] border overflow-hidden shadow-2xl transition-colors ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-stone-200"}`}>
                    <div className={`bg-primary p-6 text-white flex items-center justify-between ${isDarkMode ? "bg-slate-950" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md shadow-inner">
                          <Bot size={22} className="text-accent-green" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none opacity-60">Personal Tutor</p>
                          <p className="text-base font-bold mt-1">Study Assistant</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <Sparkles size={14} className="text-yellow-400" />
                        <span className="text-[10px] font-bold">GPT-Ready</span>
                      </div>
                    </div>

                    <div 
                      ref={scrollRef}
                      className={`flex-1 p-6 overflow-y-auto flex flex-col gap-5 ${isDarkMode ? "bg-slate-900/50" : "bg-[#fbfcfa]"}`}
                    >
                      {chatMessages.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <div className={`p-8 rounded-full mb-8 transition-colors ${isDarkMode ? "bg-slate-800 text-accent-green" : "bg-stone-100 text-secondary"}`}>
                            <MessageSquare size={48} className="opacity-30" />
                          </div>
                          <h4 className="font-serif text-2xl font-bold mb-3 text-primary">Academic Support</h4>
                          <p className="text-sm opacity-60 leading-[1.6] max-w-[240px]">
                            I've analyzed this paper. Would you like a breakdown of the key concepts?
                          </p>
                          <div className="mt-10 flex flex-col gap-3 w-full">
                            {["Summarize the main points", "Analyze question 2", "Test my knowledge"].map((hint, i) => (
                              <motion.button 
                                key={hint}
                                whileHover={{ scale: 1.02, x: 5 }}
                                onClick={() => { setInputValue(hint); }}
                                className={`text-xs text-left p-4 rounded-2xl border transition-all ${
                                  isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:border-accent-green" : "bg-white border-stone-100 text-primary hover:border-primary hover:shadow-md"
                                }`}
                              >
                                {hint}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`max-w-[85%] p-5 rounded-3xl text-sm leading-[1.6] shadow-sm ${
                            msg.role === "user" 
                              ? "bg-primary text-white ml-auto rounded-tr-none shadow-primary/20" 
                              : isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200 mr-auto rounded-tl-none shadow-none" : "bg-stone-50 border border-stone-100 text-stone-800 mr-auto rounded-tl-none"
                          }`}
                        >
                          {msg.text}
                        </motion.div>
                      ))}
                      {isTyping && (
                        <div className={`p-5 rounded-3xl mr-auto flex gap-2 items-center ${isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-stone-50 border border-stone-100 shadow-sm"}`}>
                          <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" />
                        </div>
                      )}
                    </div>

                    <div className={`p-6 border-t ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-50"}`}>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          placeholder="Type your study question..."
                          className={`w-full rounded-[24px] py-5 pl-7 pr-16 text-sm transition-all focus:outline-none focus:ring-4 ${
                            isDarkMode 
                              ? "bg-slate-800 border-slate-700 text-white focus:ring-accent-green/10 focus:border-accent-green" 
                              : "bg-stone-50 border-stone-100 text-stone-900 focus:ring-primary/10 focus:border-primary focus:bg-white"
                          }`}
                        />
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={sendMessage}
                          className="absolute right-3 top-3 p-3 bg-accent-green text-slate-900 rounded-2xl hover:brightness-110 transition-all shadow-lg disabled:opacity-50"
                          disabled={isTyping}
                        >
                          <Send size={20} />
                        </motion.button>
                      </div>
                      <p className="mt-4 text-[10px] text-center opacity-40 font-bold uppercase tracking-widest italic">Encrypted Study Channel</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 px-12 border-t border-gray-50 text-center">
         <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-gray-100 p-1.5 rounded-lg text-gray-400">
              <GraduationCap size={16} />
            </div>
            <span className="font-serif font-bold text-gray-400 tracking-tight">PastPaper</span>
         </div>
         <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            <button className="hover:text-primary transition-colors">Resources</button>
            <button className="hover:text-primary transition-colors">About Us</button>
            <button className="hover:text-primary transition-colors">Privacy</button>
         </div>
         <p className="mt-8 text-[10px] text-gray-400 font-medium">© 2026 Past Paper Hub</p>
         
          {/* Admin Link for testing - in real world this would be more secure */}
          {!isAdmin && user && user.email === "sumeyaferejo@gmail.com" && (
            <button 
              onClick={handleBecomeAdmin}
              className="mt-4 text-[10px] text-primary font-bold uppercase tracking-widest hover:underline"
            >
              Become Administrator
            </button>
          )}
          {!isAdmin && user && user.email !== "sumeyaferejo@gmail.com" && (
            <p className="mt-4 text-[10px] text-stone-400 opacity-50 cursor-help" title="Contact the owner to be promoted to administrator.">Administrator role required for upload privileges.</p>
          )}
      </footer>

      {/* Auth Error Guidance Modal */}
      <AnimatePresence>
        {authError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className={`w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden p-8 ${isDarkMode ? "bg-slate-900 border border-slate-800 text-white" : "bg-white text-stone-900"}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold">Sign-In Failed</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Authentication Assistance</p>
                </div>
              </div>

              <div className="space-y-4">
                {authError.code === "auth/unauthorized-domain" ? (
                  <>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-mono font-semibold">
                      Error: auth/unauthorized-domain
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed">
                      Your deployed site's domain <strong className="text-primary">{authError.domain}</strong> needs to be registered with Firebase to enable Google Sign-In.
                    </p>
                    <div className={`p-5 rounded-2xl text-xs space-y-3 leading-relaxed ${isDarkMode ? "bg-slate-950/50" : "bg-stone-50"}`}>
                      <p className="font-bold uppercase tracking-wider text-[10px] opacity-60">Step-by-step connection guide:</p>
                      <ol className="list-decimal list-inside space-y-2 opacity-90">
                        <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-primary underline font-semibold">Firebase Console</a>.</li>
                        <li>Select your connected Firebase Project.</li>
                        <li>Navigate to <strong className="font-semibold">Authentication</strong> &gt; <strong className="font-semibold">Settings</strong> tab.</li>
                        <li>Scroll down to the <strong className="font-semibold">Authorized domains</strong> section.</li>
                        <li>Click <strong className="font-semibold">Add domain</strong> and paste: <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">{authError.domain}</code></li>
                        <li>Save the domain and reload this page to sign in successfully!</li>
                      </ol>
                    </div>
                  </>
                ) : authError.code === "auth/popup-blocked" ? (
                  <>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-mono font-semibold">
                      Error: auth/popup-blocked
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed">
                      Your browser blocked the sign-in popup. Please enable popup windows for this site in your browser settings and try again.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm opacity-80 leading-relaxed">
                      {authError.message}
                    </p>
                    <div className="p-4 bg-stone-100 dark:bg-slate-950/50 rounded-2xl text-xs font-mono opacity-80 break-all">
                      Code: {authError.code}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => setAuthError(null)}
                  className="w-full py-4 rounded-full bg-primary text-white font-bold hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Dismiss & Try Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Upload Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? "bg-slate-900 border border-slate-800" : "bg-white"}`}
            >
              <div className={`p-8 border-b flex items-center justify-between ${isDarkMode ? "bg-slate-950/50 border-slate-800" : "bg-stone-50 border-stone-100"}`}>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold">Paper Contributor Hub</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Admin Resource Upload</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   {isAdmin && (
                     <div className={`flex p-1 rounded-full border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-stone-100 border-stone-200"}`}>
                        <button 
                          onClick={() => setAdminTab('upload')}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === 'upload' ? "bg-primary text-white shadow-md" : "opacity-50 hover:opacity-100"}`}
                        >
                          Upload
                        </button>
                        <button 
                          onClick={() => setAdminTab('users')}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === 'users' ? "bg-primary text-white shadow-md" : "opacity-50 hover:opacity-100"}`}
                        >
                          Users
                        </button>
                     </div>
                   )}
                   <button 
                     onClick={() => setShowAdminPanel(false)}
                     className={`p-2 rounded-full transition-colors ${isDarkMode ? "hover:bg-slate-800" : "hover:bg-stone-200"}`}
                   >
                     <X size={20} />
                   </button>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                {adminTab === 'upload' ? (
                  <>
                    {uploadStatus.type === 'success' && (
                      <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-3xl flex items-center gap-3">
                        <Check size={20} />
                        <span className="font-bold text-sm">{uploadStatus.message}</span>
                      </div>
                    )}
                    {uploadStatus.type === 'loading' && (
                      <div className="mb-8 p-4 bg-primary/10 border border-primary/20 text-primary rounded-3xl flex items-center gap-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                        <span className="font-bold text-sm">{uploadStatus.message || 'Processing...'}</span>
                      </div>
                    )}
                    {uploadStatus.type === 'error' && (
                      <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="font-bold text-sm">{uploadStatus.message}</span>
                      </div>
                    )}

                    <form onSubmit={handleUploadPaper} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Paper Title</label>
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. Math Final - Grade 12"
                            className={`w-full p-4 rounded-3xl border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"}`}
                            value={uploadForm.title}
                            onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">School</label>
                           <select 
                             required
                             className={`w-full p-4 rounded-3xl border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"}`}
                             value={uploadForm.schoolId}
                             onChange={e => setUploadForm(p => ({ ...p, schoolId: e.target.value }))}
                           >
                             <option value="">Select School</option>
                             {MOCK_SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                           </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Grade</label>
                           <select 
                             required
                             className={`w-full p-4 rounded-3xl border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"}`}
                             value={uploadForm.grade}
                             onChange={e => setUploadForm(p => ({ ...p, grade: e.target.value }))}
                           >
                             <option value="">Select Grade</option>
                             {[9,10,11,12].map(g => <option key={g} value={g.toString()}>{g}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Subject</label>
                           <select 
                             required
                             className={`w-full p-4 rounded-3xl border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"}`}
                             value={uploadForm.subject}
                             onChange={e => setUploadForm(p => ({ ...p, subject: e.target.value }))}
                           >
                             <option value="">Select Subject</option>
                             {["Math", "Physics", "Biology", "Chemistry", "Economics", "Geography", "History", "English"].map(subj => (
                               <option key={subj} value={subj}>{subj}</option>
                             ))}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Category</label>
                           <select 
                             required
                             className={`w-full p-4 rounded-3xl border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"}`}
                             value={uploadForm.category}
                             onChange={e => setUploadForm(p => ({ ...p, category: e.target.value as Category }))}
                           >
                             <option value="Periodically">Periodically</option>
                             <option value="Topically">Topically</option>
                           </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Option A: Upload Document (PDF/DOCX)</label>
                           <div className="relative group/upload">
                             <input 
                               type="file" 
                               accept=".pdf,.docx,.doc"
                               className="hidden" 
                               id="file-upload"
                               onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                               disabled={!!uploadForm.externalFileUrl}
                             />
                             <label 
                               htmlFor="file-upload"
                               className={`w-full p-4 rounded-3xl border border-dashed transition-all flex items-center justify-center gap-3 cursor-pointer ${
                                 uploadForm.externalFileUrl
                                   ? "opacity-40 cursor-not-allowed bg-stone-100 dark:bg-slate-950/20 border-stone-200 dark:border-slate-800"
                                   : selectedFile 
                                     ? "border-primary bg-primary/5 text-primary" 
                                     : isDarkMode ? "bg-slate-800 border-slate-700 hover:border-accent-green" : "bg-stone-50 border-stone-200 hover:border-primary"
                               }`}
                             >
                               {selectedFile ? <Check size={18} /> : <FileUp size={18} />}
                               <span className="text-sm font-medium truncate max-w-[200px]">
                                 {selectedFile ? selectedFile.name : "Choose PDF or DOCX"}
                               </span>
                             </label>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Option B: Direct File / Drive URL (Fallback)</label>
                           <input 
                             type="url" 
                             placeholder="e.g. https://domain.com/filepath.pdf"
                             className={`w-full p-4 rounded-3xl border transition-all ${
                               selectedFile 
                                 ? "opacity-40 cursor-not-allowed bg-stone-100 dark:bg-slate-950/20 border-stone-200 dark:border-slate-800" 
                                 : isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"
                             }`}
                             value={uploadForm.externalFileUrl}
                             onChange={e => setUploadForm(p => ({ ...p, externalFileUrl: e.target.value }))}
                             disabled={!!selectedFile}
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Unit # (Optional)</label>
                           <input 
                             type="text" 
                             placeholder="e.g. 1"
                             className={`w-full p-4 rounded-3xl border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"}`}
                             value={uploadForm.unitNumber}
                             onChange={e => setUploadForm(p => ({ ...p, unitNumber: e.target.value }))}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Year (Optional)</label>
                           <input 
                             type="text" 
                             placeholder="e.g. 2024"
                             className={`w-full p-4 rounded-3xl border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"}`}
                             value={uploadForm.year}
                             onChange={e => setUploadForm(p => ({ ...p, year: e.target.value }))}
                           />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Short Description (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="Briefly describe this chapter or unit..."
                          className={`w-full p-4 rounded-3xl border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"}`}
                          value={uploadForm.description}
                          onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-4">Paper Summary (Text/Markdown) - Optional</label>
                        <textarea 
                          placeholder="Paste main questions or summary here (optional)..."
                          className={`w-full p-6 rounded-[32px] border transition-all min-h-[150px] font-serif italic ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-stone-50 border-stone-200"}`}
                          value={uploadForm.content}
                          onChange={e => setUploadForm(p => ({ ...p, content: e.target.value }))}
                        />
                      </div>

                      <button 
                        disabled={uploadStatus.type === 'loading'}
                        className={`w-full py-5 rounded-full font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${
                          uploadStatus.type === 'loading' 
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed" 
                            : "bg-primary text-white hover:brightness-110 active:scale-[0.98] shadow-primary/20"
                        }`}
                      >
                        {uploadStatus.type === 'loading' ? "Processing..." : "Publish to Library"}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="space-y-4">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="font-serif text-xl font-bold">User Directory</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">{users.length} Records found</p>
                     </div>
                     <div className="space-y-2">
                        {users.map(u => {
                          const isTargetAdmin = admins.some(a => a.uid === u.uid);
                          const isSelf = u.uid === user?.uid;
                          const isTargetSuper = u.email === "sumeyaferejo@gmail.com";

                          return (
                            <div key={u.uid} className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-stone-50 border-stone-100"}`}>
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden">
                                     {u.photoURL ? <img src={u.photoURL} alt="" /> : <User size={16} className="m-auto mt-2" />}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold">{u.displayName || "Unknown User"}</p>
                                     <p className="text-[10px] opacity-60 font-mono flex items-center gap-2">
                                       {u.email}
                                       {u.lastSeen && (
                                         <span className="opacity-40 italic">
                                            • seen {new Date(u.lastSeen.seconds * 1000).toLocaleDateString()}
                                         </span>
                                       )}
                                     </p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                  {isTargetAdmin && (
                                     <span className="text-[10px] font-black uppercase px-2 py-1 bg-accent-green/20 text-accent-green rounded-lg">Admin</span>
                                  )}
                                  {isSuperAdmin && !isSelf && !isTargetSuper && (
                                     <button 
                                       onClick={() => toggleAdmin(u)}
                                       className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                         isTargetAdmin ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-primary text-white hover:scale-105"
                                       }`}
                                     >
                                       {isTargetAdmin ? "Revoke" : "Promote"}
                                     </button>
                                  )}
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const AppWithBoundary = () => (
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);

export default AppWithBoundary;
