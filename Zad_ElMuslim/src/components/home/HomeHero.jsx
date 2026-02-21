import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Moon as MoonIcon, CloudMoon } from 'lucide-react';
import './HomeHero.css';

const HIJRI_DISPLAY = { ar: '٣ رمضان ١٤٤٧', en: '3 Ramadan 1447' };

const HomeHero = () => {
    const { theme } = useTheme();
    const { t, lang } = useLanguage();

    const [city, setCity] = useState('');
    const [maghribTime, setMaghribTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const hijriDateStr = HIJRI_DISPLAY[lang === 'ar' ? 'ar' : 'en'];

    useEffect(() => {
        if (!('geolocation' in navigator)) return;
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${lang}`);
                    const geoData = await geoRes.json();
                    setCity(geoData.city || geoData.locality || '');

                    const date = new Date();
                    const ptRes = await fetch(`https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${latitude}&longitude=${longitude}&method=5`);
                    const ptData = await ptRes.json();
                    const maghribStr = ptData.data.timings.Maghrib;
                    const [hours, mins] = maghribStr.split(':');
                    const maghribDate = new Date();
                    maghribDate.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0);
                    setMaghribTime(maghribDate);
                } catch (err) {
                    console.error("Error fetching location info", err);
                }
            },
            () => console.log("Geolocation permission denied")
        );
    }, [lang]);

    useEffect(() => {
        if (!maghribTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = maghribTime - now;

            if (diff > 0) {
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);

                setTimeLeft({
                    hours: h.toString().padStart(2, '0'),
                    minutes: m.toString().padStart(2, '0'),
                    seconds: s.toString().padStart(2, '0')
                });
            } else {
                setTimeLeft('PASSED');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [maghribTime]);

    return (
        <div className={`home-hero ${theme === 'ramadan' ? 'ramadan-hero' : ''}`}>
            {/* Background Decorations */}
            {theme === 'ramadan' && (
                <div className="hero-decorations pointer-events-none">
                    <CloudMoon className="bg-moon" size={120} strokeWidth={1} />
                </div>
            )}

            <div className="hero-content">
                <div className="hero-top-bar">
                    <span className="hijri-date">{hijriDateStr}</span>
                    {city && (
                        <span className="city-name">
                            <MapPin size={16} /> {city}
                        </span>
                    )}
                </div>

                <div className="hero-welcome text-center">
                    <h1 className="quran-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h1>
                    <p>{lang === 'ar' ? 'مرحباً بك في الصِّرَاطِ الْمُسْتَقِيمِ، رفيقك اليومي.' : 'Welcome to As-Sirat Al-Mustaqeem, your daily companion.'}</p>
                </div>

                {theme === 'ramadan' && maghribTime && (
                    <div className="iftar-countdown-widget card text-center">
                        <h3 style={{ color: 'var(--color-accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <MoonIcon size={20} /> {lang === 'ar' ? 'باقي على الإفطار' : 'Time until Iftar'}
                        </h3>

                        {timeLeft === 'PASSED' ? (
                            <div className="iftar-passed quran-text">
                                {lang === 'ar' ? 'تقبل الله صيامكم وطاعتكم' : 'May Allah accept your fast'}
                            </div>
                        ) : timeLeft ? (
                            <div className="timer-display" dir="ltr">
                                <div className="timer-box">
                                    <span className="time-val">{timeLeft.hours}</span>
                                    <span className="time-lbl">{lang === 'ar' ? 'ساعة' : 'Hrs'}</span>
                                </div>
                                <span className="timer-colon">:</span>
                                <div className="timer-box">
                                    <span className="time-val">{timeLeft.minutes}</span>
                                    <span className="time-lbl">{lang === 'ar' ? 'دقيقة' : 'Min'}</span>
                                </div>
                                <span className="timer-colon">:</span>
                                <div className="timer-box">
                                    <span className="time-val">{timeLeft.seconds}</span>
                                    <span className="time-lbl">{lang === 'ar' ? 'ثانية' : 'Sec'}</span>
                                </div>
                            </div>
                        ) : (
                            <div>...</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeHero;
