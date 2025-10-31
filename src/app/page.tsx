'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-cyan-400">Amharic AI Tools</h1>
        <p className="text-gray-400 mt-4 text-lg md:text-xl font-amharic">በአርቴፊሻል ኢንተለጀንስ የሚሰሩ የአማርኛ መሳሪያዎች</p>
      </div>

      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700 hover:border-cyan-500 transition-colors duration-300">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-2xl text-cyan-400">Amharic Text to Speech</CardTitle>
              <CardDescription className="text-gray-400 font-amharic">
                የጽሑፍን ወደ ንግግር መለወጫ
              </CardDescription>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
                <Mic className="h-6 w-6 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-6 font-amharic">
              ማንኛውንም የአማርኛ ወይም የእንግሊዝኛ ጽሑፍ ወደ ተፈጥሯዊ ንግግር ይለውጡ። ከተለያዩ የድምፅ አማራጮች ይምረጡ።
            </p>
            <Link href="/tts" passHref>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg">
                <span className="font-amharic">መሳሪያውን ተጠቀም</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

       <footer className="mt-16 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Amharic AI Tools. All Rights Reserved.</p>
       </footer>
    </div>
  );
}
