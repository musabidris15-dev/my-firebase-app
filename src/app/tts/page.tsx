
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Volume2, Loader2, CircleCheck, AlertCircle, ChevronsUpDown, Check, Play, Square, Wallet, Download, Wand2, RefreshCw, GaugeCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
type CustomizationState = { pitch: number; echo: number; reverb: number; };

const PREVIEW_TEXT = "[Cheerful] Welcome to Geez Voice! [Default] Experience the power of AI with granular emotional control.";
const MOCK_USER_CREDITS = 20000;
const DOWNLOAD_COST = 500;

export default function TTSPage() {
  const [text, setText] = useState(PREVIEW_TEXT);
  const [selectedVoice, setSelectedVoice] = useState(allVoices[0].value);
  const [narrativeSpeed, setNarrativeSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState<Status>({ message: null, type: null });
  const [audioUrl, setAudioUrl] = useState('');
  const [userCredits, setUserCredits] = useState(MOCK_USER_CREDITS);
  const [customization, setCustomization] = useState<CustomizationState>({ pitch: 0, echo: 0, reverb: 0 });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizedAudioUrl, setCustomizedAudioUrl] = useState('');


  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const customizedAudioPlayerRef = useRef<HTMLAudioElement>(null);
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
      if (customizedAudioUrl) URL.revokeObjectURL(customizedAudioUrl);
      if (player) {
        player.removeEventListener('ended', onEnded);
        player.pause();
        player.src = '';
      }
    };
  }, []);

  const showStatus = (message: string, type: Status['type'] = 'info') => setStatus({ message, type });
  
  const applyCustomization = async (baseAudioUrl: string) => {
    setIsCustomizing(true);
    showStatus('Applying customizations...', 'loading');
    try {
      const response = await fetch('/api/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioDataUri: baseAudioUrl, ...customization }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to customize audio.');

      setCustomizedAudioUrl(result.audioDataUri);
      showStatus('Audio generated and customized successfully!', 'success');
      return result.audioDataUri;
    } catch (error: any) {
      showStatus(`Error applying customization: ${error.message}`, 'error');
      return null;
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleGenerate = async () => {
    if (audioPlayerRef.current) audioPlayerRef.current.src = '';
    if (customizedAudioPlayerRef.current) customizedAudioPlayerRef.current.src = '';
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (customizedAudioUrl) URL.revokeObjectURL(customizedAudioUrl);
    setAudioUrl('');
    setCustomizedAudioUrl('');

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
    showStatus('Generating base audio...', 'loading');
    
    let creditsRefund = 0;

    try {
      setUserCredits(prev => prev - characterCount);
      creditsRefund = characterCount;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmedText, voice: selectedVoice, narrativeSpeed: narrativeSpeed }),
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
          showStatus(`Base audio generated. ${characterCount.toLocaleString()} credits used.`, 'success');
          await applyCustomization(result.audioDataUri);
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

  const handlePreviewCustomization = async () => {
    if (!audioUrl) {
      showStatus('Please generate an audio clip first.', 'error');
      return;
    }
    await applyCustomization(audioUrl);
  };

  useEffect(() => {
    if (customizedAudioUrl && customizedAudioPlayerRef.current) {
      customizedAudioPlayerRef.current.play();
    }
  }, [customizedAudioUrl]);

  const handleDownload = async () => {
    if (!audioUrl) {
      showStatus('Error: Please generate audio before downloading.', 'error');
      return;
    }
    if (DOWNLOAD_COST > userCredits) {
      showStatus(`Error: Insufficient credits. Downloading requires ${DOWNLOAD_COST} credits.`, 'error');
      return;
    }

    setIsDownloading(true);
    showStatus('Applying final customizations and preparing download...', 'loading');
    
    let finalAudioUrl = customizedAudioUrl;
    const hasCustomization = customization.pitch !== 0 || customization.echo !== 0 || customization.reverb !== 0;

    if (!finalAudioUrl || hasCustomization) {
        const customizedResult = await applyCustomization(audioUrl);
        if(!customizedResult) {
            setIsDownloading(false);
            return;
        }
        finalAudioUrl = customizedResult;
    }
    
    setUserCredits(prev => prev - DOWNLOAD_COST);

    try {
      const link = document.createElement('a');
      link.href = finalAudioUrl;
      link.download = `geez-voice-${new Date().getTime()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showStatus(`Download started! ${DOWNLOAD_COST} credits were used.`, 'success');

    } catch (error: any) {
      showStatus(`Error: ${error.message}`, 'error');
      setUserCredits(prev => prev + DOWNLOAD_COST);
    } finally {
      setIsDownloading(false);
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
            body: JSON.stringify({ text: "ሰላም! ይህንን ድምፅ ናሙና እየሞከርክ ነው።", voice: voiceValue, narrativeSpeed: 1.0 }),
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
                <p className="text-muted-foreground mt-2 text-lg">Convert text, add expressions, and apply audio effects.</p>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="text-to-speak" className="text-sm font-medium text-muted-foreground">1. Enter your script</Label>
                    <Textarea ref={textareaRef} id="text-to-speak" rows={6} className="text-lg" placeholder="[Happy] Welcome to Geez Voice! Start typing here..." value={text} onChange={(e) => setText(e.target.value)} />
                    <div className="text-right text-sm text-muted-foreground mt-2">{characterCount.toLocaleString()} characters</div>
                </div>

                <div className='space-y-2'>
                    <Label className="text-sm font-medium text-muted-foreground">2. Add emotions to your script</Label>
                    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                        <div className="flex w-max space-x-2 p-2">
                            {expressions.map(expression => (
                                <Button key={expression.value} variant="outline" size="sm" onClick={() => insertEmotionTag(expression.label)}>
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

                <div className="space-y-4 pt-4">
                    <div className='space-y-2'>
                        <Label htmlFor="narrativeSpeed" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <GaugeCircle className="h-4 w-4" /> 4. Narrative Pace (Speed)
                        </Label>
                        <Slider
                            id="narrativeSpeed"
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={[narrativeSpeed]}
                            onValueChange={([val]) => setNarrativeSpeed(val)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Slower</span>
                            <span>Normal ({narrativeSpeed.toFixed(1)}x)</span>
                            <span>Faster</span>
                        </div>
                    </div>
                </div>

                <div className='space-y-6 pt-4 border-t'>
                   <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-primary" />
                        5. Customize Audio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className="grid gap-4">
                        <div className='space-y-2'>
                          <Label htmlFor="pitch">Pitch ({customization.pitch})</Label>
                          <Slider id="pitch" min={-10} max={10} step={1} value={[customization.pitch]} onValueChange={([val]) => setCustomization(c => ({...c, pitch: val}))} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Younger</span>
                              <span>Older</span>
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor="echo">Echo ({customization.echo})</Label>
                          <Slider id="echo" min={0} max={10} step={1} value={[customization.echo]} onValueChange={([val]) => setCustomization(c => ({...c, echo: val}))} />
                        </div>
                         <div className='space-y-2'>
                          <Label htmlFor="reverb">Reverb ({customization.reverb})</Label>
                          <Slider id="reverb" min={0} max={10} step={1} value={[customization.reverb]} onValueChange={([val]) => setCustomization(c => ({...c, reverb: val}))} />
                        </div>
                      </div>
                    </CardContent>
                   </Card>
                </div>
                
                <Button id="speak-button" className="w-full text-lg py-6" onClick={handleGenerate} disabled={isLoading || isCustomizing}>
                    {isLoading || isCustomizing ? (<Loader2 className="mr-2 h-6 w-6 animate-spin" />) : (<Volume2 className="mr-2 h-6 w-6" />)}
                    <span>Generate Audio ({characterCount.toLocaleString()} credits)</span>
                </Button>
                
                {(audioUrl || customizedAudioUrl) && (
                  <Card>
                      <CardHeader>
                        <CardTitle>Playback & Download</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                          {audioUrl && (
                            <div>
                                <Label className="text-xs text-muted-foreground">Original Audio</Label>
                                <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full h-10 mt-1"></audio>
                            </div>
                          )}
                          {customizedAudioUrl && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Customized Preview</Label>
                              <audio ref={customizedAudioPlayerRef} src={customizedAudioUrl} controls className="w-full h-10 mt-1" autoPlay></audio>
                            </div>
                          )}
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row gap-4">
                         <Button onClick={handlePreviewCustomization} disabled={!audioUrl || isCustomizing} className="w-full">
                            {isCustomizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Preview Changes
                        </Button>
                        <Button onClick={handleDownload} disabled={!audioUrl || isDownloading} className="w-full">
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Download ({DOWNLOAD_COST.toLocaleString()} credits)
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
