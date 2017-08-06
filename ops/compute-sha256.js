
const crypto = require('crypto');
const fs = require('fs');

const OUTPUT_NAME = 'LambdaCodeSha256';
const fileStream = fs.createReadStream(process.argv[2]);

computeSha256(fileStream)
    .then(sha256 => {
        console.log(JSON.stringify({[OUTPUT_NAME]: sha256}));
    })
    .catch(e => {
        setTimeout(() => {
            throw e;
        }, 0);
    });

function computeSha256(fileStream) {
    const shasum = crypto.createHash('sha256');
    fileStream.on('data', chunk => {
        shasum.update(chunk);
    });
    return new Promise((resolve, reject) => {
        fileStream.on('error', e => reject(e));
        fileStream.on('end', () => {
            resolve(shasum.digest('base64'));
        });
    });
}
