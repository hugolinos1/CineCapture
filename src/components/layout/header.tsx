'use client';

import Link from 'next/link';
import { Clapperboard, Film, Search, User, LogOut, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';


export default function Header() {
  const auth = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue !',
      });
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: "Impossible de se connecter avec Google. Veuillez réessayer.",
      });
    }
  };
  
  const handleAnonymousSignIn = async () => {
    if (!auth) return;
    try {
      await signInAnonymously(auth);
      toast({
        title: 'Connecté en tant qu\'anonyme',
        description: 'Vous naviguez en mode invité.',
      });
    } catch (error) {
      console.error("Erreur lors de la connexion anonyme :", error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter en mode anonyme.',
      });
    }
  };


  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Déconnexion réussie',
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
       toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de se déconnecter. Veuillez réessayer.",
      });
    }
  };

  const handleChangeAccount = async () => {
    await handleSignOut();
    // No need to call sign-in functions here, user will be presented with sign-in options
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Clapperboard className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">CineCapture</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-4">
          <Link
            href="/library"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Ma Bibliothèque
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <div className="w-full max-w-sm hidden md:block">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Rechercher dans la bibliothèque..."
                className="pl-8"
                />
            </div>
          </div>
           <div className='flex items-center gap-2'>
              <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className='md:hidden'>
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Rechercher</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='p-2 w-[calc(100vw-2rem)]'>
                     <Input type="search" placeholder="Rechercher..." />
                </PopoverContent>
            </Popover>

            {loading ? (
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Utilisateur'} />
                        <AvatarFallback>
                          <User />
                        </AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.isAnonymous ? 'Utilisateur Anonyme' : user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.isAnonymous ? 'ID: ' + user.uid.substring(0, 8) : user.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleChangeAccount}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Changer de compte</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      Se connecter
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                     <DropdownMenuItem onClick={handleGoogleSignIn}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Connexion avec Google</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={handleAnonymousSignIn}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Connexion anonyme</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
           </div>
        </div>
      </div>
    </header>
  );
}
