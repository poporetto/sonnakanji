import type { APIRoute } from 'astro';
import { allKanji, slugOf, type Kanji } from '../../../lib/kanji';
import { shareImage } from '../../../lib/share-image';

export const getStaticPaths = () => allKanji.map((k, index) => ({ params: { slug: slugOf(k.kanji) }, props: { k, index } }));

export const GET: APIRoute<{ k: Kanji; index: number }> = async ({ props }) =>
  new Response(new Uint8Array(await shareImage(props.k, props.index)), { headers: { 'Content-Type': 'image/jpeg' } });
