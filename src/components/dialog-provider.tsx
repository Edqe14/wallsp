'use client';

import type { GithubContentResponse } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { bytesToSize } from '@/lib/utils';
import { Download, Loader } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { create } from 'zustand';
import { saveAs } from 'file-saver';
import { combine } from 'zustand/middleware';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useState } from 'react';

type Data = {
  image: GithubContentResponse;
  source: {
    repo: string;
    root: boolean;
  };
  collection: string;
};

export const useDialog = create(
  combine(
    {
      data: null as Data | null,
      open: false
    },
    (set) => {
      return {
        setData: (data: Data | null) => set({ data }),
        setOpen: (open: boolean) => set({ open }),
        close: () => set({ data: null, open: false }),
        openDialog: (data: Data) => set({ data, open: true })
      };
    }
  )
);

export const DialogProvider = () => {
  const { data, open, close } = useDialog();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const download = async () => {
    if (!data) return;

    setProgress(0);
    setDownloading(true);

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const res = await fetch(data.image.download_url!);
    const reader = res.body?.getReader();

    if (!reader) return;

    const array = new Uint8Array(data.image.size);
    let count = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await reader.read();
      if (done) break;

      array.set(value, count);
      count += value.length;
      setProgress((count / data.image.size) * 100);
    }

    saveAs(new Blob([array]), data.image.name);
    setDownloading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(stat) => !stat && close()}>
      {data && (
        <DialogContent
          className="overflow-hidden p-0 gap-0"
          closeClassName="bg-secondary border border-secondary"
        >
          <DialogHeader className="relative">
            <Image
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              src={data.image.download_url!}
              width={640}
              height={0}
              alt={data.image.name}
              className="w-full h-full object-contain z-[1]"
              draggable={false}
              loader={({ src, width, quality }) =>
                `https://img.toritori.shop/pr:sharp/rs:auto:${width}/f:webp/q:${quality || 70}/plain/${encodeURIComponent(src)}`
              }
            />
          </DialogHeader>

          <section className="p-3 overflow-hidden">
            <section className="flex justify-between items-start overflow-hidden">
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight mb-3 max-w-72 overflow-hidden text-ellipsis">
                  {data.image.name}
                </DialogTitle>

                <div className="flex gap-1">
                  <Badge variant="secondary" className="border border-zinc-700">
                    {data.source.repo}
                  </Badge>

                  <Badge variant="secondary" className="border border-zinc-700">
                    {bytesToSize(data.image.size)}
                  </Badge>

                  {!data.source.root && (
                    <Badge
                      variant="secondary"
                      className="border border-zinc-700 capitalize"
                    >
                      {data.collection}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button disabled={downloading} onClick={download}>
                  {!downloading ? (
                    <>
                      <Download /> Download
                    </>
                  ) : (
                    <>
                      <Loader className="animate-spin" /> {Math.round(progress)}
                      %
                    </>
                  )}
                </Button>
              </div>
            </section>
          </section>
        </DialogContent>
      )}
    </Dialog>
  );
};
