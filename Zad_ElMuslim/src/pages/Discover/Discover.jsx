import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useRadio } from '../../context/RadioContext';
import { Radio, BookOpen, Calendar as CalendarIcon, Play, Pause, Sparkles, ArrowLeft, Map, Coins, Droplets } from 'lucide-react';
import './Discover.css';

const Discover = () => {
    const { lang } = useLanguage();
    const { isActive: isRadioActive, isPlaying: isPlayingRadio, radioError, startRadio, togglePlayPause } = useRadio();

    const toggleRadio = () => {
        if (isPlayingRadio) {
            togglePlayPause();
        } else if (!isRadioActive) {
            startRadio();
        } else {
            togglePlayPause();
        }
    };

    return (
        <div className="discover-page animate-slide-down">
            {/* Hero Section */}
            <div className="discover-hero">
                <div className="discover-hero-bg"></div>
                <div className="discover-hero-content container">
                    <div className="discover-hero-icon">
                        <Sparkles size={40} />
                    </div>
                    <h1 className="discover-hero-title">
                        {lang === 'ar' ? 'المزيد - استكشف' : 'Discover More'}
                    </h1>
                    <p className="discover-hero-subtitle">
                        {lang === 'ar' ? 'اكتشف المزيد من الميزات والمحتوى الإسلامي' : 'Explore more Islamic features and content'}
                    </p>
                </div>
            </div>

            <div className="container discover-container">
                <div className="discover-grid">
                    {/* 1. Quran Radio */}
                    <div className="discover-card radio-card">
                        <div className="card-icon radio-icon">
                            <Radio size={32} />
                            {isPlayingRadio && <div className="radio-waves"></div>}
                        </div>
                        <div className="card-content">
                            <h2>{lang === 'ar' ? 'إذاعة القرآن الكريم' : 'Quran Radio (Cairo)'}</h2>
                            <p>
                                {lang === 'ar'
                                    ? 'استمع إلى البث المباشر لإذاعة القرآن الكريم من القاهرة على مدار الساعة.'
                                    : 'Listen to the live broadcast of Quran Radio from Cairo 24/7.'}
                            </p>
                        </div>
                        {radioError && (
                            <p className="radio-error-msg">
                                {lang === 'ar' ? 'تعذّر تشغيل البث. جرّب مرة أخرى أو تحقق من الاتصال.' : 'Could not play stream. Try again or check your connection.'}
                            </p>
                        )}
                        <button
                            onClick={toggleRadio}
                            className={`radio-play-btn ${isPlayingRadio ? 'playing' : ''}`}
                        >
                            {isPlayingRadio ? <Pause size={24} /> : <Play size={24} />}
                            <span>{lang === 'ar' ? (isPlayingRadio ? 'إيقاف' : 'تشغيل') : (isPlayingRadio ? 'Stop' : 'Play')}</span>
                        </button>
                    </div>

                    {/* 2. Seerah Section */}
                    <Link to="/seerah" className="discover-card seerah-card">
                        <div className="card-icon seerah-icon">
                            <BookOpen size={32} />
                        </div>
                        <div className="card-content">
                            <h2>{lang === 'ar' ? 'السيرة النبوية' : 'Seerah (Prophetic Biography)'}</h2>
                            <p>
                                {lang === 'ar'
                                    ? 'انطلق في رحلة عبر المحطات الرئيسية في حياة محمد ﷺ والغزوات الفاصلة.'
                                    : 'Embark on a journey through the key milestones of Muhammad ﷺ life and pivotal battles.'}
                            </p>
                        </div>
                        <div className="card-cta">
                            <span>{lang === 'ar' ? 'تصفح السيرة' : 'Explore'}</span>
                            <ArrowLeft size={18} className="cta-arrow" />
                        </div>
                    </Link>

                    {/* 3. Islamic Calendar */}
                    <Link to="/calendar" className="discover-card calendar-card">
                        <div className="card-icon calendar-icon">
                            <CalendarIcon size={32} />
                        </div>
                        <div className="card-content">
                            <h2>{lang === 'ar' ? 'التقويم الهجري' : 'Hijri Calendar'}</h2>
                            <p>
                                {lang === 'ar'
                                    ? 'تصفح التقويم الهجري التفاعلي وتعرف على المناسبات الإسلامية الهامة.'
                                    : 'Browse the interactive Hijri calendar and learn about important Islamic occasions.'}
                            </p>
                        </div>
                        <div className="card-cta">
                            <span>{lang === 'ar' ? 'عرض التقويم' : 'View Calendar'}</span>
                            <ArrowLeft size={18} className="cta-arrow" />
                        </div>
                    </Link>

                    {/* 4. Zakat */}
                    <Link to="/zakat" className="discover-card zakat-card">
                        <div className="card-icon zakat-icon">
                            <Coins size={32} />
                        </div>
                        <div className="card-content">
                            <h2>{lang === 'ar' ? 'الزكاة' : 'Zakat'}</h2>
                            <p>
                                {lang === 'ar'
                                    ? 'شرح مبسط وحاسبة زكاة لمصر حسب أسعار الذهب والفضة.'
                                    : 'Simple guide and Zakat calculator for Egypt based on gold and silver prices.'}
                            </p>
                        </div>
                        <div className="card-cta">
                            <span>{lang === 'ar' ? 'حساب الزكاة' : 'Calculate'}</span>
                            <ArrowLeft size={18} className="cta-arrow" />
                        </div>
                    </Link>

                    {/* 5. Wudu (Ablution) */}
                    <Link to="/wudu" className="discover-card wudu-card">
                        <div className="card-icon wudu-icon">
                            <Droplets size={32} />
                        </div>
                        <div className="card-content">
                            <h2>{lang === 'ar' ? 'أحكام الوضوء' : 'Rules of Wudu'}</h2>
                            <p>
                                {lang === 'ar'
                                    ? 'فروض الوضوء وسننه وما يبطله من السنة النبوية.'
                                    : 'Obligatory acts, sunnah, and what invalidates ablution.'}
                            </p>
                        </div>
                        <div className="card-cta">
                            <span>{lang === 'ar' ? 'عرض الأحكام' : 'View Rules'}</span>
                            <ArrowLeft size={18} className="cta-arrow" />
                        </div>
                    </Link>

                    {/* 6. Islamic World Map */}
                    <Link to="/islamic-world-map" className="discover-card world-map-card">
                        <div className="card-icon world-map-icon">
                            <Map size={32} />
                        </div>
                        <div className="card-content">
                            <h2>{lang === 'ar' ? 'خريطة العالم الإسلامي' : 'Islamic World Map'}</h2>
                            <p>
                                {lang === 'ar'
                                    ? 'استكشف توزيع المسلمين حول العالم وتعرف على إحصائيات دقيقة عن الأمة الإسلامية.'
                                    : 'Explore the global distribution of Muslims and discover accurate statistics about the Islamic Ummah.'}
                            </p>
                        </div>
                        <div className="card-cta">
                            <span>{lang === 'ar' ? 'عرض الخريطة' : 'View Map'}</span>
                            <ArrowLeft size={18} className="cta-arrow" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Discover;
