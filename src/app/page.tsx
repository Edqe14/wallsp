'use client';

import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from '@/components/ui/dialog';
import { MultiSelect } from '@/components/ui/multi-select';
import SOURCES from '@/lib/sources.json';
import { bytesToSize, capitalize } from '@/lib/utils';
import { DialogDescription } from '@radix-ui/react-dialog';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [sources, setSources] = useState<string[]>(
    SOURCES.map((source) => source.repo)
  );

  const [tags, setTags] = useState(
    SOURCES.flatMap((source) => (source.root ? [] : source.collections))
  );

  const images = useMemo(() => {
    return (
      SOURCES
        //filter source repo
        .filter((source) => sources.includes(source.repo))
        .flatMap((source) =>
          source.collections
            // filter tag collection
            .filter((col) => (!source.root ? tags.includes(col) : true))
            .flatMap((cols) =>
              source.images[cols as keyof typeof source.images]?.flatMap(
                (img) => (
                  <Dialog key={img.url}>
                    <DialogTrigger>
                      <picture className="backdrop-blur-sm cursor-pointer overflow-hidden h-full hover:z-10 relative grid place-items-center transition-all rounded duration-300 ease-in-out group hover:rounded-md hover:scale-105 lg:hover:scale-110 hover:opacity-[100_!important] group-hover:opacity-40">
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

                        <Image
                          src={img.download_url}
                          width={640}
                          height={0}
                          alt={img.name}
                          className="w-full h-full object-cover"
                          // loader={({ src }) =>
                          //   `/api/preview?url=${encodeURIComponent(src)}`
                          // }
                          draggable={false}
                        />
                      </picture>
                    </DialogTrigger>

                    <DialogContent
                      className="overflow-hidden p-0 gap-0"
                      closeClassName="bg-secondary border border-secondary"
                    >
                      <DialogHeader>
                        <Image
                          src={img.download_url}
                          width={640}
                          height={0}
                          alt={img.name}
                          className="w-full"
                          draggable={false}
                          // loader={({ src }) =>
                          //   `/api/preview?url=${encodeURIComponent(src)}`
                          // }
                        />
                      </DialogHeader>

                      <DialogDescription className="p-3">
                        <section className="flex justify-between items-start">
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
                          </div>

                          <div>
                            <a href={img.download_url} download={img.name}>
                              <Button>
                                <Download /> Download
                              </Button>
                            </a>
                          </div>
                        </section>
                      </DialogDescription>
                    </DialogContent>
                  </Dialog>
                )
              )
            )
        )
    );
  }, [sources, tags]);

  return (
    <main className="min-h-[100svh] flex justify-center px-8">
      <section className="max-w-screen-lg flex-grow pb-8">
        <nav className="flex justify-between py-4 px-4 sticky top-0 z-20">
          <p className="font-bold text-lg bg-primary text-secondary h-min px-1">
            Wallpapers
          </p>

          <div className="flex gap-1">
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
          {images}
        </section>
      </section>
    </main>
  );
}
