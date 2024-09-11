'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { navLinks } from '@/constants';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const MobileNav = () => {
  const pathName = usePathname();

  return (
    <header className="header">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/assets/images/logo-text.svg" width={180} height={28} alt="logo" />
      </Link>

      <nav className="flex gap-2">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />

          <Sheet>
            <SheetTrigger>
              <Image
                src="/assets/icons/menu.svg"
                width={32}
                height={32}
                alt="menu"
                className="cursor-pointer"
              />
            </SheetTrigger>
            <SheetContent className="sheet-content sm:w-64">
              <>
                <Image src="/assets/images/logo-text.svg" width={152} height={23} alt="logo" />

                <ul className="header-nav)elements">
                  {navLinks.map((link) => {
                    const isActive = link.route === pathName;
                    return (
                      <li
                        key={link.route}
                        className={cn(
                          'p-18 flex whitespace-nowrap text-dark-700',
                          isActive && 'gradient-text',
                        )}
                      >
                        <Link className="sidebar-link" href={link.route} key={link.route}>
                          <Image src={link.icon} alt="nav-icon" width={24} height={24} />
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            </SheetContent>
          </Sheet>
        </SignedIn>

        <SignedOut>
          <Button asChild className="button bg-purple-gradient bg-cover">
            <Link href="/sign-in">Login</Link>
          </Button>
        </SignedOut>
      </nav>
    </header>
  );
};

export default MobileNav;
