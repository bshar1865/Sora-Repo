async function searchResults(keyword) {
    try {
        const encodedKeyword = keyword.trim().split(/\s+/).join('+'); // Replace spaces with +
        const res = await fetch(`https://anime4up.rest/?search_param=animes&s=${encodedKeyword}`);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const cards = [...doc.querySelectorAll('.anime-card')];
        const results = cards.map(card => ({
            title: card.querySelector('.anime-title')?.textContent.trim(),
            image: card.querySelector('img')?.src,
            href: card.querySelector('a')?.href
        }));

        return JSON.stringify(results);
    } catch (err) {
        console.error("searchResults error:", err);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const description = doc.querySelector('.anime-story')?.textContent.trim() || 'No description';
        const year = doc.querySelector('.anime-date')?.textContent.trim() || 'Unknown';

        return JSON.stringify([{
            description,
            aliases: `Year: ${year}`,
            airdate: `Released: ${year}`
        }]);
    } catch (err) {
        console.error("extractDetails error:", err);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Year: Unknown',
            airdate: 'Released: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const episodes = [...doc.querySelectorAll('.episodes li a')].map(ep => ({
            number: ep.textContent.trim(),
            href: ep.href
        }));

        return JSON.stringify(episodes);
    } catch (err) {
        console.error("extractEpisodes error:", err);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const iframes = [...doc.querySelectorAll('iframe')];
        const sources = [];

        for (let frame of iframes) {
            const src = frame.getAttribute('src');
            if (src) {
                sources.push({
                    stream: src.includes('.m3u8') ? src : null,
                    quality: 'unknown',
                    subtitles: null
                });
            }
        }

        return JSON.stringify(sources);
    } catch (err) {
        console.error("extractStreamUrl error:", err);
        return JSON.stringify([{ stream: null, subtitles: null }]);
    }
}
