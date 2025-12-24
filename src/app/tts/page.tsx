'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Volume2, Loader2, CircleCheck, AlertCircle, ChevronsUpDown, Check, Play, Square } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        { name: 'ሚኪ (Mickey-like)', value: 'Vindemiatrix' },
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
        { name:'ሙሉጌታ (Rasalgethi)', value: 'Rasalgethi' },
        { name: 'በላይ (Achernar)', value: 'Achernar' },
        { name: 'ሰለሞን (Sadaltager)', value: 'Sadaltager' },
    ]
};

// Sort voices alphabetically by Ethiopian name
voices.female.sort((a, b) => a.name.localeCompare(b.name, 'am-ET'));
voices.male.sort((a, b) => a.name.localeCompare(b.name, 'am-ET'));

const allVoices = [...voices.female, ...voices.male];

const expressions = [
    { value: 'Default', label: 'Default' },
    { value: 'Whispering', label: 'Whispering' },
    { value: 'Sad', label: 'Sad' },
    { value: 'Happy', label: 'Happy' },
    { value: 'Excited', label: 'Excited' },
    { value: 'Shouting', label: 'Shouting' },
    { value: 'Afraid', label: 'Afraid' },
    { value: 'News Host', label: 'News Host' },
    { value: 'Robotic', label: 'Robotic' },
    { value: 'Breathy', label: 'Breathy' },
    { value: 'Old Radio', label: 'Old Radio' },
    { value: 'Monster', label: 'Monster' },
    { value: 'Cheerful', label: 'Cheerful' },
    { value: 'Customer Support', label: 'Customer Support' },
    { value: 'Professional', label: 'Professional' },
    { value: 'Podcast Host', label: 'Podcast Host' },
];

type Status = {
  message: string | null;
  type: 'info' | 'error' | 'success' | 'loading' | null;
};

type PreviewState = {
    voice: string | null;
    isPlaying: boolean;
    isLoading: boolean;
};

export default function TTSPage() {
  const [text, setText] = useState('ሰላም! ይህ የጽሑፍ ወደ ንግግር መለወጫ መተግበሪያ ሙከራ ነው።');
  const [selectedVoice, setSelectedVoice] = useState(allVoices[0].value);
  const [selectedExpression, setSelectedExpression] = useState(expressions[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ message: null, type: null });
  const [audioUrl, setAudioUrl] = useState('');
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const previewPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewState>({ voice: null, isPlaying: false, isLoading: false });
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    previewPlayerRef.current = new Audio();
    
    const player = previewPlayerRef.current;
    const onEnded = () => setPreview({ voice: preview.voice, isPlaying: false, isLoading: false });
    player.addEventListener('ended', onEnded);

    return () => {
      // Cleanup object URL for main audio
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      // Cleanup for preview player
      player.removeEventListener('ended', onEnded);
      player.pause();
      player.src = '';
    };
  }, []);

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
    if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
    }
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }

    setUiLoading(true);

    const trimmedText = text.trim();

    if (trimmedText.length < 2) {
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
        body: JSON.stringify({ text: trimmedText, voice: selectedVoice, expression: selectedExpression }),
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

  const handlePreview = async (e: React.MouseEvent, voiceValue: string) => {
    e.preventDefault();
    e.stopPropagation();

    const player = previewPlayerRef.current;
    if (!player) return;

    // If clicking the currently playing/loading voice
    if (preview.voice === voiceValue) {
        if (preview.isPlaying) {
            player.pause();
            setPreview({ voice: voiceValue, isPlaying: false, isLoading: false });
        } else if (!preview.isLoading) {
            player.play();
            setPreview({ voice: voiceValue, isPlaying: true, isLoading: false });
        }
        return;
    }

    // Stop any currently playing preview
    player.pause();
    player.src = '';
    setPreview({ voice: voiceValue, isPlaying: false, isLoading: true });
    setPreviewError(null);

    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'ሰላም አለይኩም', voice: voiceValue, expression: 'Default' }),
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Preview failed.');
        }

        player.src = result.audioDataUri;
        player.play();
        setPreview({ voice: voiceValue, isPlaying: true, isLoading: false });

    } catch (err: any) {
        setPreviewError(`Preview for ${voiceValue} failed.`);
        setPreview({ voice: null, isPlaying: false, isLoading: false });
    }
};

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
                    <AlertTitle className="font-amharic text-lg">{status.type === 'error' ? 'ስህተት' : status.type === 'success' ? 'ተሳክቷל' : 'ሁኔታ'}</AlertTitle>
                    <AlertDescription className='font-amharic'>
                      {status.message}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
  }
  
  return (
    <div className="container mx-auto max-w-3xl">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        {previewError && <div className="p-2 text-xs text-red-500">{previewError}</div>}
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
                                                    className="flex justify-between items-center"
                                                >
                                                    <div className="flex items-center">
                                                        <Check
                                                            className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedVoice === voice.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {voice.name}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={(e) => handlePreview(e, voice.value)}
                                                        disabled={preview.isLoading && preview.voice === voice.value}
                                                    >
                                                        {preview.isLoading && preview.voice === voice.value ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                                                         (preview.isPlaying && preview.voice === voice.value) ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                    </Button>
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
                                                    className="flex justify-between items-center"
                                                >
                                                    <div className="flex items-center">
                                                        <Check
                                                            className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedVoice === voice.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {voice.name}
                                                    </div>
                                                     <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={(e) => handlePreview(e, voice.value)}
                                                        disabled={preview.isLoading && preview.voice === voice.value}
                                                    >
                                                        {preview.isLoading && preview.voice === voice.value ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                                                         (preview.isPlaying && preview.voice === voice.value) ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                    </Button>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div>
                        <label htmlFor="expression-select" className="block text-sm font-medium text-muted-foreground mb-2 font-amharic">ስሜት ይምረጡ</label>
                        <Select value={selectedExpression} onValueChange={setSelectedExpression}>
                            <SelectTrigger className="w-full text-lg h-auto p-3">
                                <SelectValue placeholder="Select an expression" />
                            </SelectTrigger>
                            <SelectContent>
                                {expressions.map((expression) => (
                                    <SelectItem key={expression.value} value={expression.value}>
                                        {expression.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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
