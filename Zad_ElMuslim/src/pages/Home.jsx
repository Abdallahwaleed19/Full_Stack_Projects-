import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import DailyPlanner from '../components/planner/DailyPlanner';
import HomeHero from '../components/home/HomeHero';
import DailyHadith from '../components/home/DailyHadith';
import PrayerTimesHome from '../components/prayer/PrayerTimesHome';
import { Map, Users, ArrowLeft } from 'lucide-react';

const Home = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();

    return (
        <div className="container animate-slide-down" style={{ paddingTop: '2rem' }}>
            <HomeHero />

            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <DailyHadith />
                
                {/* Islamic World Map Preview Card */}
                <Link 
                    to="/islamic-world-map" 
                    className="card world-map-preview-card" 
                    style={{ 
                        textDecoration: 'none', 
                        color: 'inherit', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1rem', 
                        padding: '1.5rem', 
                        transition: 'all 0.3s ease', 
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: 'var(--radius-md)', 
                            background: theme === 'ramadan' 
                                ? 'linear-gradient(135deg, var(--gold-main) 0%, var(--lantern) 100%)'
                                : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            flexShrink: 0 
                        }}>
                            <Map size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {lang === 'ar' ? 'عدد المسلمين حول العالم' : 'Muslims Around the World'}
                            </h3>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                                {lang === 'ar' ? 'استكشف خريطة العالم الإسلامي' : 'Explore the Islamic World Map'}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            color: theme === 'ramadan' ? 'var(--gold-main)' : 'var(--primary)', 
                            fontSize: '0.9rem', 
                            fontWeight: 500 
                        }}>
                            <Users size={16} />
                            <span>~2B {lang === 'ar' ? 'مسلم' : 'Muslims'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-sub)', fontSize: '0.85rem', transition: 'transform 0.3s ease' }}>
                            <span>{lang === 'ar' ? 'عرض الخريطة' : 'View Map'}</span>
                            <ArrowLeft size={16} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Prayer times under daily hadith */}
            <PrayerTimesHome />

            {/* Daily planner as table under prayer times */}
            <DailyPlanner />
        </div>
    );
};

export default Home;
