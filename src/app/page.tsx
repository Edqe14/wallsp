'use client';

import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select';
import SOURCES from '@/lib/sources.json';
import { bytesToSize, capitalize, formatNumber } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDialog } from '@/components/dialog-provider';

export default function Home() {
  const openDialog = useDialog((state) => state.openDialog);

  const [endOffset, setEndOffset] = useState(50);
  const [sources, setSources] = useState<string[]>(
    SOURCES.map((source) => source.repo)
  );
  const [tags, setTags] = useState(
    SOURCES.flatMap((source) => (source.root ? [] : source.collections))
  );
  const allTagsLength = useMemo(
    () =>
      SOURCES.flatMap((source) => (source.root ? [] : source.collections))
        .length,
    []
  );
  const isAllTags = useMemo(
    () => tags.length === allTagsLength,
    [tags, allTagsLength]
  );

  useEffect(() => {
    const handler = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setEndOffset((prev) => prev + 50);
      }
    };

    window.addEventListener('scroll', handler);

    return () => {
      window.removeEventListener('scroll', handler);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const images = useMemo(() => {
    return (
      SOURCES
        //filter source repo
        .filter((source) => sources.includes(source.repo))
        .flatMap((source) =>
          source.collections
            // filter tag collection
            .filter((col) => {
              if (isAllTags) return true;

              return tags.includes(col);
            })
            .flatMap((cols) =>
              source.images[cols as keyof typeof source.images]?.flatMap(
                (img) => (
                  <picture
                    onClick={() =>
                      openDialog({
                        image: img,
                        source: source,
                        collection: cols
                      })
                    }
                    onKeyDown={() =>
                      openDialog({
                        image: img,
                        source: source,
                        collection: cols
                      })
                    }
                    key={img.url}
                    className="backdrop-blur-sm cursor-pointer overflow-hidden h-full hover:z-10 relative grid place-items-center transition-all rounded duration-300 ease-in-out group hover:rounded-md hover:scale-105 lg:hover:scale-110 hover:opacity-[100_!important] group-hover:opacity-40"
                  >
                    <div className="absolute inset-0 px-1 py-1 z-[5] transition-all duration-300 ease-out blur-md opacity-0 hover:blur-0 hover:opacity-100">
                      <div className="flex gap-1">
                        <Badge
                          variant="secondary"
                          className="border border-zinc-700"
                        >
                          {source.repo}
                        </Badge>

                        <Badge
                          variant="secondary"
                          className="border border-zinc-700"
                        >
                          {bytesToSize(img.size)}
                        </Badge>

                        {!source.root && (
                          <Badge
                            variant="secondary"
                            className="border border-zinc-700 capitalize"
                          >
                            {cols}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Skeleton className="w-full h-full absolute inset-0" />

                    <Image
                      src={img.download_url}
                      width={640}
                      height={0}
                      alt={img.name}
                      className="w-full h-full object-cover z-[1]"
                      loader={({ src, width, quality }) =>
                        `https://fio.edqe.me/o?src=${encodeURIComponent(src)}&w=${width}&format=webp&q=${quality || 70}`
                      }
                      draggable={false}
                    />
                  </picture>
                )
              )
            )
        )
    );
  }, [sources, tags]);

  return (
    <main className="min-h-[100svh] flex justify-center px-8">
      <section className="max-w-screen-lg flex-grow pb-8">
        <nav className="flex justify-between py-4 px-4 sticky items-center top-0 z-20">
          <p className="font-bold text-lg bg-primary text-secondary h-min px-1 tracking-tighter">
            WALLSP
          </p>

          <p className="text-sm text-secondary-foreground bg-primary-foreground absolute left-1/2 -translate-x-1/2 px-1 tracking-tighter">
            Showing {formatNumber(images.length)} images
          </p>

          <div className="flex gap-1 items-center">
            <MultiSelect
              label={
                <>
                  Tags{' '}
                  <Badge variant="secondary" className="px-1">
                    {tags.length}
                  </Badge>
                </>
              }
              options={SOURCES.flatMap((source) =>
                source.root ? [] : source.collections
              ).map((source) => ({
                label: capitalize(source),
                value: source
              }))}
              defaultValue={tags}
              onValueChange={setTags}
            />
            <MultiSelect
              label={
                <>
                  Source{' '}
                  <Badge variant="secondary" className="px-1">
                    {sources.length}
                  </Badge>
                </>
              }
              options={SOURCES.map((source) => ({
                label: source.repo,
                value: source.repo
              }))}
              defaultValue={sources}
              onValueChange={setSources}
            />
          </div>
        </nav>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 group gap-1">
          {images.slice(0, endOffset)}
        </section>
      </section>
    </main>
  );
}
