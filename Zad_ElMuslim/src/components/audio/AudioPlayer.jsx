import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLanguage } from '../../context/LanguageContext';
import { SURAH_NAMES_VOWELLED } from '../../data/surahNamesVowelled';
import './AudioPlayer.css';

const AudioPlayer = () => {
    const { currentSurah, isPlaying, togglePlay, stopPlay, currentReciter } = useAudio();
    const { lang } = useLanguage();

    if (!currentSurah) return null;

    const surahLabel = lang === 'ar' ? 'سورة' : 'Surah';
    const name = (currentSurah.name || '').trim();
    const nameAlreadyHasSurah = name.startsWith('سورة') || name.startsWith('Surah');
    const defaultDisplay = nameAlreadyHasSurah ? name : `${surahLabel} ${name}`;
    const surahDisplay =
        lang === 'ar' &&
        currentSurah.number >= 1 &&
        currentSurah.number <= 114 &&
        SURAH_NAMES_VOWELLED[currentSurah.number - 1]
            ? SURAH_NAMES_VOWELLED[currentSurah.number - 1]
            : defaultDisplay;
    const reciterName = lang === 'ar' ? currentReciter?.nameAr : currentReciter?.nameEn;

    return (
        <div className="audio-player-container">
            <div className="container audio-player-content">
                <div className="audio-player-info">
                    <img
                        src={currentReciter?.image || '/images/OIP.jpg'}
                        alt=""
                        className="audio-player-reciter-img"
                    />
                    <div className="audio-player-text">
                        <p className="audio-player-surah">{surahDisplay}</p>
                        <p className="audio-player-reciter">{reciterName || currentReciter?.nameAr}</p>
                    </div>
                </div>

                <div className="audio-player-controls">
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="audio-player-btn audio-player-btn-play"
                        aria-label={isPlaying ? (lang === 'ar' ? 'إيقاف مؤقت' : 'Pause') : (lang === 'ar' ? 'تشغيل' : 'Play')}
                    >
                        {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                    </button>
                    <button
                        type="button"
                        onClick={stopPlay}
                        className="audio-player-btn audio-player-btn-close"
                        aria-label={lang === 'ar' ? 'إيقاف القراءة' : 'Stop playback'}
                    >
                        <X size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
