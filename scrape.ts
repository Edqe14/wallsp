import { sources } from '@/sources';
import path from 'node:path/posix';
import fs from 'node:fs/promises';
import type { GithubContentResponse } from '@/lib/types';

const imageFileRegex = /\.(jpe?g|png|gif|webp)$/i;
const getContentsUrl = (repo: string, path = '') =>
  `https://api.github.com/repos/${repo}/contents/${path}`;

const main = async () => {
  const contents = await Promise.all(
    sources.map(async (source) => ({
      repo: source.repo,
      root: !source.indexDirectory,
      paths: source.paths,
      collections: source.indexDirectory
        ? await fetch(
            getContentsUrl(source.repo, source.paths?.join('/') ?? '')
          )
            .then((r) => r.json() as Promise<GithubContentResponse[]>)
            .then((i) =>
              i
                .filter((v) => v.type === 'dir' && !v.name.startsWith('.'))
                .map((v) => v.path)
            )
        : [''],
    }))
  );

  const images = await Promise.all(
    contents.map(async (source, i) => ({
      ...source,
      images: Object.fromEntries(
        await Promise.all(
          source.collections.map(
            async (collection) =>
              await fetch(
                getContentsUrl(
                  source.repo,
                  path.join(source.paths?.join('/') ?? '', collection)
                )
              )
                .then((r) => r.json() as Promise<GithubContentResponse[]>)
                .then((i) =>
                  i.filter(
                    (v) => v.type === 'file' && imageFileRegex.test(v.name)
                  )
                )
                .then((v) => [collection, v] as const)
          )
        )
      ),
    }))
  );

  await fs.writeFile(
    path.resolve('./src/lib/sources.json'),
    JSON.stringify(images, null, 2)
  );

  console.log(images);
};

main();
