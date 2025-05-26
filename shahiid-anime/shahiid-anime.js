async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://shahiid-anime.net/?s=${encodedKeyword}`);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const items = [...doc.querySelectorAll('.item-thumb')];
        const results = items.map(item => {
            const title = item.querySelector('a').getAttribute('title') || '';
            const href = item.querySelector('a').href;
            const image = item.querySelector('img').src;
            return { title, image, href };
        });

        return JSON.stringify(results);
    } catch (error) {
        console.error('Search error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const description = doc.querySelector('.anime-description')?.textContent.trim() || 'No description available';
        const duration = doc.querySelector('.anime-duration')?.textContent.trim() || 'Unknown';
        const airdate = doc.querySelector('.anime-airdate')?.textContent.trim() || 'Unknown';

        return JSON.stringify([{
            description,
            aliases: `Duration: ${duration}`,
            airdate: `Aired: ${airdate}`
        }]);
    } catch (error) {
        console.error('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Aired: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const episodeElements = [...doc.querySelectorAll('.episodes-list a')];

        const episodes = episodeElements.map(ep => ({
            href: ep.href,
            number: ep.textContent.trim().match(/\d+/)?.[0] || ''
        }));

        return JSON.stringify(episodes);
    } catch (error) {
        console.error('Episodes error:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const iframe = doc.querySelector('iframe');
        const stream = iframe ? iframe.src : null;

        return JSON.stringify({
            stream,
            subtitles: null
        });
    } catch (error) {
        console.error('Stream error:', error);
        return JSON.stringify({ stream: null, subtitles: null });
    }
}
