const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const DOORS_DIR = path.join(IMAGES_DIR, 'studioDoors');
const ACCESSORIES_DIR = path.join(IMAGES_DIR, 'studioAccessories');
const OUTPUT_FILE = path.join(__dirname, '../products.json');

// Helper to format currency
const randomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1) + min) * 10 + 9; // Ending in 9

// Helper to generate description
const generateDescription = (name, type) => {
    const elegance = ["élégance intemporelle", "design sophistiqué", "finition impeccable", "touche de luxe", "charme naturel"];
    const material = ["matériaux de haute qualité", "conception robuste", "structure durable", "bois soigneusement sélectionné", "alliage résistant"];
    const usage = ["idéal pour tout intérieur moderne", "parfait pour rehausser votre espace", "conçu pour les espaces contemporains", "une addition sublime à votre maison"];
    
    const part1 = elegance[Math.floor(Math.random() * elegance.length)];
    const part2 = material[Math.floor(Math.random() * material.length)];
    const part3 = usage[Math.floor(Math.random() * usage.length)];

    if (type === 'door') {
        return `Découvrez la ${name}, une porte qui allie ${part1} et ${part2}. ${part3.charAt(0).toUpperCase() + part3.slice(1)}. Cette porte offre une isolation acoustique optimale et une esthétique qui transformera votre pièce.`;
    } else {
        return `Cet accessoire ${name} se distingue par son ${part1}. Fabriqué avec des ${part2}, il est ${part3}. Un détail qui fait toute la différence.`;
    }
};

// Helper to parse filename
const parseProduct = (filename, dir, type) => {
    const ext = path.extname(filename);
    const nameSlug = path.basename(filename, ext).replace(/^door-|^accessory-/, '').replace(/-/g, ' ');
    // Capitalize words
    const name = nameSlug.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    // Determine category and price based on keywords
    let category = type === 'door' ? 'Portes Intérieures' : 'Accessoires';
    let price = type === 'door' ? randomPrice(120, 300) : randomPrice(20, 80);
    
    // Refine category/price logic if needed
    if (name.includes('Luxury')) price += 100;
    
    return {
        id: path.basename(filename, ext), // Use filename without ext as ID
        name: name,
        description: generateDescription(name, type),
        price: price,
        category: category,
        imageUrl: `/images/${path.basename(dir)}/${filename}`,
        stock: Math.floor(Math.random() * 50) + 10,
        createdAt: new Date().toISOString()
    };
};

const products = [];

// Process Doors
if (fs.existsSync(DOORS_DIR)) {
    const doorFiles = fs.readdirSync(DOORS_DIR);
    doorFiles.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
            products.push(parseProduct(file, DOORS_DIR, 'door'));
        }
    });
}

// Process Accessories
if (fs.existsSync(ACCESSORIES_DIR)) {
    const accFiles = fs.readdirSync(ACCESSORIES_DIR);
    accFiles.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
            products.push(parseProduct(file, ACCESSORIES_DIR, 'accessory'));
        }
    });
}

// Write to JSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
console.log(`Generated ${products.length} products in ${OUTPUT_FILE}`);
