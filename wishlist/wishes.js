// Shivam's wish list. Copied from the Notion "Shopping wish list" on 18 October 2026.
// To add a wish, copy an entry and keep each list in the order you want it shown.
// id: stable and unique. Later it will key reservations, so don't rename an id once the page is shared.
// cat: "clothing" | "footwear" | "gadget" | "home" | "accessory". price and was are text, as the shop shows them.

window.WISHES_UPDATED = "2026-10-18";

window.WISHES = [
  // Clothing
  { id: "desigual-floral-trousers", cat: "clothing", brand: "Desigual", name: "Long floral trousers", price: "£155", url: "https://www.desigual.com/en_GB/26SMPW15.html" },
  { id: "desigual-printed-jeans", cat: "clothing", brand: "Desigual", name: "Printed jeans", price: "£149", url: "https://www.desigual.com/en_GB/26WMDD085053.html" },
  { id: "adidas-spain-away-jersey", cat: "clothing", brand: "adidas", name: "Spain 26 Away Jersey", note: "The supporter version, short sleeve.", price: "£85", url: "https://www.adidas.co.uk/-/JN4397.html" },
  { id: "adidas-spain-away-authentic", cat: "clothing", brand: "adidas", name: "Spain 26 Away Authentic Jersey", note: "Short sleeve.", price: "£120", url: "https://www.adidas.co.uk/-/JN4392.html" },
  { id: "adidas-spain-away-authentic-ls", cat: "clothing", brand: "adidas", name: "Spain 26 Away Authentic Long Sleeve Jersey", price: "£130", url: "https://www.adidas.co.uk/-/KA1957.html" },
  { id: "moss-wool-parka", cat: "clothing", brand: "Moss", name: "Dark Chestnut Wool Parka", price: "£249", url: "https://www.moss.co.uk/burnt-orange-wool-parka-967036713" },
  { id: "universal-works-gower", cat: "clothing", brand: "Universal Works", name: "Black Not Shearling Gower Jacket", price: "£335", url: "https://universalworks.com/products/universal-works-gower-jacket-in-black-not-shearling?country=GB" },
  { id: "hackett-velospeed", cat: "clothing", brand: "Hackett", name: "Velospeed Jacket", price: "£490", url: "https://www.hackett.com/uk/en_gb/pd/velospeed-HM4000043.html?dwvar_HM4000043_size=S055XS&dwvar_HM4000043_color=781&variationGroupID=HM4000043781" },
  { id: "zara-blue-jumper", cat: "clothing", brand: "Zara", name: "Blue wool blend jumper", price: "£49.99", url: "https://www.zara.com/uk/en/regular-fit-wool-blend-jumper-p02632306.html?v1=479751243" },

  // Footwear
  { id: "vivobarefoot-primus-lite-iv", cat: "footwear", brand: "Vivobarefoot", name: "Primus Lite IV", note: "For running and training.", price: "£110", url: "https://www.vivobarefoot.com/uk/primus-lite-iv-mens?colour=Mineral" },
  { id: "vivobarefoot-primus-lite-3-5", cat: "footwear", brand: "Vivobarefoot", name: "Primus Lite 3.5 in Obsidian", price: "£77", was: "£110", url: "https://www.vivobarefoot.com/uk/primus-lite-3-5-mens?colour=Obsidian" },
  { id: "solovair-zip-derby", cat: "footwear", brand: "Solovair", name: "Burgundy Rub-Off 8 Eye Zip Derby Boot", price: "£189", url: "https://uk.nps-solovair.com/collections/mens/products/s8-551-bur-zip-g?variant=30679406542913" },
  { id: "ecco-grainer", cat: "footwear", brand: "Ecco", name: "Grainer black boots", note: "Looks like a proper combat boot and seems comfortable for all-day wear. Can replace the Birkenstock ones.", url: "https://gb.ecco.com/product/ecco-grainer/214724/01001" },
  { id: "red-wing-8864", cat: "footwear", brand: "Red Wing", name: "Classic Moc Toe Boots 8864 GORE-TEX, Russet Taos", note: "Unique and classic.", price: "£349", url: "https://www.redwinglondon.com/collections/red-wing-boots/products/classic-moc-toe-boots-8864-gore-tex" },

  // Gadgets
  { id: "dji-mini-5-pro", cat: "gadget", brand: "DJI", name: "DJI Mini 5 Pro", note: "The full combo with the smart remote. £1,129 with a 256 GB SD card and the 2-year care plan.", price: "£979", url: "https://www.dji.com/uk/mini-5-pro" },
  { id: "ray-ban-meta", cat: "gadget", brand: "Ray-Ban Meta", name: "Ray-Ban Meta glasses", price: "£400+", url: "https://www.ray-ban.com/uk/ray-ban-meta-ai-glasses" },
  { id: "lumie-sad-lamp", cat: "gadget", brand: "Lumie", name: "Task SAD lamp, golden yellow", price: "£279", url: "https://www.lumie.com/products/task-golden-yellow" },
  { id: "vinyl-player", cat: "gadget", name: "A really good vinyl player", note: "Top quality. One with a speaker is great, or Bluetooth to a Sonos is enough." },

  // Home
  { id: "lightbox-noble-wall-light", cat: "home", brand: "Lightbox", name: "Noble Rechargeable Wall Light, Gold & Frosted", note: "Really good for the entrance.", price: "£245", url: "https://www.lightboxshop.co.uk/noble-rechargeable-wall-light-gold-and-frosted.html" },
  { id: "ninja-crispi-pro", cat: "home", brand: "Ninja", name: "Ninja Crispi Pro air fryer" },

  // Accessories
  { id: "blunt-metro-mister-mort", cat: "accessory", brand: "Blunt", name: "Mister Mort Metro umbrella", note: "Artsy, unique and fun.", price: "£85", url: "https://bluntumbrellas.co.uk/products/mister-mort-metro?variant=55726889435511" },
];

// Shops I like as a whole. Good for a gift card, or for browsing.
window.BRANDS = [
  { id: "kardo", cat: "clothing", brand: "Kardo", line: "Indian menswear with real craft", price: "£200–600", url: "https://kardo.co/product-category/aw25-craft-mens/" },
  { id: "universal-works", cat: "clothing", brand: "Universal Works", line: "Modern menswear", url: "https://universalworks.com/collections/clothing" },
  { id: "allsaints-leather", cat: "clothing", brand: "AllSaints", line: "Leather jackets, in XS and XXS", price: "£300–500+", url: "https://www.allsaints.com/men/leathers/leather-jackets?start=24&sz=24" },
  { id: "embassy", cat: "footwear", brand: "Embassy", line: "Quirky leather shoes and boots", price: "£100–235", url: "https://embassylondon.co.uk/collections/mens-leather-footwear" },
  { id: "ecco-waterproof", cat: "footwear", brand: "Ecco", line: "Waterproof and hiking shoes, with arch support", price: "£100–200", url: "https://gb.ecco.com/men/shoes/waterproof-and-gore-tex" },
  { id: "onitsuka-tiger", cat: "footwear", brand: "Onitsuka Tiger", line: "Cool, fun trainers", price: "£120–250", url: "https://www.onitsukatiger.com/gb/en-gb/men/shoes/all-shoes/" },
];
