
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Volume2, Loader2, CircleCheck, AlertCircle, ChevronsUpDown, Check, Play, Square, Wallet, Download, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// --- Voice Definitions ---
const voices = {
    female: [
        { name: 'Rahel (Aoede)', value: 'Aoede' },
        { name: 'Biruktait (Autonoe)', value: 'Autonoe' },
        { name: 'Debora (Erinome)', value: 'Erinome' },
        { name: 'Samrawit (Gacrux)', value: 'Gacrux'},
        { name: 'Eleni (Achernar)', value: 'Achernar'},
        { name: 'Layla (Kore)', value: 'Kore' },
        { name: 'Tadelech (Laomedeia)', value: 'Laomedeia' },
        { name: 'Lia (Leda)', value: 'Leda' },
        { name: 'Zebiba (Pulcherrima)', value: 'Pulcherrima' },
        { name: 'Tirsit (Sulafat)', value: 'Sulafat' },
        { name: 'Kidist (Umbriel)', value: 'Umbriel' },
        { name: 'Ekram (Vindemiatrix)', value: 'Vindemiatrix' },
    ],
    male: [
        { name: 'Kemal (Achird)', value: 'Achird' },
        { name: 'Caleb (Algieba)', value: 'Algieba' },
        { name: 'Haile (Algenib)', value: 'Algenib' },
        { name: 'Gideon (Alnilam)', value: 'Alnilam' },
        { name: 'Nardos (Callirrhoe)', value: 'Callirrhoe' },
        { name: 'Getachew (Charon)', value: 'Charon' },
        { name: 'Yordanos (Despina)', value: 'Despina' },
        { name: 'Elias (Enceladus)', value: 'Enceladus' },
        { name: 'Bereket (Fenrir)', value: 'Fenrir' },
        { name: 'Dawit (Orus)', value: 'Orus' },
        { name: 'Emran (Puck)', value: 'Puck' },
        { name: 'Mulugeta (Rasalgethi)', value: 'Rasalgethi' },
        { name: 'Khalid (Sadachbia)', value: 'Sadachbia' },
        { name: 'Solomon (Sadaltager)', value: 'Sadaltager' },
        { name: 'Biruk (Schedar)', value: 'Schedar' },
        { name: 'Abebe (Zephyr)', value: 'Zephyr' },
        { name: 'Tesfaye (Zubenelgenubi)', value: 'Zubenelgenubi' },
    ]
};

voices.female.sort((a, b) => a.name.localeCompare(b.name));
voices.male.sort((a, b) => a.name.localeCompare(b.name));
const allVoices = [...voices.female, ...voices.male];

const expressions = [
    { value: 'Default', label: 'Default' },
    { value: 'Angry', label: 'Angry' },
    { value: 'Terrified', label: 'Terrified' },
    { value: 'Proud', label: 'Proud' },
    { value: 'Guilty', label: 'Guilty' },
    { value: 'Playful', label: 'Playful' },
    { value: 'Bored', label: 'Bored' },
    { value: 'Grateful', label: 'Grateful' },
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
].sort((a, b) => a.label.localeCompare(b.label));

type Status = { message: string | null; type: 'info' | 'error' | 'success' | 'loading' | null; };
type PreviewState = { voice: string | null; isPlaying: boolean; isLoading: boolean; };
type DownloadState = { format: 'wav' | 'mp3' | null; isLoading: boolean };

const PREVIEW_TEXT = "[Cheerful] Welcome to Geez Voice! [Default] Experience the power of AI with granular emotional control.";
const MOCK_USER_CREDITS = 20000;
const DOWNLOAD_COST = 500;
const MOCK_USER_PLAN = 'free'; // 'free', 'hobbyist', or 'creator'

export default function TTSPage() {
  const [text, setText] = useState(PREVIEW_TEXT);
  const [selectedVoice, setSelectedVoice] = useState(allVoices[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadState>({ format: null, isLoading: false });
  const [status, setStatus] = useState<Status>({ message: null, type: null });
  const [audioUrl, setAudioUrl] = useState('');
  const [userCredits, setUserCredits] = useState(MOCK_USER_CREDITS);
  const [userPlan] = useState(MOCK_USER_PLAN);

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const previewPlayerRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
  
  const isEmotionControlDisabled = userPlan === 'free';

  useEffect(() => {
    if (isEmotionControlDisabled) {
      // If user is on free plan, strip out any emotion tags from the default text
      setText(PREVIEW_TEXT.replace(/\[.*?\]/g, '').trim());
    }
  }, [isEmotionControlDisabled]);

  const showStatus = (message: string, type: Status['type'] = 'info') => setStatus({ message, type });
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newText = e.target.value;
    if (isEmotionControlDisabled) {
      newText = newText.replace(/\[.*?\]/g, '');
    }
    setText(newText);
  };

  const handleGenerate = async () => {
    if (audioPlayerRef.current) audioPlayerRef.current.src = '';
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl('');

    const trimmedText = text.trim();
    const characterCount = trimmedText.length;

    if (characterCount < 2) {
      showStatus('Error: Please enter at least 2 characters to generate audio.', 'error');
      return;
    }
    if (characterCount > userCredits) {
      showStatus(`Error: Insufficient credits. This action requires ${characterCount.toLocaleString()} credits, but you only have ${userCredits.toLocaleString()}.`, 'error');
      return;
    }
    
    setIsLoading(true);
    showStatus('Generating audio...', 'loading');
    
    let creditsRefund = 0;

    try {
      setUserCredits(prev => prev - characterCount);
      creditsRefund = characterCount;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmedText, voice: selectedVoice }),
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
          showStatus(`Audio generated successfully! ${characterCount.toLocaleString()} credits used.`, 'success');
          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = result.audioDataUri;
            audioPlayerRef.current.play();
          }
      } else {
          throw new Error('API response did not contain valid audio data.');
      }
    } catch (error: any) {
        console.error('TTS Error:', error);
        let errorMessage = `Error: ${error.message}`;
        if (error.message.includes("API key not valid")) errorMessage = "Error: Your API key is not valid. Please set it in the .env file.";
        if (error.message.includes("not valid JSON")) errorMessage = "Error: An unexpected response was received from the server. Check if your API key is valid.";
        showStatus(errorMessage, 'error');
        if (creditsRefund > 0) {
            setUserCredits(prev => prev + creditsRefund);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownload = async (format: 'wav' | 'mp3') => {
    if (!audioUrl) {
      showStatus('Error: Please generate audio before downloading.', 'error');
      return;
    }
    if (DOWNLOAD_COST > userCredits) {
      showStatus(`Error: Insufficient credits. Downloading requires ${DOWNLOAD_COST} credits.`, 'error');
      return;
    }

    setDownloadState({ format, isLoading: true });
    showStatus(`Preparing ${format.toUpperCase()} download...`, 'loading');
    
    setUserCredits(prev => prev - DOWNLOAD_COST);
    let creditsRefunded = false;

    try {
      let finalAudioUrl = audioUrl;

      if (format === 'mp3') {
        const response = await fetch('/api/customize-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioDataUri: audioUrl, outputFormat: 'mp3' }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `MP3 conversion failed.`);
        finalAudioUrl = result.audioDataUri;
      }
      
      const link = document.createElement('a');
      link.href = finalAudioUrl;
      link.download = `geez-voice-${new Date().getTime()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke blob URL if it was created for MP3
      if (format === 'mp3' && finalAudioUrl !== audioUrl) {
          URL.revokeObjectURL(finalAudioUrl);
      }

      showStatus(`Download started! ${DOWNLOAD_COST.toLocaleString()} credits were used.`, 'success');
    } catch (error: any) {
      showStatus(`Error: ${error.message}`, 'error');
      setUserCredits(prev => prev + DOWNLOAD_COST);
      creditsRefunded = true;
    } finally {
      setDownloadState({ format: null, isLoading: false });
    }
  };

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
            body: JSON.stringify({ text: "ሰላም! ይህንን ድምፅ ናሙና እየሞከርክ ነው።", voice: voiceValue }),
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

  const insertEmotionTag = (emotion: string) => {
    if (isEmotionControlDisabled) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const tag = `[${emotion}]`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const newText = currentText.substring(0, start) + tag + ' ' + currentText.substring(end);
    
    setText(newText);
    textarea.focus();
    
    setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tag.length + 1;
    }, 0);
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

  return (
    <div className="container mx-auto max-w-3xl">
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Text to Speech</CardTitle>
                <p className="text-muted-foreground mt-2 text-lg">Convert text, add expressions, and generate high-quality audio.</p>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="text-to-speak" className="text-sm font-medium text-muted-foreground">1. Enter your script</Label>
                    <Textarea ref={textareaRef} id="text-to-speak" rows={6} className="text-lg" placeholder="[Happy] Welcome to Geez Voice! Start typing here..." value={text} onChange={handleTextChange} />
                    <div className="text-right text-sm text-muted-foreground mt-2">{characterCount.toLocaleString()} characters</div>
                </div>

                <div className='space-y-2'>
                    <div className="flex items-center justify-between">
                      <Label className={cn("text-sm font-medium", isEmotionControlDisabled ? "text-muted-foreground/50" : "text-muted-foreground")}>
                        2. Add emotions to your script (optional)
                      </Label>
                      {isEmotionControlDisabled && (
                        <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto">
                          <Link href="/profile"><Sparkles className="mr-2 h-4 w-4" />Upgrade to Unlock</Link>
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                        <div className="flex w-max space-x-2 p-2">
                            {expressions.map(expression => (
                                <Button key={expression.value} variant="outline" size="sm" onClick={() => insertEmotionTag(expression.label)} disabled={isEmotionControlDisabled}>
                                    {expression.label}
                                </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
                
                <div>
                    <Label htmlFor="voice-select" className="block text-sm font-medium text-muted-foreground mb-2">3. Select a voice</Label>
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
                
                <Button id="speak-button" className="w-full text-lg py-6" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? (<Loader2 className="mr-2 h-6 w-6 animate-spin" />) : (<Volume2 className="mr-2 h-6 w-6" />)}
                    <span>Generate Audio ({characterCount.toLocaleString()} credits)</span>
                </Button>
                
                {audioUrl && (
                  <Card>
                      <CardHeader>
                        <CardTitle>Playback & Download</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full h-10 mt-1"></audio>
                      </CardContent>
                      <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button onClick={() => handleDownload('wav')} disabled={downloadState.isLoading} className="w-full">
                            {downloadState.isLoading && downloadState.format === 'wav' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Download WAV ({DOWNLOAD_COST.toLocaleString()} credits)
                        </Button>
                         <Button onClick={() => handleDownload('mp3')} disabled={downloadState.isLoading} className="w-full">
                            {downloadState.isLoading && downloadState.format === 'mp3' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Download MP3 ({DOWNLOAD_COST.toLocaleString()} credits)
                        </Button>
                      </CardFooter>
                  </Card>
                )}
                
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
