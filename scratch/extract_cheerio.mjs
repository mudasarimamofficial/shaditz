import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('../shaditz_fiverr-profile-data.html', 'utf8');
const $ = cheerio.load(html);

console.log("=== PROFILE ===");
// Find profile image (look for image near profile info)
const imgs = $('img').map((i, el) => $(el).attr('src')).get();
const fiverrImgs = imgs.filter(src => src && src.includes('fiverr-res.cloudinary.com'));
console.log("Profile Images:", Array.from(new Set(fiverrImgs)).slice(0, 5));

console.log("\n=== ABOUT ME ===");
// Usually the description or bio section
const aboutTexts = [];
$('div, p, span').each((i, el) => {
  const text = $(el).text();
  if (text.includes('About me') && text.length > 20 && text.length < 5000) {
    aboutTexts.push(text.replace(/\s+/g, ' '));
  }
});
console.log("About text candidates:", aboutTexts.slice(0, 2));

console.log("\n=== REVIEWS ===");
const reviews = [];
// Find text that looks like a review, maybe containing stars or specific names
$('*').each((i, el) => {
  const text = $(el).text();
  if (text.includes('ewoffindin44') && text.length < 1000) {
    reviews.push(text.replace(/\s+/g, ' '));
  }
});
console.log("Review snippets:", Array.from(new Set(reviews)).slice(0, 3));
