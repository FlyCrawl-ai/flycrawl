/**
 * FlyCrawl Quickstart Example (Node.js)
 */
import { FlyCrawl } from '@flycrawl/sdk';

const apiKey = process.env.FLYCRAWL_API_KEY || 'fc_live_demo';
const flycrawl = new FlyCrawl({ apiKey });

async function main() {
  console.log('Scraping GitHub trending ...');
  const doc = await flycrawl.scrape({
    url: 'https://github.com/trending',
    formats: ['markdown'],
    onlyMainContent: true
  });

  console.log('Title:', doc.metadata.title);
  console.log('Content preview:\n', doc.markdown?.slice(0, 300));
}

main().catch(console.error);
