const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const COLLECTIONS_DIR = path.join(ROOT_DIR, 'collections');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function helperToVarName(idStr, prefix = '') {
    const clean = idStr.replace(/-/g, '_').toUpperCase();
    return prefix ? `${prefix}_${clean}` : clean;
}

function processCoverImage(coverDir, relativePathPrefix, varName) {
    let chosenCoverPath = null;

    if (fs.existsSync(coverDir) && fs.statSync(coverDir).isDirectory()) {
        const files = fs.readdirSync(coverDir)
            .filter(file => file.toLowerCase() !== '.gitkeep' && IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        if (files.length > 0) {
            chosenCoverPath = `${relativePathPrefix}/${files[0]}`;
            if (files.length > 1) {
                console.warn(`[WARNING] Multiple cover images found in ${coverDir}. Using "${files[0]}" and ignoring: ${files.slice(1).join(', ')}`);
            }
        }
    }

    const coverJsContent = `window.${varName} = ${JSON.stringify(chosenCoverPath)};\n`;
    const coverJsPath = path.join(path.dirname(coverDir), 'cover.generated.js');
    fs.writeFileSync(coverJsPath, coverJsContent, 'utf8');
    console.log(`Generated ${coverJsPath} (${varName} = ${chosenCoverPath ? `"${chosenCoverPath}"` : 'null'})`);
}

function generateData() {
    if (!fs.existsSync(COLLECTIONS_DIR)) {
        console.log('No collections directory found.');
        return;
    }

    const collections = fs.readdirSync(COLLECTIONS_DIR);

    for (const collectionDir of collections) {
        const collectionPath = path.join(COLLECTIONS_DIR, collectionDir);
        if (!fs.statSync(collectionPath).isDirectory()) continue;

        // Process Collection Cover
        const colCoverDir = path.join(collectionPath, 'cover');
        const colVarName = `NILEX_COVER_${helperToVarName(collectionDir)}`;
        processCoverImage(colCoverDir, `collections/${collectionDir}/cover`, colVarName);

        // Check for subcollections folder
        const subcollectionsDir = path.join(collectionPath, 'subcollections');
        if (fs.existsSync(subcollectionsDir) && fs.statSync(subcollectionsDir).isDirectory()) {
            const subcollections = fs.readdirSync(subcollectionsDir);

            for (const subDir of subcollections) {
                const subPath = path.join(subcollectionsDir, subDir);
                if (!fs.statSync(subPath).isDirectory()) continue;

                // Process Subcollection Cover
                const subCoverDir = path.join(subPath, 'cover');
                const subCoverVarName = `NILEX_COVER_${helperToVarName(subDir)}`;
                processCoverImage(subCoverDir, `collections/${collectionDir}/subcollections/${subDir}/cover`, subCoverVarName);

                // Process Subcollection Products
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
                    imageFiles = files
                        .filter(file => file.toLowerCase() !== '.gitkeep' && IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
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

                const prodVarName = `NILEX_GENERATED_PRODUCTS_${helperToVarName(subDir)}`;
                const generatedJsPath = path.join(subPath, 'products.generated.js');
                const jsContent = `window.${prodVarName} = ${JSON.stringify(products, null, 4)};\n`;

                fs.writeFileSync(generatedJsPath, jsContent, 'utf8');
                console.log(`Generated ${generatedJsPath} with ${products.length} products (prefix: ${prefix}).`);
            }
        } else {
            // Process Collection Products directly if no subcollections folder
            const collectionFilePath = path.join(collectionPath, 'collection.js');
            let prefix = 'XX';

            if (fs.existsSync(collectionFilePath)) {
                const colContent = fs.readFileSync(collectionFilePath, 'utf8');
                const match = colContent.match(/prefix:\s*["']([^"']+)["']/);
                if (match && match[1]) {
                    prefix = match[1];
                }
            }

            const imagesDir = path.join(collectionPath, 'images');
            let imageFiles = [];

            if (fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()) {
                const files = fs.readdirSync(imagesDir);
                imageFiles = files
                    .filter(file => file.toLowerCase() !== '.gitkeep' && IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
                    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
            }

            const products = imageFiles.map((file, index) => {
                const numStr = String(index + 1).padStart(3, '0');
                const code = `NLX-${prefix}-${numStr}`;
                const id = code.toLowerCase();
                const imagePath = `collections/${collectionDir}/images/${file}`;

                return {
                    id: id,
                    code: code,
                    coverImage: imagePath,
                    gallery: [imagePath]
                };
            });

            const prodVarName = `NILEX_GENERATED_PRODUCTS_${helperToVarName(collectionDir)}`;
            const generatedJsPath = path.join(collectionPath, 'products.generated.js');
            const jsContent = `window.${prodVarName} = ${JSON.stringify(products, null, 4)};\n`;

            fs.writeFileSync(generatedJsPath, jsContent, 'utf8');
            console.log(`Generated ${generatedJsPath} with ${products.length} products (prefix: ${prefix}).`);
        }
    }
}

generateData();
