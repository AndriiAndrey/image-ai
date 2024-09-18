import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Collection from '@/components/shared/Collection';
import { navLinks } from '@/constants';
import { SearchParamProps } from '@/types';
import { getAllImages } from '@/lib/actions/image.actions';

const Home: FC<SearchParamProps> = async ({ searchParams }) => {
  const page = Number(searchParams.page) || 1;
  const searchQuery = String(searchParams.query || '');

  const images = await getAllImages({ page, searchQuery });

  return (
    <>
      <section className="home">
        <h1 className="home-heading">Unleash Your Creative Vision with Image-AI</h1>

        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link key={link.route} href={link.route} className="flex-center flex-col gap-2">
              <li className="flex-center w-fit rounded-full bg-primary-foreground p-4">
                <Image src={link.icon} alt="nav-logo" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-primary-foreground">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
        <Collection hasSearch images={images?.data} totalPages={images?.totalPages} page={page} />
      </section>
    </>
  );
};

export default Home;
