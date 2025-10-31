'use client';

import { useState, useEffect, useRef } from 'react';

// --- Voice Definitions with Ethiopian Names ---
const voices = [
    // Standard Female Voices
    { name: 'ሔዋን (Puck)', value: 'Puck' },         // Upbeat, Female
    { name: 'ታሪክ (Kore)', value: 'Kore' },         // Firm, Female
    { name: 'ሊያ (Leda)', value: 'Leda' },          // Youthful, Female
    { name: 'ራሄል (Aoede)', value: 'Aoede' },        // Breezy, Female
    { name: 'ናርዶስ (Callirrhoe)', value: 'Callirrhoe' }, // Easy-going, Female
    { name: 'ብርቅታይት (Autonoe)', value: 'Autonoe' },  // Bright, Female
    { name: 'ቅድስት (Umbriel)', value: 'Umbriel' },    // Easy-going, Female
    { name: 'ዲቦራ (Erinome)', value: 'Erinome' },    // Clear, Female
    { name: 'ዮርዳኖስ (Despina)', value: 'Despina' },    // Smooth, Female
    { name: 'ታደለች (Laomedeia)', value: 'Laomedeia' },// Upbeat, Female
    { name: 'ፀዳል (Schedar)', value: 'Schedar' },      // Even, Female
    { name: 'ሙሉ (Gacrux)', value: 'Gacrux' },        // Mature, Female
    { name: 'ዘቢባ (Pulcherrima)', value: 'Pulcherrima' },// Forward, Female
    { name: 'አልማዝ (Achird)', value: 'Achird' },      // Friendly, Female
    { name: 'ሚሚ (Vindemiatrix)', value: 'Vindemiatrix' },// Gentle, Female
    { name: 'ለተብርሃን (Sadachbia)', value: 'Sadachbia' },// Lively, Female
    { name: 'ትርሲት (Sulafat)', value: 'Sulafat' },    // Warm, Female
    // Standard Male Voices
    { name: 'አበበ (Zephyr)', value: 'Zephyr' },       // Bright, Male
    { name: 'ጌታቸው (Charon)', value: 'Charon' },     // Informative, Male
    { name: 'ተስፋዬ (Zubenelgenubi)', value: 'Zubenelgenubi' }, // Casual, Male
    { name: 'ጌዲዮን (Alnilam)', value: 'Alnilam' },    // Firm, Male (Villain Voice)
    { name: 'በረከት (Fenrir)', value: 'Fenrir' },     // Excitable, Male
    { name: 'ዳዊት (Orus)', value: 'Orus' },         // Firm, Male
    { name: 'ኤልያስ (Enceladus)', value: 'Enceladus' }, // Breathy, Male
    { name: 'ፍቅሩ (Iapetus)', value: 'Iapetus' },     // Clear, Male
    { name: 'ካሌብ (Algieba)', value: 'Algieba' },     // Smooth, Male
    { name: 'ሀይሌ (Algenib)', value: 'Algenib' },      // Gravelly, Male
    { name: 'ሙሉጌታ (Rasalgethi)', value: 'Rasalgethi' },// Informative, Male
    { name: 'በላይ (Achernar)', value: 'Achernar' },   // Soft, Male
    { name: 'ሰለሞን (Sadaltager)', value: 'Sadaltager' },// Knowledgeable, Male
];

// Sort voices alphabetically by Ethiopian name
voices.sort((a, b) => a.name.localeCompare(b.name, 'am-ET'));

type TextToSpeechOutput = {
  audioDataUri?: string;
  error?: string;
};

export default function AmharicTTSPage() {
  const [text, setText] = useState('ሰላም! ይህ የጽሑፍ ወደ ንግግር መለወጫ መተግበሪያ ሙከራ ነው።');
  const [selectedVoice, setSelectedVoice] = useState(voices[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [audioUrl, setAudioUrl] = useState('');
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    // Cleanup object URL
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const showStatus = (message: string, type = 'info') => {
    setStatus({ message, type });
  };
  
  const setUiLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      showStatus('ድምፅ እየተፈጠረ ነው... እባክዎ ይጠብቁ...', 'loading');
      setAudioUrl('');
    } else {
        if (status.type === 'loading') {
            showStatus('', '');
        }
    }
  };

  const handleSpeak = async () => {
    setUiLoading(true);

    if (text.trim().length < 2) {
        showStatus('ስህተት፦ እባክዎ ድምፅ ለመፍጠር ቢያንስ 2 ፊደላትን ያስገቡ።', 'error');
        setUiLoading(false);
        return;
    }
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice: selectedVoice }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unexpected error occurred.');
      }
      
      const result: TextToSpeechOutput = await response.json();

      if (result.audioDataUri) {
          setAudioUrl(result.audioDataUri);
          showStatus('ድምፅ በተሳካ ሁኔታ ተፈጥሯል!', 'success');
      } else {
          throw new Error(result.error || 'API response did not contain valid audio data.');
      }
    } catch (error: any) {
        console.error('TTS Error:', error);
        let errorMessage = `ስህተት፦ ${error.message}`;
        if (error.message.includes("API key not valid")) {
            errorMessage = "ስህተት፦ የኤፒአይ ቁልፍዎ (API Key) ትክክል አይደለም። እባክዎ በ .env ፋይል ውስጥ ያስገቡት።";
        }
        if (error.message.includes("Unexpected token '<'")) {
            errorMessage = "ስህተት፦ ከሰርቨሩ ያልተጠበቀ ምላሽ ደርሷል። እባክዎ እንደገና ይሞክሩ።";
        }
        showStatus(errorMessage, 'error');
    } finally {
        setUiLoading(false);
    }
  };
  
  useEffect(() => {
      if (audioUrl && audioPlayerRef.current) {
          audioPlayerRef.current.play();
      }
  }, [audioUrl]);

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex items-center justify-center p-4 font-body">
        <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-cyan-400">Amharic Text to Speech</h1>
                <p className="text-gray-400 mt-2 font-amharic">የጽሑፍን ወደ ንግግር መለወጫ</p>
            </div>
                
            <div>
                <label htmlFor="text-to-speak" className="block text-sm font-medium text-gray-300 mb-2 font-amharic">ጽሑፍ ያስገቡ (በአማርኛ ወይም በእንግሊዝኛ)</label>
                <textarea 
                    id="text-to-speak" 
                    rows={6}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 text-lg font-amharic"
                    placeholder="እባክዎ ንግግር ለማድረግ የሚፈልጉትን ጽሑፍ እዚህ ያስገቡ... (ለምሳሌ፦ 'ሰላም እንዴት ነህ?')"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                ></textarea>
            </div>

            <div>
                <label htmlFor="voice-select" className="block text-sm font-medium text-gray-300 mb-2 font-amharic">ድምፅ ይምረጡ</label>
                <select 
                    id="voice-select" 
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 text-lg"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                >
                    {voices.map(voice => (
                        <option key={voice.value} value={voice.value}>
                            {voice.name}
                        </option>
                    ))}
                </select>
            </div>

            <button 
                id="speak-button" 
                className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200 ease-in-out disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSpeak}
                disabled={isLoading}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span className="font-amharic">ወደ ድምፅ ቀይር</span>
            </button>

            <div className="text-center min-h-[44px]">
                {status.message && (
                    <div className={`p-3 rounded-lg font-amharic ${
                        status.type === 'error' ? 'text-red-400 bg-red-900 bg-opacity-30' : 
                        status.type === 'success' ? 'text-green-400' :
                        status.type === 'loading' ? 'text-cyan-400 flex items-center justify-center gap-2' : ''
                    }`}>
                        {status.type === 'loading' && (
                           <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-600 border-t-blue-500"></div>
                        )}
                        {status.message}
                    </div>
                )}
            </div>
            
            {audioUrl && (
                <div className="w-full">
                    <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full">
                    </audio>
                </div>
            )}
        </div>
    </div>
  );
}
