// Create By BotzAku tim t.me/BotzAku & iky.botzaku.eu.org

const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeKomik(judul) {
    try {
        const url = `https://komikcast.cz/?s=${encodeURIComponent(judul)}`;
        const response = await axios.get(url, {
        headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        const $ = cheerio.load(response.data);
        
        const links = [];
        $('.list-update_items a').each((index, element) => {
            const link = $(element).attr('href');
            if (link) {
                links.push(link);
            }
        });

        const topLinks = links.slice(0, 5);
        const results = [];
        for (const link of topLinks) {
            try {
                const detailResponse = await axios.get(link);
                const $$ = cheerio.load(detailResponse.data);
                const title = $$('title').text().trim();
                const originalTitle = $$('.komik_info-content-native').text().trim();
                const genres = $$('.komik_info-content-genre .genre-item').map((i, el) => $$(el).text().trim()).get().join(', ');
                const released = $$('.komik_info-content-info-release').text().replace('Released:', '').trim();
                const author = $$('.komik_info-content-info').filter((i, el) => $$(el).text().includes('Author:')).text().replace('Author:', '').trim();
                const status = $$('.komik_info-content-info').filter((i, el) => $$(el).text().includes('Status:')).text().replace('Status:', '').trim();
                const type = $$('.komik_info-content-info-type a').text().trim();
                const totalChapters = $$('.komik_info-content-info').filter((i, el) => $$(el).text().includes('Total Chapter:')).text().replace('Total Chapter:', '').trim();
                const updatedOn = $$('.komik_info-content-update time').text().trim();
                const rating = $$('.data-rating strong').text().replace('Rating ', '').trim();
                const sinopsis = $$('.komik_info-description-sinopsis').text().trim();
                
                results.push({
                    title,
                    originalTitle,
                    genres,
                    released,
                    author,
                    status,
                    type,
                    totalChapters,
                    updatedOn,
                    rating,
                    sinopsis,
                    link
                });
            } catch (error) {
                console.log(`Error loading detail page: ${link} - ${error.message}`);
            }
        }
        return results;
    } catch (error) {
        console.log(error);
    }
}

async function scrapeChapters(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const chapters = [];
        $('.chapter-link-item').each((index, element) => {
            const chapterTitle = $(element).text().trim();
            const chapterLink = $(element).attr('href');
            if (chapterTitle && chapterLink) {
                chapters.push({ title: chapterTitle, link: chapterLink });
            }
        });
        if (chapters.length === 0) {
            throw new Error('No chapters found.');
        }
        const message = chapters.map(chapter => `${chapter.title}\n${chapter.link}`).join('\n\n');
        return message;
    } catch (error) {
        console.log(error);
        throw new Error('An error occurred while scraping the data.');
    }
}

async function imageComic(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const imageUrls = [];
        $('.main-reading-area img').each((index, element) => {
            const imageUrl = $(element).attr('src');
            if (imageUrl) {
                imageUrls.push(imageUrl);
            }
        });
        return imageUrls;
    } catch (error) {
        console.log(error);
        throw new Error('An error occurred while scraping the data.');
    }
}

module.exports = { 
      imageComic, 
      scrapeChapters,
      scrapeKomik,
};

/* use scrapeKomik:
const { scrapeKomik } = require('./komik.js');

async function searchComic(judul) {
    try {
        const results = await scrapeKomik(judul);
        console.log(results);
    } catch (error) {
        console.error('Terjadi kesalahan saat mencari komik:', error.message);
    }
}

// Contoh penggunaan
searchComic('Naruto');

/*

/* use scrapeChapters
const { scrapeChapters } = require('./komik.js');

async function getChapters(url) {
    try {
        const chapters = await scrapeChapters(url);
        console.log(chapters);
    } catch (error) {
        console.error('Terjadi kesalahan saat mendapatkan chapter:', error.message);
    }
}

// Contoh penggunaan
getChapters('https://komikcast.cz/komik/naruto');
/*

/* use imageComic
const { imageComic } = require('./komik.js');

async function getComicImages(url) {
    try {
        const images = await imageComic(url);
        console.log('URL gambar:', images);
    } catch (error) {
        console.error('Terjadi kesalahan saat mendapatkan gambar komik:', error.message);
    }
}

// Contoh penggunaan
getComicImages('https://komikcast.cz/komik/naruto/chapter-1');
/*