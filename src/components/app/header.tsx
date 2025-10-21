import { MessageCircleHeart } from 'lucide-react';

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto flex items-center gap-2">
        <MessageCircleHeart className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">AvatarTalk</h1>
      </div>
    </header>
  );
}
