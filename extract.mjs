import fs from 'fs';

const html = fs.readFileSync('./shaditz_fiverr-profile-data.html', 'utf8');

const imgRegex = /<img[^>]+src="([^">]+)"/g;
const urls = new Set();
let match;
while ((match = imgRegex.exec(html)) !== null) {
  urls.add(match[1]);
}

const urlArray = Array.from(urls).filter(u => u.includes('http'));
console.log("Images found:");
console.log(urlArray.join('\n'));

// Let's also try to find the bio text if it's in a specific class or we can just print surrounding text of "About me"
const aboutMatch = html.match(/.{0,100}About me.{0,500}/i);
if (aboutMatch) {
  console.log("\nAbout me context:");
  console.log(aboutMatch[0]);
}

const skillsMatch = html.match(/.{0,100}Skills.{0,500}/i);
if (skillsMatch) {
  console.log("\nSkills context:");
  console.log(skillsMatch[0]);
}

const reviewsMatch = html.match(/.{0,100}ewoffindin44.{0,500}/i);
if (reviewsMatch) {
  console.log("\nReview context:");
  console.log(reviewsMatch[0]);
}
