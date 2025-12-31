
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Volume2, Loader2, CircleCheck, AlertCircle, ChevronsUpDown, Check, Play, Square, Wand, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// --- Voice Definitions ---
const voices = {
    female: [
        { name: 'Almaz (Achird)', value: 'Achird' },
        { name: 'Rahel (Aoede)', value: 'Aoede' },
        { name: 'Biruktait (Autonoe)', value: 'Autonoe' },
        { name: 'Debora (Erinome)', value: 'Erinome' },
        { name: 'Tarik (Kore)', value: 'Kore' },
        { name: 'Tadelech (Laomedeia)', value: 'Laomedeia' },
        { name: 'Lia (Leda)', value: 'Leda' },
        { name: 'Zebiba (Pulcherrima)', value: 'Pulcherrima' },
        { name: 'Letebirhan (Sadachbia)', value: 'Sadachbia' },
        { name: 'Tsedal (Schedar)', value: 'Schedar' },
        { name: 'Tirsit (Sulafat)', value: 'Sulafat' },
        { name: 'Kidist (Umbriel)', value: 'Umbriel' },
        { name: 'Mickey-like Female (Vindemiatrix)', value: 'Vindemiatrix' },
    ],
    male: [
        { name: 'Abebe (Zephyr)', value: 'Zephyr' },
        { name: 'Belay (Achernar)', value: 'Achernar' },
        { name: 'Gideon (Alnilam)', value: 'Alnilam' },
        { name: 'Caleb (Algieba)', value: 'Algieba' },
        { name: 'Haile (Algenib)', value: 'Algenib' },
        { name: 'Nardos (Callirrhoe)', value: 'Callirrhoe' },
        { name: 'Getachew (Charon)', value: 'Charon' },
        { name: 'Yordanos (Despina)', value: 'Despina' },
        { name: 'Elias (Enceladus)', value: 'Enceladus' },
        { name: 'Bereket (Fenrir)', value: 'Fenrir' },
        { name: 'Mulu (Gacrux)', value: 'Gacrux' },
        { name: 'Fikru (Iapetus)', value: 'Iapetus' },
        { name: 'Dawit (Orus)', value: 'Orus' },
        { name: 'Hewan (Puck)', value: 'Puck' },
        { name: 'Mulugeta (Rasalgethi)', value: 'Rasalgethi' },
        { name: 'Solomon (Sadaltager)', value: 'Sadaltager' },
        { name: 'Tesfaye (Zubenelgenubi)', value: 'Zubenelgenubi' },
    ]
};

voices.female.sort((a, b) => a.name.localeCompare(b.name));
voices.male.sort((a, b) => a.name.localeCompare(b.name));
const allVoices = [...voices.female, ...voices.male];

const expressions = [
    { value: 'Default', label: 'Default' }, { value: 'Whispering', label: 'Whispering' },
    { value: 'Sad', label: 'Sad' }, { value: 'Happy', label: 'Happy' },
    { value: 'Excited', label: 'Excited' }, { value: 'Shouting', label: 'Shouting' },
    { value: 'Afraid', label: 'Afraid' }, { value: 'News Host', label: 'News Host' },
    { value: 'Robotic', label: 'Robotic' }, { value: 'Breathy', label: 'Breathy' },
    { value: 'Old Radio', label: 'Old Radio' }, { value: 'Monster', label: 'Monster' },
    { value: 'Cheerful', label: 'Cheerful' }, { value: 'Customer Support', label: 'Customer Support' },
    { value: 'Professional', label: 'Professional' }, { value: 'Podcast Host', label: 'Podcast Host' },
];

const audioEffects = [
  { id: 'none', name: 'None' }, { id: 'robot', name: 'Robot' },
  { id: 'alien', name: 'Alien' }, { id: 'deep', name: 'Deep Voice' },
  { id: 'high-pitch', name: 'High Pitch' }, { id: 'echo', name: 'Echo Chamber' },
  { id: 'reverb', name: 'Reverb' }, { id: 'movie-character', name: 'Movie Character' },
  { id: 'anime-character', name: 'Anime Character' }, { id: 'celebrity', name: 'Celebrity' },
];

type Status = { message: string | null; type: 'info' | 'error' | 'success' | 'loading' | null; };
type PreviewState = { voice: string | null; isPlaying: boolean; isLoading: boolean; };

const PREVIEW_TEXT = "ሰላም! ይህ ግዕዝ ነው፣ የአማርኛ ጽሑፍ ወደ ንግግር መለወጫ መተግበሪያዎ። This is an example of a [happy](happy) expression.";
const MOCK_USER_CREDITS = 1000;

export default function TTSPage() {
  const [text, setText] = useState(PREVIEW_TEXT);
  const [selectedVoice, setSelectedVoice] = useState(allVoices[0].value);
  const [selectedExpression, setSelectedExpression] = useState(expressions[0].value);
  const [selectedEffect, setSelectedEffect] = useState(audioEffects[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ message: null, type: null });
  const [audioUrl, setAudioUrl] = useState('');
  const [userCredits, setUserCredits] = useState(MOCK_USER_CREDITS);
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
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (player) {
        player.removeEventListener('ended', onEnded);
        player.pause();
        player.src = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showStatus = (message: string, type: Status['type'] = 'info') => setStatus({ message, type });
  
  const setUiLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      showStatus('Generating audio... Please wait...', 'loading');
      setAudioUrl('');
    } else if (status.type === 'loading') {
        showStatus(null, null);
    }
  };

  const handleSpeak = async () => {
    if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    const trimmedText = text.trim();
    const characterCount = trimmedText.length;
    const effectCost = selectedEffect !== 'none' ? 500 : 0;
    const totalCost = characterCount + effectCost;

    if (characterCount < 2) {
        showStatus('Error: Please enter at least 2 characters to generate audio.', 'error');
        return;
    }
    if (totalCost > userCredits) {
        showStatus(`Error: Insufficient credits. This action requires ${totalCost.toLocaleString()} credits, but you only have ${userCredits.toLocaleString()}.`, 'error');
        return;
    }
    
    setUiLoading(true);
    setUserCredits(prev => prev - totalCost);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmedText, voice: selectedVoice, expression: selectedExpression, effect: selectedEffect }),
      });
      const result = await response.json();

      if (!response.ok) {
         if (response.status === 429 || (result.error && result.error.includes("Too Many Requests"))) {
             throw new Error('You have exceeded your request limit. Please wait a moment and try again.');
        }
        throw new Error(result.error || 'An unexpected error occurred.');
      }
      
      if (result.audioDataUri) {
          setAudioUrl(result.audioDataUri);
          showStatus(`Audio generated successfully! ${totalCost.toLocaleString()} credits were used.`, 'success');
      } else {
          throw new Error('API response did not contain valid audio data.');
      }
    } catch (error: any) {
        console.error('TTS Error:', error);
        let errorMessage = `Error: ${error.message}`;
        if (error.message.includes("API key not valid")) errorMessage = "Error: Your API key is not valid. Please set it in the .env file.";
        if (error.message.includes("not valid JSON")) errorMessage = "Error: An unexpected response was received from the server. Check if your API key is valid.";
        showStatus(errorMessage, 'error');
        setUserCredits(prev => prev + totalCost); // Refund credits on failure
    } finally {
        setUiLoading(false);
    }
  };
  
  useEffect(() => {
      if (audioUrl && audioPlayerRef.current) audioPlayerRef.current.play();
  }, [audioUrl]);

  const handlePreview = async (e: React.MouseEvent, voiceValue: string) => {
    e.preventDefault(); e.stopPropagation();
    const player = previewPlayerRef.current;
    if (!player) return;
    if (preview.voice === voiceValue) {
        if (preview.isPlaying) { player.pause(); setPreview({ voice: voiceValue, isPlaying: false, isLoading: false }); }
        else if (!preview.isLoading) { player.play(); setPreview({ voice: voiceValue, isPlaying: true, isLoading: false }); }
        return;
    }
    player.pause(); player.src = '';
    setPreview({ voice: voiceValue, isPlaying: false, isLoading: true });
    setPreviewError(null);
    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: "ሰላም! ይህንን ድምፅ ናሙና እየሞከርክ ነው።", voice: voiceValue, expression: 'Default' }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Preview failed.');
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
    const icon = { loading: <Loader2 className="h-5 w-5 animate-spin" />, success: <CircleCheck className="h-5 w-5" />, error: <AlertCircle className="h-5 w-5" />, info: <Terminal className="h-5 w-5" />, }[status.type || 'info'];
    return (
        <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className="mt-6">
            <div className="flex items-center gap-3">
                {icon}
                <div className='flex-1'>
                    <AlertTitle>{status.type === 'error' ? 'Error' : status.type === 'success' ? 'Success' : 'Status'}</AlertTitle>
                    <AlertDescription>
                      {status.message.includes('Insufficient credits') ? (<>{status.message.split('. ')[0]}.<Button variant="link" asChild className="p-0 h-auto ml-1"><Link href="/profile">Please upgrade your plan.</Link></Button></>) : (status.message)}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
  }
  
  const characterCount = text.length;
  const totalCost = characterCount + (selectedEffect !== 'none' ? 500 : 0);

  return (
    <div className="container mx-auto max-w-3xl">
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Text to Speech</CardTitle>
                <p className="text-muted-foreground mt-2 text-lg">Convert text, add expressions, and apply audio effects.</p>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                    <label htmlFor="text-to-speak" className="block text-sm font-medium text-muted-foreground mb-2">1. Enter text and expressions</label>
                    <Textarea id="text-to-speak" rows={6} className="text-lg" placeholder="Use [phrase](emotion) for expressions..." value={text} onChange={(e) => setText(e.target.value)} />
                    <div className="text-right text-sm text-muted-foreground mt-2">{characterCount.toLocaleString()} characters</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="voice-select" className="block text-sm font-medium text-muted-foreground mb-2">2. Select a voice</label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between text-lg h-auto p-3">
                                {selectedVoice ? allVoices.find((voice) => voice.value === selectedVoice)?.name : "Select a voice..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command><CommandInput placeholder="Search voice..." />
                                    <CommandList>{previewError && <div className="p-2 text-xs text-red-500">{previewError}</div>}<CommandEmpty>No voice found.</CommandEmpty>
                                        <CommandGroup heading="Female Voices">{voices.female.map((voice) => (<CommandItem key={voice.value} value={voice.name} onSelect={() => { setSelectedVoice(voice.value); setPopoverOpen(false);}} className="flex justify-between items-center"><div className="flex items-center"><Check className={cn("mr-2 h-4 w-4", selectedVoice === voice.value ? "opacity-100" : "opacity-0")}/>{voice.name}</div><Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handlePreview(e, voice.value)} disabled={preview.isLoading && preview.voice === voice.value}>{preview.isLoading && preview.voice === voice.value ? <Loader2 className="h-4 w-4 animate-spin" /> : (preview.isPlaying && preview.voice === voice.value) ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button></CommandItem>))}</CommandGroup>
                                        <CommandGroup heading="Male Voices">{voices.male.map((voice) => (<CommandItem key={voice.value} value={voice.name} onSelect={() => { setSelectedVoice(voice.value); setPopoverOpen(false);}} className="flex justify-between items-center"><div className="flex items-center"><Check className={cn("mr-2 h-4 w-4", selectedVoice === voice.value ? "opacity-100" : "opacity-0")}/>{voice.name}</div><Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handlePreview(e, voice.value)} disabled={preview.isLoading && preview.voice === voice.value}>{preview.isLoading && preview.voice === voice.value ? <Loader2 className="h-4 w-4 animate-spin" /> : (preview.isPlaying && preview.voice === voice.value) ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button></CommandItem>))}</CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <label htmlFor="expression-select" className="block text-sm font-medium text-muted-foreground mb-2">3. Set default emotion</label>
                        <Select value={selectedExpression} onValueChange={setSelectedExpression}><SelectTrigger className="w-full text-lg h-auto p-3"><SelectValue placeholder="Select an expression" /></SelectTrigger><SelectContent>{expressions.map((expression) => (<SelectItem key={expression.value} value={expression.value}>{expression.label}</SelectItem>))}</SelectContent></Select>
                    </div>
                </div>

                 <div>
                    <label htmlFor="effect-select" className="block text-sm font-medium text-muted-foreground mb-2">4. Apply audio effect (optional)</label>
                    <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                        <SelectTrigger className="w-full text-lg h-auto p-3">
                            <SelectValue placeholder="Select an effect" />
                        </SelectTrigger>
                        <SelectContent>
                            {audioEffects.map((effect) => (
                                <SelectItem key={effect.id} value={effect.id}>
                                    {effect.name} {effect.id !== 'none' && '(+500 credits)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button id="speak-button" className="w-full text-lg py-6" onClick={handleSpeak} disabled={isLoading}>
                    {isLoading ? (<Loader2 className="mr-2 h-6 w-6 animate-spin" />) : (<Volume2 className="mr-2 h-6 w-6" />)}
                    <span>Generate Audio ({totalCost.toLocaleString()} credits)</span>
                </Button>

                {audioUrl && (<div className="w-full pt-4"><audio ref={audioPlayerRef} src={audioUrl} controls className="w-full"></audio></div>)}
                <StatusAlert />
            </CardContent>
             <CardFooter className="flex justify-center items-center text-sm text-muted-foreground p-4 border-t">
                <Wallet className="h-4 w-4 mr-2" />
                Remaining Credits: {userCredits.toLocaleString()}
            </CardFooter>
        </Card>
    </div>
  );
}
