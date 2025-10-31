'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Volume2, Loader2, CircleCheck, AlertCircle, ChevronsUpDown, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';


// --- Voice Definitions with Ethiopian Names ---
const voices = {
    female: [
        { name: 'ሔዋን (Puck)', value: 'Puck' },
        { name: 'ታሪክ (Kore)', value: 'Kore' },
        { name: 'ሊያ (Leda)', value: 'Leda' },
        { name: 'ራሄል (Aoede)', value: 'Aoede' },
        { name: 'ናርዶስ (Callirrhoe)', value: 'Callirrhoe' },
        { name: 'ብርቅታይት (Autonoe)', value: 'Autonoe' },
        { name: 'ቅድስት (Umbriel)', value: 'Umbriel' },
        { name: 'ዲቦራ (Erinome)', value: 'Erinome' },
        { name: 'ዮርዳኖስ (Despina)', value: 'Despina' },
        { name: 'ታደለች (Laomedeia)', value: 'Laomedeia' },
        { name: 'ፀዳል (Schedar)', value: 'Schedar' },
        { name: 'ሙሉ (Gacrux)', value: 'Gacrux' },
        { name: 'ዘቢባ (Pulcherrima)', value: 'Pulcherrima' },
        { name: 'አልማዝ (Achird)', value: 'Achird' },
        { name: 'ሚሚ (Vindemiatrix)', value: 'Vindemiatrix' },
        { name: 'ለተብርሃን (Sadachbia)', value: 'Sadachbia' },
        { name: 'ትርሲት (Sulafat)', value: 'Sulafat' },
    ],
    male: [
        { name: 'አበበ (Zephyr)', value: 'Zephyr' },
        { name: 'ጌታቸው (Charon)', value: 'Charon' },
        { name: 'ተስፋዬ (Zubenelgenubi)', value: 'Zubenelgenubi' },
        { name: 'ጌዲዮን (Alnilam)', value: 'Alnilam' },
        { name: 'በረከት (Fenrir)', value: 'Fenrir' },
        { name: 'ዳዊት (Orus)', value: 'Orus' },
        { name: 'ኤልያስ (Enceladus)', value: 'Enceladus' },
        { name: 'ፍቅሩ (Iapetus)', value: 'Iapetus' },
        { name: 'ካሌብ (Algieba)', value: 'Algieba' },
        { name: 'ሀይሌ (Algenib)', value: 'Algenib' },
        { name: 'ሙሉጌታ (Rasalgethi)', value: 'Rasalgethi' },
        { name: 'በላይ (Achernar)', value: 'Achernar' },
        { name: 'ሰለሞን (Sadaltager)', value: 'Sadaltager' },
    ]
};

// Sort voices alphabetically by Ethiopian name
voices.female.sort((a, b) => a.name.localeCompare(b.name, 'am-ET'));
voices.male.sort((a, b) => a.name.localeCompare(b.name, 'am-ET'));


const allVoices = [...voices.female, ...voices.male];

type Status = {
  message: string | null;
  type: 'info' | 'error' | 'success' | 'loading' | null;
};

export default function TTSPage() {
  const [text, setText] = useState('ሰላም! ይህ የጽሑፍ ወደ ንግግር መለወጫ መተግበሪያ ሙከራ ነው።');
  const [selectedVoice, setSelectedVoice] = useState(allVoices[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ message: null, type: null });
  const [audioUrl, setAudioUrl] = useState('');
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

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
                     <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={popoverOpen}
                            className="w-full justify-between text-lg h-auto p-3"
                            >
                            {selectedVoice
                                ? allVoices.find((voice) => voice.value === selectedVoice)?.name
                                : "Select a voice..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search voice..." />
                                <CommandList>
                                    <CommandEmpty>No voice found.</CommandEmpty>
                                    <CommandGroup heading="Female Voices">
                                        {voices.female.map((voice) => (
                                            <CommandItem
                                            key={voice.value}
                                            value={voice.name}
                                            onSelect={() => {
                                                setSelectedVoice(voice.value);
                                                setPopoverOpen(false);
                                            }}
                                            >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedVoice === voice.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {voice.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandGroup heading="Male Voices">
                                        {voices.male.map((voice) => (
                                            <CommandItem
                                            key={voice.value}
                                            value={voice.name}
                                            onSelect={() => {
                                                setSelectedVoice(voice.value);
                                                setPopoverOpen(false);
                                            }}
                                            >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedVoice === voice.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {voice.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
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
