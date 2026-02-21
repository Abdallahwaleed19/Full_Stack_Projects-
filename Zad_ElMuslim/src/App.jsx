import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import { RadioProvider } from './context/RadioContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Quran from './pages/Quran/Quran';
import Adhkar from './pages/Adhkar/Adhkar';
import Qibla from './pages/Qibla/Qibla';
import Pillars from './pages/Pillars/Pillars';
import Sunnah from './pages/Sunnah/Sunnah';
import Discover from './pages/Discover/Discover';
import Reciters from './pages/Reciters/Reciters';
import Seerah from './pages/Seerah/Seerah';
import HijriCalendar from './pages/Calendar/HijriCalendar';
import Tasbeeh from './pages/Tasbeeh/Tasbeeh';
import IslamicWorldMap from './pages/IslamicWorldMap/IslamicWorldMap';
import Zakat from './pages/Zakat/Zakat';
import Wudu from './pages/Wudu/Wudu';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AudioProvider>
            <RadioProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="quran" element={<Quran />} />
                  <Route path="reciters" element={<Reciters />} />
                  <Route path="sunnah" element={<Sunnah />} />
                  <Route path="adhkar" element={<Adhkar />} />
                  <Route path="tasbeeh" element={<Tasbeeh />} />
                  <Route path="qibla" element={<Qibla />} />
                  <Route path="pillars" element={<Pillars />} />
                  <Route path="zakat" element={<Zakat />} />
                  <Route path="seerah" element={<Seerah />} />
                  <Route path="calendar" element={<HijriCalendar />} />
                  <Route path="islamic-world-map" element={<IslamicWorldMap />} />
                  <Route path="discover" element={<Discover />} />
                  <Route path="wudu" element={<Wudu />} />
                </Route>
              </Routes>
            </BrowserRouter>
            </RadioProvider>
          </AudioProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;