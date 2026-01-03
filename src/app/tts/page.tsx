
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Volume2, Loader2, CircleCheck, AlertCircle, ChevronsUpDown, Check, Play, Square, Wallet, Download, Sparkles, Wand2, History, Trash2, Info, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isBefore, subHours } from 'date-fns';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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

const freeVoiceValues = ['Autonoe', 'Erinome', 'Vindemiatrix', 'Zephyr', 'Fenrir', 'Schedar'];

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
type DownloadState = { id: string | null; format: 'wav' | 'mp3' | null; isLoading: boolean };
type EffectsState = { reverb: number; echo: number; pitch: number; };
type HistoryItem = {
  id: string;
  audioUrl: string;
  text: string;
  voice: string;
  timestamp: Date;
};

const PREVIEW_TEXT = "ሰላም ይህ ግዕዝ ነው የናንተ አማርኛ ፅሁፍን ወደ ንግግር መቀየሪያ";

export default function TTSPage() {
  const [text, setText] = useState(PREVIEW_TEXT);
  const [selectedVoice, setSelectedVoice] = useState(allVoices[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadState>({ id: null, format: null, isLoading: false });
  const [status, setStatus] = useState<Status>({ message: null, type: null });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [effects, setEffects] = useState<EffectsState>({ reverb: 0, echo: 0, pitch: 0 });

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();


  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isUserLoading } = useDoc<any>(userDocRef);

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
      if (player) {
        player.removeEventListener('ended', onEnded);
        player.pause();
        player.src = '';
      }
      history.forEach(item => URL.revokeObjectURL(item.audioUrl));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastEmotionUseDate = userProfile?.lastEmotionUseDate?.toDate();
  const canUseFreeEmotion = !lastEmotionUseDate || isBefore(lastEmotionUseDate, subHours(new Date(), 24));
  
  const isFreePlan = userProfile?.planId === 'free';
  const isEmotionControlDisabled = isFreePlan && !canUseFreeEmotion;
  const isEffectControlDisabled = userProfile?.planId !== 'creator';

  const showStatus = (message: string, type: Status['type'] = 'info') => setStatus({ message, type });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newText = e.target.value;
    if (isEmotionControlDisabled) {
      newText = newText.replace(/\[(?!Default|reverb|echo|pitch)[a-zA-Z\s]+(?::\s*[\d.]+)?\]/g, '');
    }
    setText(newText);
  };
  
  const handleGenerate = async () => {
    if (audioPlayerRef.current) audioPlayerRef.current.src = '';

    let textToGenerate = text.trim();
    
    let effectsString = '';
    if (effects.reverb > 0) effectsString += `[reverb: ${effects.reverb}] `;
    if (effects.echo > 0) effectsString += `[echo: ${effects.echo}] `;
    if (effects.pitch !== 0) effectsString += `[pitch: ${effects.pitch}] `;

    textToGenerate = effectsString + textToGenerate;
    
    const characterCount = textToGenerate.length;
    
    if (characterCount < 2) {
      showStatus('Error: Please enter at least 2 characters to generate audio.', 'error');
      return;
    }
    if (userProfile && characterCount > userProfile.creditsRemaining) {
      showStatus(`Error: Insufficient credits. This action requires ${characterCount.toLocaleString()} credits, but you only have ${userProfile.creditsRemaining.toLocaleString()}.`, 'error');
      return;
    }

    setIsLoading(true);
    showStatus('Generating audio...', 'loading');
    
    let creditsRefund = 0;

    try {
      if (userDocRef) {
        const newCredits = userProfile.creditsRemaining - characterCount;
        await setDoc(userDocRef, { creditsRemaining: newCredits }, { merge: true });
        creditsRefund = characterCount;
      }
      
      const containsEmotionTag = /\[(?!Default|reverb|echo|pitch)[a-zA-Z\s]+\]/.test(textToGenerate);
      if (userProfile?.planId === 'free' && containsEmotionTag && canUseFreeEmotion && userDocRef) {
        await setDoc(userDocRef, { lastEmotionUseDate: serverTimestamp() }, { merge: true });
      }

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToGenerate, voice: selectedVoice }),
      });
      const result = await response.json();

      if (!response.ok) {
         if (response.status === 429 || (result.error && result.error.includes("Too Many Requests"))) {
             throw new Error('You have exceeded your request limit. Please wait a moment and try again.');
        }
        throw new Error(result.error || 'An unexpected error occurred.');
      }
      
      if (result.audioDataUri) {
          const newHistoryItem: HistoryItem = {
            id: new Date().getTime().toString(),
            audioUrl: result.audioDataUri,
            text,
            voice: allVoices.find(v => v.value === selectedVoice)?.name || 'Unknown',
            timestamp: new Date()
          };
          setHistory(prev => [newHistoryItem, ...prev]);
          showStatus(`Audio generated successfully! ${characterCount.toLocaleString()} credits used.`, 'success');
      } else {
          throw new Error('API response did not contain valid audio data.');
      }
    } catch (error: any) {
        console.error('TTS Error:', error);
        let errorMessage = `Error: ${error.message}`;
        if (error.message.includes("API key not valid")) errorMessage = "Error: Your API key is not valid. Please set it in the .env file.";
        if (error.message.includes("not valid JSON")) errorMessage = "Error: An unexpected response was received from the server. Check if your API key is valid.";
        showStatus(errorMessage, 'error');
        if (creditsRefund > 0 && userDocRef) {
            await setDoc(userDocRef, { creditsRemaining: userProfile.creditsRemaining }, { merge: true });
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownload = async (itemId: string, sourceAudioUrl: string, format: 'wav' | 'mp3') => {
    setDownloadState({ id: itemId, format, isLoading: true });
    showStatus(`Preparing ${format.toUpperCase()} download...`, 'loading');

    try {
      let finalAudioUrl = sourceAudioUrl;

      if (format === 'mp3') {
        const response = await fetch('/api/customize-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioDataUri: sourceAudioUrl, outputFormat: 'mp3' }),
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

      showStatus(`Download started!`, 'success');
    } catch (error: any) {
      showStatus(`Error: ${error.message}`, 'error');
    } finally {
      setDownloadState({ id: null, format: null, isLoading: false });
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

  const handleLockedFeatureClick = () => {
    toast({
        title: 'Upgrade Required',
        description: 'This feature is only available on a paid plan.',
        action: (
            <Button onClick={() => router.push('/profile#upgrade-plans')}>
                Upgrade Now
            </Button>
        ),
    });
    setPopoverOpen(false);
  };

  const insertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const formattedTag = `[${tag}]`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const newText = currentText.substring(0, start) + formattedTag + ' ' + currentText.substring(end);
    
    setText(newText);
    textarea.focus();
    
    setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + formattedTag.length + 1;
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

  const renderVoiceItem = (voice: {name: string, value: string}) => {
    const isLocked = isFreePlan && !freeVoiceValues.includes(voice.value);
    
    return (
        <CommandItem
            key={voice.value}
            value={voice.name}
            onSelect={() => {
                if (isLocked) {
                    handleLockedFeatureClick();
                } else {
                    setSelectedVoice(voice.value);
                    setPopoverOpen(false);
                }
            }}
            className={cn("flex justify-between items-center", isLocked && "text-muted-foreground cursor-pointer")}
        >
            <div className="flex items-center">
                <Check className={cn("mr-2 h-4 w-4", selectedVoice === voice.value ? "opacity-100" : "opacity-0")} />
                {voice.name}
                {isLocked && <Lock className="ml-2 h-3 w-3" />}
            </div>
            {!isLocked && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => handlePreview(e, voice.value)}
                    disabled={preview.isLoading && preview.voice === voice.value}
                >
                    {preview.isLoading && preview.voice === voice.value ? <Loader2 className="h-4 w-4 animate-spin" /> : (preview.isPlaying && preview.voice === voice.value) ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
            )}
        </CommandItem>
    );
};

  return (
    <div className="container mx-auto max-w-4xl">
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Text to Speech</CardTitle>
                <p className="text-muted-foreground mt-2 text-lg">Convert text, add expressions, and generate high-quality audio.</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="generator">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="generator">Generator</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="generator" className="p-6 md:p-8 space-y-6">
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
                        {userProfile?.planId === 'free' && !canUseFreeEmotion && (
                            <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto">
                                <Link href="/profile#upgrade-plans"><Sparkles className="mr-2 h-4 w-4" />Upgrade to use more</Link>
                            </Button>
                        )}
                      </div>
                      {userProfile?.planId === 'free' && canUseFreeEmotion && (
                          <Alert variant="default" className="border-primary/50 bg-primary/10">
                              <Info className="h-4 w-4 text-primary"/>
                              <AlertTitle>Daily Emotion Pass</AlertTitle>
                              <AlertDescription>As a free user, you can use one custom emotion for free per day. It's on us!</AlertDescription>
                          </Alert>
                      )}
                      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                          <div className="flex w-max space-x-2 p-2">
                              {expressions.map(expression => (
                                  <Button key={expression.value} variant="outline" size="sm" onClick={() => insertTag(expression.label)} disabled={isEmotionControlDisabled}>
                                      {expression.label}
                                  </Button>
                              ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                  </div>
                  
                   <div className={cn('space-y-4 rounded-lg border p-4', isEffectControlDisabled && 'opacity-50 cursor-not-allowed')}>
                        <div className="flex items-center justify-between">
                            <Label className={cn("text-sm font-medium", isEffectControlDisabled ? "text-muted-foreground/50" : "text-muted-foreground")}>
                                3. Audio Effects Lab (Creator Plan only)
                            </Label>
                            {isEffectControlDisabled && userProfile?.planId !== 'creator' && (
                                <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto">
                                    <Link href="/profile#upgrade-plans"><Wand2 className="mr-2 h-4 w-4" />Upgrade to Creator</Link>
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="reverb-slider">Reverb</Label>
                                <Slider id="reverb-slider" min={0} max={1} step={0.1} value={[effects.reverb]} onValueChange={([val]) => setEffects(e => ({...e, reverb: val}))} disabled={isEffectControlDisabled} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="echo-slider">Echo</Label>
                                <Slider id="echo-slider" min={0} max={1} step={0.1} value={[effects.echo]} onValueChange={([val]) => setEffects(e => ({...e, echo: val}))} disabled={isEffectControlDisabled} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pitch-slider">Pitch</Label>
                                <Slider id="pitch-slider" min={-6} max={6} step={1} value={[effects.pitch]} onValueChange={([val]) => setEffects(e => ({...e, pitch: val}))} disabled={isEffectControlDisabled} />
                            </div>
                        </div>
                    </div>


                  <div>
                      <Label htmlFor="voice-select" className="block text-sm font-medium text-muted-foreground mb-2">4. Select a voice</Label>
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between text-lg h-auto p-3">
                              {selectedVoice ? allVoices.find((voice) => voice.value === selectedVoice)?.name : "Select a voice..."}
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
                                            {voices.female.map(renderVoiceItem)}
                                        </CommandGroup>
                                        <CommandGroup heading="Male Voices">
                                            {voices.male.map(renderVoiceItem)}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                      </Popover>
                  </div>
                  
                  <Button id="speak-button" className="w-full text-lg py-6" onClick={handleGenerate} disabled={isLoading || isUserLoading}>
                      {isLoading || isUserLoading ? (<Loader2 className="mr-2 h-6 w-6 animate-spin" />) : (<Volume2 className="mr-2 h-6 w-6" />)}
                      <span>Generate Audio ({characterCount.toLocaleString()} credits)</span>
                  </Button>
                  
                  <StatusAlert />
                </TabsContent>
                <TabsContent value="history" className="p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Generation History (Current Session)
                        </h3>
                        {history.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => setHistory([])}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear History
                            </Button>
                        )}
                    </div>
                    {history.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                            <p>No audio generated in this session yet.</p>
                            <p className="text-sm">Generated clips will appear here.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px] space-y-4 pr-3">
                            {history.map((item) => (
                                <Card key={item.id} className="mb-4">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-normal text-muted-foreground">
                                          {format(item.timestamp, 'PPpp')}
                                        </CardTitle>
                                        <p className="text-base font-semibold line-clamp-2">"{item.text}"</p>
                                    </CardHeader>
                                    <CardContent>
                                        <audio src={item.audioUrl} controls className="w-full h-10"></audio>
                                        <div className="text-xs text-muted-foreground mt-2">Voice: {item.voice}</div>
                                    </CardContent>
                                    <CardFooter className="flex-col items-stretch space-y-4">
                                         <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300">
                                            <AlertCircle className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
                                            <AlertTitle className="text-yellow-800 dark:text-yellow-200">Download Your Audio</AlertTitle>
                                            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                                                History is cleared on page reload. Download now to save your work.
                                            </AlertDescription>
                                        </Alert>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <Button 
                                              onClick={() => handleDownload(item.id, item.audioUrl, 'wav')} 
                                              disabled={downloadState.isLoading && downloadState.id === item.id}
                                            >
                                                {downloadState.isLoading && downloadState.id === item.id && downloadState.format === 'wav' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                                Download WAV
                                            </Button>
                                            <Button 
                                              onClick={() => handleDownload(item.id, item.audioUrl, 'mp3')} 
                                              disabled={downloadState.isLoading && downloadState.id === item.id}
                                            >
                                                {downloadState.isLoading && downloadState.id === item.id && downloadState.format === 'mp3' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                                Download MP3
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </ScrollArea>
                    )}
                </TabsContent>
              </Tabs>
            </CardContent>
             <CardFooter className="flex justify-center items-center text-sm text-muted-foreground p-4 border-t">
                <Wallet className="h-4 w-4 mr-2" />
                Remaining Credits: {isUserLoading ? '...' : userProfile?.creditsRemaining.toLocaleString() ?? '...'}
            </CardFooter>
        </Card>
    </div>
  );
}
