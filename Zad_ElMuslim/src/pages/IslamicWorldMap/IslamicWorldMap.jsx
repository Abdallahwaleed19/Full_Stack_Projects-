import React, { useState, useMemo } from 'react';
import { Globe, Users, TrendingUp, MapPin, Search, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import './IslamicWorldMap.css';

// Muslim population data (approximate, based on Pew Research & UN data)
const MUSLIM_COUNTRIES_DATA = [
    // Middle East
    { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia', muslimPop: 34000000, totalPop: 35000000, percentage: 97, capital: 'الرياض', region: 'Middle East' },
    { code: 'AE', nameAr: 'الإمارات', nameEn: 'UAE', muslimPop: 7600000, totalPop: 10000000, percentage: 76, capital: 'أبوظبي', region: 'Middle East' },
    { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', muslimPop: 95000000, totalPop: 104000000, percentage: 91, capital: 'القاهرة', region: 'Middle East' },
    { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', muslimPop: 40000000, totalPop: 41000000, percentage: 98, capital: 'بغداد', region: 'Middle East' },
    { code: 'IR', nameAr: 'إيران', nameEn: 'Iran', muslimPop: 82000000, totalPop: 85000000, percentage: 96, capital: 'طهران', region: 'Middle East' },
    { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', muslimPop: 10000000, totalPop: 11000000, percentage: 95, capital: 'عمان', region: 'Middle East' },
    { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', muslimPop: 4200000, totalPop: 4300000, percentage: 98, capital: 'الكويت', region: 'Middle East' },
    { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', muslimPop: 4000000, totalPop: 6800000, percentage: 59, capital: 'بيروت', region: 'Middle East' },
    { code: 'OM', nameAr: 'عُمان', nameEn: 'Oman', muslimPop: 3500000, totalPop: 4600000, percentage: 86, capital: 'مسقط', region: 'Middle East' },
    { code: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', muslimPop: 5000000, totalPop: 5200000, percentage: 96, capital: 'القدس', region: 'Middle East' },
    { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', muslimPop: 2600000, totalPop: 2900000, percentage: 90, capital: 'الدوحة', region: 'Middle East' },
    { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria', muslimPop: 20000000, totalPop: 21000000, percentage: 93, capital: 'دمشق', region: 'Middle East' },
    { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', muslimPop: 31000000, totalPop: 32000000, percentage: 99, capital: 'صنعاء', region: 'Middle East' },

    // Asia
    { code: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', muslimPop: 230000000, totalPop: 275000000, percentage: 87, capital: 'جاكرتا', region: 'Asia' },
    { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', muslimPop: 220000000, totalPop: 230000000, percentage: 96, capital: 'إسلام أباد', region: 'Asia' },
    { code: 'BD', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', muslimPop: 165000000, totalPop: 170000000, percentage: 91, capital: 'دكا', region: 'Asia' },
    { code: 'IN', nameAr: 'الهند', nameEn: 'India', muslimPop: 200000000, totalPop: 1400000000, percentage: 14, capital: 'نيودلهي', region: 'Asia' },
    { code: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia', muslimPop: 21000000, totalPop: 33000000, percentage: 64, capital: 'كوالالمبور', region: 'Asia' },
    { code: 'AF', nameAr: 'أفغانستان', nameEn: 'Afghanistan', muslimPop: 38000000, totalPop: 40000000, percentage: 99, capital: 'كابل', region: 'Asia' },
    { code: 'UZ', nameAr: 'أوزبكستان', nameEn: 'Uzbekistan', muslimPop: 30000000, totalPop: 34000000, percentage: 88, capital: 'طشقند', region: 'Asia' },
    { code: 'KZ', nameAr: 'كازاخستان', nameEn: 'Kazakhstan', muslimPop: 13000000, totalPop: 19000000, percentage: 70, capital: 'أستانا', region: 'Asia' },
    { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', muslimPop: 80000000, totalPop: 85000000, percentage: 99, capital: 'أنقرة', region: 'Asia' },

    // Africa
    { code: 'NG', nameAr: 'نيجيريا', nameEn: 'Nigeria', muslimPop: 100000000, totalPop: 220000000, percentage: 50, capital: 'أبوجا', region: 'Africa' },
    { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', muslimPop: 43000000, totalPop: 45000000, percentage: 99, capital: 'الجزائر', region: 'Africa' },
    { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', muslimPop: 36000000, totalPop: 37000000, percentage: 99, capital: 'الرباط', region: 'Africa' },
    { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan', muslimPop: 42000000, totalPop: 45000000, percentage: 91, capital: 'الخرطوم', region: 'Africa' },
    { code: 'ET', nameAr: 'إثيوبيا', nameEn: 'Ethiopia', muslimPop: 35000000, totalPop: 120000000, percentage: 34, capital: 'أديس أبابا', region: 'Africa' },
    { code: 'TZ', nameAr: 'تنزانيا', nameEn: 'Tanzania', muslimPop: 20000000, totalPop: 62000000, percentage: 35, capital: 'دودوما', region: 'Africa' },
    { code: 'KE', nameAr: 'كينيا', nameEn: 'Kenya', muslimPop: 11000000, totalPop: 55000000, percentage: 11, capital: 'نيروبي', region: 'Africa' },
    { code: 'UG', nameAr: 'أوغندا', nameEn: 'Uganda', muslimPop: 6000000, totalPop: 47000000, percentage: 14, capital: 'كامبالا', region: 'Africa' },
    { code: 'SN', nameAr: 'السنغال', nameEn: 'Senegal', muslimPop: 16000000, totalPop: 17000000, percentage: 96, capital: 'داكار', region: 'Africa' },
    { code: 'ML', nameAr: 'مالي', nameEn: 'Mali', muslimPop: 19000000, totalPop: 21000000, percentage: 95, capital: 'باماكو', region: 'Africa' },
    { code: 'NE', nameAr: 'النيجر', nameEn: 'Niger', muslimPop: 23000000, totalPop: 25000000, percentage: 99, capital: 'نيامي', region: 'Africa' },
    { code: 'TD', nameAr: 'تشاد', nameEn: 'Chad', muslimPop: 8000000, totalPop: 17000000, percentage: 53, capital: 'انجمينا', region: 'Africa' },
    { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', muslimPop: 6500000, totalPop: 7000000, percentage: 97, capital: 'طرابلس', region: 'Africa' },
    { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', muslimPop: 12000000, totalPop: 12000000, percentage: 99, capital: 'تونس', region: 'Africa' },

    // Europe
    { code: 'AL', nameAr: 'ألبانيا', nameEn: 'Albania', muslimPop: 2000000, totalPop: 2800000, percentage: 59, capital: 'تيرانا', region: 'Europe' },
    { code: 'BA', nameAr: 'البوسنة', nameEn: 'Bosnia', muslimPop: 2000000, totalPop: 3200000, percentage: 51, capital: 'سراييفو', region: 'Europe' },
    { code: 'XK', nameAr: 'كوسوفو', nameEn: 'Kosovo', muslimPop: 1900000, totalPop: 1900000, percentage: 95, capital: 'بريشتينا', region: 'Europe' },

    // Americas
    { code: 'US', nameAr: 'الولايات المتحدة', nameEn: 'United States', muslimPop: 4000000, totalPop: 330000000, percentage: 1, capital: 'واشنطن', region: 'Americas' },
    { code: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', muslimPop: 2000000, totalPop: 215000000, percentage: 1, capital: 'برازيليا', region: 'Americas' },
];

const IslamicWorldMap = () => {
    const { lang, t } = useLanguage();
    const { theme } = useTheme();
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRegion, setFilterRegion] = useState('all');

    // Calculate global statistics
    const globalStats = useMemo(() => {
        const totalMuslims = MUSLIM_COUNTRIES_DATA.reduce((sum, c) => sum + c.muslimPop, 0);
        const totalWorldPop = 8000000000; // Approximate world population
        const muslimPercentage = ((totalMuslims / totalWorldPop) * 100).toFixed(1);
        const muslimMajorityCountries = MUSLIM_COUNTRIES_DATA.filter(c => c.percentage >= 50).length;
        const largestMuslimCountry = MUSLIM_COUNTRIES_DATA.reduce((max, c) =>
            c.muslimPop > max.muslimPop ? c : max, MUSLIM_COUNTRIES_DATA[0]
        );

        return {
            totalMuslims,
            muslimPercentage,
            muslimMajorityCountries,
            largestMuslimCountry
        };
    }, []);

    // Filter countries
    const filteredCountries = useMemo(() => {
        return MUSLIM_COUNTRIES_DATA.filter(country => {
            const nameMatch = searchTerm === '' ||
                country.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                country.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
            const regionMatch = filterRegion === 'all' || country.region === filterRegion;
            return nameMatch && regionMatch;
        }).sort((a, b) => b.muslimPop - a.muslimPop);
    }, [searchTerm, filterRegion]);

    const formatNumber = (num) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getCountryColor = (percentage) => {
        if (percentage >= 90) return 'var(--primary, #0F5D4A)';
        if (percentage >= 50) return '#1F8A70';
        if (percentage >= 20) return '#4ADE80';
        return '#D1E3DA';
    };

    const regions = ['all', 'Middle East', 'Asia', 'Africa', 'Europe', 'Americas'];

    return (
        <div className="islamic-world-map-page animate-slide-down">
            {/* Hero Section */}
            <div className="islamic-map-hero card card-glass">
                <div className="islamic-map-hero-icon">
                    <Globe size={48} />
                </div>
                <div className="islamic-map-hero-text">
                    <h1 className="islamic-map-title">
                        {lang === 'ar' ? 'خريطة العالم الإسلامي' : 'Islamic World Map'}
                    </h1>
                    <p className="islamic-map-subtitle">
                        {lang === 'ar'
                            ? 'استكشف توزيع المسلمين حول العالم وتعرف على إحصائيات دقيقة عن الأمة الإسلامية'
                            : 'Explore the global distribution of Muslims and discover accurate statistics about the Islamic Ummah'}
                    </p>
                </div>
            </div>

            {/* Global Statistics Panel */}
            <div className="card global-stats-panel">
                <h2 className="global-stats-title">
                    {lang === 'ar' ? 'إحصائيات عالمية' : 'Global Statistics'}
                </h2>
                <div className="global-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Users size={32} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{formatNumber(globalStats.totalMuslims)}</div>
                            <div className="stat-label">{lang === 'ar' ? 'عدد المسلمين حول العالم' : 'Total Muslims Worldwide'}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <TrendingUp size={32} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{globalStats.muslimPercentage}%</div>
                            <div className="stat-label">{lang === 'ar' ? 'نسبة المسلمين من سكان العالم' : 'Percentage of World Population'}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Globe size={32} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{globalStats.muslimMajorityCountries}</div>
                            <div className="stat-label">{lang === 'ar' ? 'دولة ذات أغلبية مسلمة' : 'Muslim-Majority Countries'}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <MapPin size={32} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{lang === 'ar' ? globalStats.largestMuslimCountry.nameAr : globalStats.largestMuslimCountry.nameEn}</div>
                            <div className="stat-label">{lang === 'ar' ? 'أكبر دولة من حيث عدد المسلمين' : 'Largest Muslim Population'}</div>
                        </div>
                    </div>
                </div>
                <div className="last-updated">
                    {lang === 'ar' ? 'آخر تحديث: 2 رمضان 1447' : 'Last updated: 2 Ramadan 1447'}
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card map-controls">
                <div className="map-search-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder={lang === 'ar' ? 'ابحث عن دولة...' : 'Search for a country...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="map-search-input"
                    />
                </div>
                <div className="map-filters">
                    {regions.map(region => (
                        <button
                            key={region}
                            type="button"
                            className={`filter-pill ${filterRegion === region ? 'active' : ''}`}
                            onClick={() => setFilterRegion(region)}
                        >
                            {lang === 'ar'
                                ? (region === 'all' ? 'الكل' : region === 'Middle East' ? 'الشرق الأوسط' : region === 'Asia' ? 'آسيا' : region === 'Africa' ? 'أفريقيا' : region === 'Europe' ? 'أوروبا' : 'الأمريكتان')
                                : (region === 'all' ? 'All' : region)
                            }
                        </button>
                    ))}
                </div>
            </div>

            {/* Countries Grid */}
            <div className="countries-grid">
                {filteredCountries.map((country) => (
                    <div
                        key={country.code}
                        className={`country-card ${selectedCountry?.code === country.code ? 'selected' : ''}`}
                        onClick={() => setSelectedCountry(country)}
                        style={{
                            borderLeftColor: getCountryColor(country.percentage),
                        }}
                    >
                        <div className="country-card-header">
                            <h3 className="country-name">
                                {lang === 'ar' ? country.nameAr : country.nameEn}
                            </h3>
                            <span className="country-code">{country.code}</span>
                        </div>
                        <div className="country-stats">
                            <div className="country-stat-row">
                                <span className="stat-label-small">{lang === 'ar' ? 'عدد المسلمين:' : 'Muslims:'}</span>
                                <span className="stat-value-small">{formatNumber(country.muslimPop)}</span>
                            </div>
                            <div className="country-stat-row">
                                <span className="stat-label-small">{lang === 'ar' ? 'النسبة:' : 'Percentage:'}</span>
                                <span className="stat-value-small" style={{ color: getCountryColor(country.percentage) }}>
                                    {country.percentage}%
                                </span>
                            </div>
                            <div className="country-stat-row">
                                <span className="stat-label-small">{lang === 'ar' ? 'العاصمة:' : 'Capital:'}</span>
                                <span className="stat-value-small">{country.capital}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Country Details Modal */}
            {selectedCountry && (
                <div className="country-modal-overlay" onClick={() => setSelectedCountry(null)}>
                    <div className="country-modal card" onClick={(e) => e.stopPropagation()}>
                        <div className="country-modal-header">
                            <h2>{lang === 'ar' ? selectedCountry.nameAr : selectedCountry.nameEn}</h2>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setSelectedCountry(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="country-modal-content">
                            <div className="country-detail-section">
                                <Info size={20} />
                                <div>
                                    <h4>{lang === 'ar' ? 'معلومات عامة' : 'General Information'}</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">{lang === 'ar' ? 'العاصمة:' : 'Capital:'}</span>
                                            <span className="detail-value">{selectedCountry.capital}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">{lang === 'ar' ? 'المنطقة:' : 'Region:'}</span>
                                            <span className="detail-value">{selectedCountry.region}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="country-detail-section">
                                <Users size={20} />
                                <div>
                                    <h4>{lang === 'ar' ? 'السكان' : 'Population'}</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">{lang === 'ar' ? 'عدد المسلمين:' : 'Muslim Population:'}</span>
                                            <span className="detail-value highlight">{formatNumber(selectedCountry.muslimPop)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">{lang === 'ar' ? 'إجمالي السكان:' : 'Total Population:'}</span>
                                            <span className="detail-value">{formatNumber(selectedCountry.totalPop)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">{lang === 'ar' ? 'نسبة المسلمين:' : 'Muslim Percentage:'}</span>
                                            <span className="detail-value" style={{ color: getCountryColor(selectedCountry.percentage) }}>
                                                {selectedCountry.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IslamicWorldMap;
