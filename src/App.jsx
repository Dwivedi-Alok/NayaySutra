import { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Layout          from './Layout';               // ⬅ contains <Navbar/>
import HeroSection     from './components/HeroSection';
import KeyFeatures     from './components/KeyFeatures';
import LoadingSpinner  from './components/LoadingSpinner';
import AskQuestion     from './components/AskQuestion';
import ConnectLawyer   from './components/ConnectLawyer';
import Multilingual    from './components/MultilingualSupport';
import OfflineHelp     from './components/OfflineHelp';
import LegalLearning   from './components/LegalLearning';

/* --------------- Code-split heavy pages --------------- */
const DocumentGenerator = lazy(() => import('./components/DocumentGenerator'));
const LegalChatbot      = lazy(() => import('./components/LegalChatbot'));

/* --------------- Navbar-referenced stubs --------------- */
const Community    = lazy(() => import('./components/Community'));        // simple stub ok
const Contact      = lazy(() => import('./components/Contact'));          // simple stub ok
const FeaturesPage = lazy(() => import('./components/FeaturesPage'));     // exports <KeyFeatures/>

/* ---------------  NEW:  Auth pages  --------------- */
const Login  = lazy(() => import('./components/Login'));        // ← NEW
const Signup = lazy(() => import('./components/Signup'));       // ← NEW

/* 404 fallback */
const NotFound = lazy(() => import('./components/NotFound'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen  bg-[#06070f]">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* ───────────── Home ───────────── */}
            <Route
              path="/"
              element={
                <Layout title="Home">
                  <HeroSection />
                  <KeyFeatures />
                </Layout>
              }
            />

            {/* ───────────── Features page ───────────── */}
            <Route
              path="/features"
              element={
                <Layout title="Key Features">
                  <FeaturesPage />
                </Layout>
              }
            />

            {/* ───────────── Chatbot ───────────── */}
            <Route
              path="/chatbot"
              element={
                <Layout title="Legal Chatbot">
                  <LegalChatbot />
                </Layout>
              }
            />

            {/* ───────────── Document Generator ───────────── */}
            <Route
              path="/generate-document"
              element={
                <Layout title="Generate Document">
                  <DocumentGenerator />
                </Layout>
              }
            />

            {/* ───────────── Learn Law ───────────── */}
            <Route
              path="/learn-law"
              element={
                <Layout title="Learn Law">
                  <LegalLearning />
                </Layout>
              }
            />

            {/* ───────────── Multilingual demo ───────────── */}
            <Route
              path="/multilingual"
              element={
                <Layout title="Multilingual Support">
                  <Multilingual />
                </Layout>
              }
            />

            {/* ───────────── Get Help ───────────── */}
            <Route
              path="/help"
              element={
                <Layout title="Get Help">
                  <OfflineHelp />
                </Layout>
              }
            />

            {/* ───────────── Community & Contact ───────────── */}
            <Route
              path="/community"
              element={
                <Layout title="Community">
                  <Community />
                </Layout>
              }
            />
            <Route
              path="/contact"
              element={
                <Layout title="Contact Us">
                  <Contact />
                </Layout>
              }
            />

            {/* ───────────── Auth pages (NEW) ───────────── */}
            <Route                                      
              path="/login"                              
              element={                                  
                <Layout title="Login">                   
                  <Login />                              
                </Layout>                                
              }                                          
            />                                           

            <Route                                      
              path="/signup"                             
              element={                                  
                <Layout title="Sign Up">                 
                  <Signup />                             
                </Layout>                                
              }                                          
            />                                           

            {/* ───────────── Other feature routes ───────────── */}
            <Route
              path="/ask-question"
              element={
                <Layout title="Ask Question">
                  <AskQuestion />
                </Layout>
              }
            />
            <Route
              path="/connect-lawyer"
              element={
                <Layout title="Connect Lawyer">
                  <ConnectLawyer />
                </Layout>
              }
            />

            {/* ───────────── Legacy redirect ───────────── */}
            <Route path="/home" element={<Navigate to="/" replace />} />

            {/* ───────────── 404 fallback ───────────── */}
            <Route
              path="*"
              element={
                <Layout title="404 Not Found">
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}