const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const COLLECTIONS_DIR = path.join(ROOT_DIR, 'collections');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function generateProducts() {
    if (!fs.existsSync(COLLECTIONS_DIR)) {
        console.log('No collections directory found.');
        return;
    }

    const collections = fs.readdirSync(COLLECTIONS_DIR);

    for (const collectionDir of collections) {
        const collectionPath = path.join(COLLECTIONS_DIR, collectionDir);
        if (!fs.statSync(collectionPath).isDirectory()) continue;

        const subcollectionsDir = path.join(collectionPath, 'subcollections');
        if (!fs.existsSync(subcollectionsDir) || !fs.statSync(subcollectionsDir).isDirectory()) continue;

        const subcollections = fs.readdirSync(subcollectionsDir);

        for (const subDir of subcollections) {
            const subPath = path.join(subcollectionsDir, subDir);
            if (!fs.statSync(subPath).isDirectory()) continue;

            const dataFilePath = path.join(subPath, 'data.js');
            let prefix = 'XX';

            if (fs.existsSync(dataFilePath)) {
                const dataContent = fs.readFileSync(dataFilePath, 'utf8');
                const match = dataContent.match(/prefix:\s*["']([^"']+)["']/);
                if (match && match[1]) {
                    prefix = match[1];
                }
            }

            const imagesDir = path.join(subPath, 'images');
            let imageFiles = [];

            if (fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()) {
                const files = fs.readdirSync(imagesDir);
                // Note: Zo can prefix filenames like 01-..., 02-... if he wants to control the order.
                imageFiles = files
                    .filter(file => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
                    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
            }

            const products = imageFiles.map((file, index) => {
                const numStr = String(index + 1).padStart(3, '0');
                const code = `NLX-${prefix}-${numStr}`;
                const id = code.toLowerCase();
                const imagePath = `collections/${collectionDir}/subcollections/${subDir}/images/${file}`;

                return {
                    id: id,
                    code: code,
                    coverImage: imagePath,
                    gallery: [imagePath]
                };
            });

            const varName = `NILEX_GENERATED_PRODUCTS_${subDir.replace(/-/g, '_').toUpperCase()}`;
            const generatedJsPath = path.join(subPath, 'products.generated.js');
            const jsContent = `window.${varName} = ${JSON.stringify(products, null, 4)};\n`;

            fs.writeFileSync(generatedJsPath, jsContent, 'utf8');
            console.log(`Generated ${generatedJsPath} with ${products.length} products (prefix: ${prefix}).`);
        }
    }
}

generateProducts();
