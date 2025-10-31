'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mic, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4">
      <div className="text-center mb-12 max-w-4xl">
         <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight">
          Geez Voice
        </h1>
        <p className="text-muted-foreground mt-4 text-lg md:text-xl font-amharic">
          በአርቴፊሻል ኢንተለጀንስ የሚሰራ የድምፅ ልምምድ
        </p>
         <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          A suite of powerful, AI-driven tools designed for high-quality voice synthesis and language applications.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 max-w-md w-full">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                <Link href="/tts" className="hover:underline">
                  Text to Speech
                </Link>
              </CardTitle>
              <CardDescription className="font-amharic">
                የጽሑፍን ወደ ንግግር መለወጫ
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6 font-amharic">
              ማንኛውንም ጽሑፍ ወደ ተፈጥሯዊ ንግግር ይለውጡ። ከተለያዩ የድምፅ አማራጮች ይምረጡ።
            </p>
            <Link href="/tts" passHref>
              <Button className="w-full text-lg">
                <span className="font-amharic">መሳሪያውን ተጠቀም</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
