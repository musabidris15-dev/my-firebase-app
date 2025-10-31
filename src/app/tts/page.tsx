'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Volume2, Loader2, CircleCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

// For now, we'll assume the user is not logged in.
const isLoggedIn = true;

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

type Status = {
  message: string | null;
  type: 'info' | 'error' | 'success' | 'loading' | null;
};

export default function AmharicTTSPage() {
  const router = useRouter();
  const [text, setText] = useState('ሰላም! ይህ የጽሑፍ ወደ ንግግር መለወጫ መተግበሪያ ሙከራ ነው።');
  const [selectedVoice, setSelectedVoice] = useState(voices[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ message: null, type: null });
  const [audioUrl, setAudioUrl] = useState('');
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [router]);
  
  useEffect(() => {
    // Cleanup object URL
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const showStatus = (message: string, type: Status['type'] = 'info') => {
    setStatus({ message, type });
  };
  
  const setUiLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      showStatus('ድምፅ እየተፈጠረ ነው... እባክዎ ይጠብቁ...', 'loading');
      setAudioUrl('');
    } else {
        if (status.type === 'loading') {
            showStatus(null, null);
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unexpected error occurred.');
      }
      
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
         if (error.message.includes("not valid JSON")) {
            errorMessage = "ስህተት፦ ከሰርቨሩ ያልተጠበቀ ምላሽ ደርሷል። የኤፒአይ ቁልፍ ትክክል መሆኑን ያረጋግጡ።";
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

  const StatusAlert = () => {
    if (!status.message) return null;

    const icon = {
      loading: <Loader2 className="h-5 w-5 animate-spin" />,
      success: <CircleCheck className="h-5 w-5" />,
      error: <AlertCircle className="h-5 w-5" />,
      info: <Terminal className="h-5 w-5" />,
    }[status.type || 'info'];

    return (
        <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className="mt-6">
            <div className="flex items-center gap-3">
                {icon}
                <div className='flex-1'>
                    <AlertTitle className="font-amharic text-lg">{status.type === 'error' ? 'ስህተት' : status.type === 'success' ? 'ተሳክቷል' : 'ሁኔታ'}</AlertTitle>
                    <AlertDescription className='font-amharic'>
                      {status.message}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
  }
  
  if (!isLoggedIn) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Text to Speech</CardTitle>
                <p className="text-muted-foreground mt-2 font-amharic text-lg">የጽሑፍን ወደ ንግግር መለወጫ</p>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                    <label htmlFor="text-to-speak" className="block text-sm font-medium text-muted-foreground mb-2 font-amharic">ጽሑፍ ያስገቡ (በአማርኛ ወይም በእንግሊዝኛ)</label>
                    <Textarea 
                        id="text-to-speak" 
                        rows={6}
                        className="text-lg font-amharic"
                        placeholder="እባክዎ ንግግር ለማድረግ የሚፈልጉትን ጽሑፍ እዚህ ያስገቡ..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="voice-select" className="block text-sm font-medium text-muted-foreground mb-2 font-amharic">ድምፅ ይምረጡ</label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger id="voice-select" className="w-full p-3 text-lg h-auto">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map(voice => (
                            <SelectItem key={voice.value} value={voice.value}>
                                {voice.name}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                <Button 
                    id="speak-button" 
                    className="w-full text-lg py-6"
                    onClick={handleSpeak}
                    disabled={isLoading}
                >
                    {isLoading ? (
                       <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                       <Volume2 className="mr-2 h-6 w-6" />
                    )}
                    <span className="font-amharic">ወደ ድምፅ ቀይር</span>
                </Button>

                {audioUrl && (
                    <div className="w-full pt-4">
                        <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full">
                        </audio>
                    </div>
                )}

                <StatusAlert />
            </CardContent>
        </Card>
    </div>
  );
}
