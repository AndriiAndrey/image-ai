'use client';

import Link from 'next/link';
import Image from 'next/image';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

import { navLinks } from '@/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const pathName = usePathname();

  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        <Link href="/" className="sidebar-logo">
          <Image src="/assets/images/logo-text.svg" alt="Logo" width={180} height={180} />
        </Link>
        <nav className="sidebar-nav">
          <SignedIn>
            <ul className="sidebar-nav_elements">
              {navLinks.slice(0, 6).map((link) => {
                const isActive = link.route === pathName;
                return (
                  <li
                    key={link.route}
                    className={cn(
                      'sidebar-nav_element group',
                      isActive ? 'bg-purple-gradient text-white' : 'text-gray-700',
                    )}
                  >
                    <Link className="sidebar-link" href={link.route} key={link.route}>
                      <Image
                        src={link.icon}
                        alt="nav-icon"
                        width={24}
                        height={24}
                        className={cn(isActive && 'brightness-200')}
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="sidebar-nav_elements">
              {navLinks.slice(6).map((link) => {
                const isActive = link.route === pathName;
                return (
                  <li
                    key={link.route}
                    className={cn(
                      'sidebar-nav_element group',
                      isActive ? 'bg-purple-gradient text-white' : 'text-gray-700',
                    )}
                  >
                    <Link className="sidebar-link" href={link.route} key={link.route}>
                      <Image
                        src={link.icon}
                        alt="nav-icon"
                        width={24}
                        height={24}
                        className={cn(isActive && 'brightness-200')}
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}

              <li className="flex cursor-pointer items-center gap-2 p-4">
                <UserButton afterSignOutUrl="/" showName />
              </li>
            </ul>
          </SignedIn>

          <SignedOut>
            <Button asChild className="button bg-purple-gradient bg-cover">
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
