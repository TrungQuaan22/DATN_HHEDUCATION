const fs = require('fs');
const path = require('path');
const https = require('https');

const designs = [
  {
    name: 'student_assessment_detail',
    htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NDdhMTc5ZGYzZGMwODhlOGU4OTI4MDExYjY1EgsSBxCc2uOTgQ0YAZIBIwoKcHJvamVjdF9pZBIVQhMyMjU5NDExMzI4ODM0MDUwNjY1&filename=&opi=89354086',
    imgUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLsxwQJMtR6X1HBCZKy7Q_AM8iF5QS0YrV0iZMiFArwAaJUguK2CBZRrwA-3rpQwFeSmqyyzlp06-lBuzXc_k95uFqhKGVIWVHkgqF-x3CBo3Gb9qjtL0kSMMeknD6T-GGBkG_aSFJBueR7h_F3D0ZlOPnq3uEYg_KF7_kso8XMz0WDInLXHzSddGfJgo5s8wcdR7ok0pbAZ_Ps8bnh3NB8-qA8lxqNWa3VW96KM_Sd7PrDoVPpmJGfLL9s=w2560'
  },
  {
    name: 'student_online_exam_room',
    htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NDdhMWY1OTA2ZmEwMmE5YjQ5Nzc1M2QwN2YwEgsSBxCc2uOTgQ0YAZIBIwoKcHJvamVjdF9pZBIVQhMyMjU5NDExMzI4ODM0MDUwNjY1&filename=&opi=89354086',
    imgUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLspCLU-uBlPmTREe1LNg685HlNXAWsZafKsCJyzoTmOS5rIsPNA1z2cI9MfvH0XGb3PVrsayFlhPpAZdNF3wgvf4FsTvs-WUYKny9cyHvS0lIo8bNB86W4fcZX7NEJS9eS1XI5yfynO3QIGixgECKwwnopXar_A_L1D0ONwXs4jQl801NiiZkwFUpDa2gWgGX1SGCIJTLzqynqvlRilmWkOiqlYBARcBINDluo8k116AxL7MOKs-DyfX08=w2560'
  },
  {
    name: 'student_quiz_workspace',
    htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NDdhNTFmNDA2NmYwMzM4NDkzMGE4MmU1N2YwEgsSBxCc2uOTgQ0YAZIBIwoKcHJvamVjdF9pZBIVQhMyMjU5NDExMzI4ODM0MDUwNjY1&filename=&opi=89354086',
    imgUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLvaTmt-9CJW1Whrh57xNfKIh5s43eEeJEuAUd0f1i0xq5-f0Y-KHFBtGbVkkhDDJryuT41mCJ27u1VuiFWlatYMIrdg3iRspgcA2EGXPF5k2eCQdQdTj78FCLbbgP7UtzUfZuuGvH_yQgTLV74-kWdSc5JtwVAxFpM2EjHbZxwCUs2ijofblxWSo90H2A94Kkz-mbZfEqQ5U1NEDPR22rcP-CcAo8I-LiTcRoksN82n-zycfufi8nTz9Bc=w2560'
  }
];

const targetDir = path.join(__dirname, '..', '.stitch', 'designs');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const d of designs) {
    const htmlPath = path.join(targetDir, `${d.name}.html`);
    const pngPath = path.join(targetDir, `${d.name}.png`);
    
    console.log(`Downloading ${d.name} HTML...`);
    await download(d.htmlUrl, htmlPath);
    console.log(`Saved to ${htmlPath}`);

    console.log(`Downloading ${d.name} PNG...`);
    await download(d.imgUrl, pngPath);
    console.log(`Saved to ${pngPath}`);
  }
  console.log('All downloads complete!');
}

main().catch(err => {
  console.error('Error in download script:', err);
  process.exit(1);
});
