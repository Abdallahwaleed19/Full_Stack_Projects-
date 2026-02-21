import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Bookmark, BookOpen, X, Info, Settings } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TAFSIR_SOURCES = [
    { id: 'ar.muyassar', name: 'التفسير الميسر', lang: 'ar' },
    { id: 'ar.jalalayn', name: 'تفسير الجلالين', lang: 'ar' },
    { id: 'en.asad', name: 'Translation (Asad)', lang: 'en' },
    { id: 'en.sahih', name: 'Translation (Sahih Int.)', lang: 'en' }
];

const QuranReader = ({ startPage = 1, surahNumber = null, onClose }) => {
    const { lang, t } = useLanguage();
    const [page, setPage] = useState(startPage);
    const [pageData, setPageData] = useState(null);
    const [tafsirData, setTafsirData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTafsir, setShowTafsir] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Default tafsir based on language
    const [tafsirSource, setTafsirSource] = useState(() => lang === 'ar' ? 'ar.muyassar' : 'en.asad');

    // Resolve starting page if surahNumber is provided instead of startPage
    useEffect(() => {
        if (surahNumber) {
            setLoading(true);
            fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
                .then(res => res.json())
                .then(data => {
                    const firstPage = data.data.ayahs[0].page;
                    setPage(firstPage);
                })
                .catch(err => console.error(err));
        }
    }, [surahNumber]);

    // Fetch Page Data and Tafsir
    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                // Fetch Quran Text (Uthmani)
                const qRes = await fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`);
                const qData = await qRes.json();
                setPageData(qData.data);

                // Fetch Selected Tafsir
                const tRes = await fetch(`https://api.alquran.cloud/v1/page/${page}/${tafsirSource}`);
                const tData = await tRes.json();
                setTafsirData(tData.data);

                // Check Bookmark
                const saved = JSON.parse(localStorage.getItem('zad_bookmarks') || '[]');
                setIsBookmarked(saved.includes(page));

            } catch (err) {
                console.error('Error fetching page', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [page, tafsirSource, lang]);

    const toggleBookmark = () => {
        let saved = JSON.parse(localStorage.getItem('zad_bookmarks') || '[]');
        if (isBookmarked) {
            saved = saved.filter(p => p !== page);
            setIsBookmarked(false);
        } else {
            saved.push(page);
            setIsBookmarked(true);
        }
        localStorage.setItem('zad_bookmarks', JSON.stringify(saved));
    };

    const convertToArabicNumber = (n) => {
        return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    };

    if (loading && !pageData) {
        return (
            <div className="card text-center" style={{ padding: '3rem' }}>
                <p>{lang === 'ar' ? 'جاري تحميل الصفحة...' : 'Loading Page...'}</p>
            </div>
        );
    }

    return (
        <div className="quran-reader-container animate-slide-down">
            {/* Toolbar */}
            <div className="reader-toolbar flex justify-between items-center card" style={{ padding: '1rem', marginBottom: '1.5rem', position: 'sticky', top: '70px', zIndex: 10 }}>
                <div className="flex gap-2 items-center">
                    <button onClick={onClose} className="btn btn-outline flex items-center justify-center p-2 rounded-full" title={lang === 'ar' ? 'إغلاق القارئ' : 'Close Reader'}>
                        <X size={18} />
                    </button>
                    <span style={{ fontWeight: 'bold' }}>
                        {lang === 'ar' ? 'صفحة' : 'Page'} {page}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowTafsir(!showTafsir)}
                        className={`btn ${showTafsir ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}
                    >
                        <Info size={16} /> <span className="hidden-mobile">{lang === 'ar' ? 'التفسير' : 'Tafsir'}</span>
                    </button>
                    <button
                        onClick={toggleBookmark}
                        className="btn btn-outline flex items-center justify-center p-2 rounded-full"
                        style={{ color: isBookmarked ? 'var(--color-primary)' : 'inherit', borderColor: isBookmarked ? 'var(--color-primary)' : 'inherit' }}
                        title={lang === 'ar' ? 'حفظ العلامة' : 'Bookmark'}
                    >
                        <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className={`reader-content-grid ${showTafsir ? 'showing-tafsir' : ''}`} style={{ display: 'grid', gridTemplateColumns: showTafsir ? '1fr 1fr' : '1fr', gap: '2rem' }}>

                {/* Mushaf View */}
                <div className="card mushaf-page" style={{ padding: '2rem', textAlign: 'justify', direction: 'rtl' }}>

                    {pageData && pageData.ayahs.map((ayah, idx) => {
                        const isFirstInSurah = ayah.numberInSurah === 1;
                        let text = ayah.text;

                        // Handle Bismillah (usually part of Surah 1, or prepended to others)
                        let bismillah = null;
                        if (isFirstInSurah && ayah.surah.number !== 1 && ayah.surah.number !== 9) {
                            bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
                            text = text.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").trim();
                        }

                        return (
                            <React.Fragment key={ayah.number}>
                                {isFirstInSurah && (
                                    <div className="surah-header text-center" style={{ margin: '2rem 0', padding: '1rem', borderTop: '2px solid var(--color-primary)', borderBottom: '2px solid var(--color-primary)' }}>
                                        <h2 className="quran-text" style={{ fontSize: '1.8rem', color: 'var(--color-primary)', margin: 0 }}>
                                            سُورَةُ {ayah.surah.name.replace('سُورَةُ ', '')}
                                        </h2>
                                        {bismillah && <div className="quran-text text-center" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>{bismillah}</div>}
                                    </div>
                                )}
                                <span className="quran-text" style={{ fontSize: '1.8rem', lineHeight: '2.5' }}>
                                    {text}{' '}
                                    <span className="ayah-end-badge">
                                        {convertToArabicNumber(ayah.numberInSurah)}
                                    </span>
                                </span>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Tafsir View */}
                {showTafsir && (
                    <div className="card tafsir-page" style={{ padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-border pb-4">
                            <h3 style={{ margin: 0, color: 'var(--color-primary)' }} className="flex items-center gap-2">
                                <BookOpen size={20} />
                                {lang === 'ar' ? 'التفسير / الترجمة' : 'Tafsir / Translation'}
                            </h3>
                            <select
                                value={tafsirSource}
                                onChange={(e) => setTafsirSource(e.target.value)}
                                className="form-control text-sm bg-surface rounded-md border border-border p-2 focus:border-primary transition outline-none"
                            >
                                {TAFSIR_SOURCES.filter(s => s.lang === lang).map(source => (
                                    <option key={source.id} value={source.id}>
                                        {source.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {tafsirData && tafsirData.ayahs.map((ayah) => (
                            <div key={`tafsir-${ayah.number}`} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: '8px', borderRight: '4px solid var(--color-primary)' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                                    ({ayah.surah.name} - الآية {convertToArabicNumber(ayah.numberInSurah)}):
                                </div>
                                <div style={{ lineHeight: '1.8' }} className="text-foreground">
                                    {ayah.text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls flex justify-center items-center gap-4" style={{ marginTop: '2rem' }}>
                <button
                    onClick={() => setPage(p => Math.min(604, p + 1))}
                    disabled={page === 604}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <ChevronRight size={20} /> <span className="hidden-mobile">{lang === 'ar' ? 'الصفحة التالية' : 'Next Page'}</span>
                </button>
                <div className="progress-indicator flex-1 card" style={{ height: '8px', padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(page / 604) * 100}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.3s' }}></div>
                </div>
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <span className="hidden-mobile">{lang === 'ar' ? 'الصفحة السابقة' : 'Prev Page'}</span> <ChevronLeft size={20} />
                </button>
            </div>
            {/* Added for css targeting mobile layout */}
            <style>{`
                @media (max-width: 768px) {
                    .reader-content-grid.showing-tafsir {
                        grid-template-columns: 1fr !important;
                    }
                    .hidden-mobile { display: none; }
                }
            `}</style>
        </div>
    );
};

export default QuranReader;
