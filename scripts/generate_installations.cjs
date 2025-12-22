const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images/atkanot');
const OUTPUT_FILE = path.join(__dirname, '../installations.json');

// Helper to generate description
const generateDescription = (filename) => {
   const descriptions = [
       "Installation récente d'une porte blindée sur mesure.",
       "Rénovation complète avec nos portes intérieures haut de gamme.",
       "Pose d'une porte sécurisée design pour un appartement moderne.",
       "Installation de portes coupe-feu dans un complexe résidentiel.",
       "Remplacement de menuiseries : élégance et sécurité.",
       "Mise en place d'une porte d'entrée monumentale.",
       "Finitions parfaites pour cette installation chez un particulier."
   ];
   return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const installations = [];

if (fs.existsSync(IMAGES_DIR)) {
    const files = fs.readdirSync(IMAGES_DIR);
    files.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
            installations.push({
                id: path.basename(file, path.extname(file)),
                title: "Réalisation " + path.basename(file, path.extname(file)).substring(0, 10),
                description: generateDescription(file),
                date: new Date().toISOString(),
                imageUrl: `/images/atkanot/${file}`
            });
        }
    });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(installations, null, 2));
console.log(`Generated ${installations.length} installations in ${OUTPUT_FILE}`);
