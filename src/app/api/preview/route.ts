import { unstable_cache as cache } from 'next/cache';
import { extractEtag, optimizeImage } from 'next/dist/server/image-optimizer';
import { NextResponse, type NextRequest } from 'next/server';

const optimize = cache(
  async (href) => {
    const res = await fetch(href);

    const buffer = Buffer.from(await res.arrayBuffer());
    const etag = extractEtag(res.headers.get('ETag'), buffer);

    const optimized = await optimizeImage({
      buffer,
      contentType: 'WEBP',
      quality: 70,
      width: 640,
    });

    return { optimized, etag };
  },
  ['optimized-image'],
  {
    revalidate: 31536000,
  }
);

// reconstruction of next/image backend
export const GET = async (req: NextRequest) => {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  const { optimized, etag } = await optimize(url);

  return new NextResponse(optimized, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      ETag: etag,
    },
  });
};
