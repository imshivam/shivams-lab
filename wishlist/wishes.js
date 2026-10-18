// Shivam's wish list. Copied from the Notion "Shopping wish list" on 18 October 2026.
// To add a wish, copy an entry and keep each list in the order you want it shown.
// id: stable and unique. Later it will key reservations, so don't rename an id once the page is shared.
// cat: "clothing" | "footwear" | "gadget" | "home" | "accessory". price and was are text, as the shop shows them.
// Photos, link checks and prices: GitHub runs wishlist/tools/fetch_images.py monthly and whenever this file changes.
// image (optional): a photo URL to use when the product page's own preview picture is wrong.
// gone (optional): true when the shop no longer sells it at this link. The tile then says so and isn't a link.
// photoFrom (optional): another shop's page for the same product, used only for the photo when the main shop blocks automated visits.

window.WISHES_UPDATED = "2026-10-18";

window.WISHES = [
  // Clothing
  { id: "desigual-floral-trousers", cat: "clothing", brand: "Desigual", name: "Long floral trousers", price: "£155", url: "https://www.desigual.com/en_GB/26SMPW15.html" },
  { id: "desigual-printed-jeans", cat: "clothing", brand: "Desigual", name: "Printed jeans", price: "£149", url: "https://www.desigual.com/en_GB/26WMDD085053.html" },
  { id: "adidas-spain-away-jersey", cat: "clothing", brand: "adidas", name: "Spain 26 Away Jersey", note: "The supporter version, short sleeve.", price: "£85", url: "https://www.adidas.co.uk/-/JN4397.html", image: "https://assets.adidas.com/images/w_600,f_auto,q_auto/d3d30120532e4e4dbe9b5a0d51fe1df2_9366/Spain_26_Away_Jersey_White_JN4397_21_model.jpg" },
  { id: "adidas-spain-away-authentic", cat: "clothing", brand: "adidas", name: "Spain 26 Away Authentic Jersey", note: "Short sleeve.", price: "£120", url: "https://www.adidas.co.uk/-/JN4392.html", image: "https://assets.adidas.com/images/w_600,f_auto,q_auto/764f9e7d0914477083cbdb77a45bc36e_9366/Spain_26_Away_Authentic_Jersey_White_JN4392_HM53.jpg" },
  { id: "adidas-spain-away-authentic-ls", cat: "clothing", brand: "adidas", name: "Spain 26 Away Authentic Long Sleeve Jersey", price: "£130", url: "https://www.adidas.co.uk/-/KA1957.html", image: "https://assets.adidas.com/images/w_600,f_auto,q_auto/849dd93c8ea14234b60e1bbed2f4bf26_9366/Spain_26_Away_Authentic_Long_Sleeve_Jersey_White_KA1957_HM1.jpg" },
  { id: "moss-wool-parka", cat: "clothing", brand: "Moss", name: "Dark Chestnut Wool Parka", price: "£249", url: "https://www.moss.co.uk/burnt-orange-wool-parka-967036713" },
  { id: "universal-works-gower", cat: "clothing", brand: "Universal Works", name: "Black Not Shearling Gower Jacket", price: "£335", url: "https://universalworks.com/products/universal-works-gower-jacket-in-black-not-shearling?country=GB", gone: true },
  { id: "hackett-velospeed", cat: "clothing", brand: "Hackett", name: "Velospeed Jacket", note: "The exact one I saved has gone from Hackett’s site, so this links to the Velospeed range. Size XS.", price: "£490", url: "https://www.hackett.com/uk/en_gb/men/b/velospeed/" },
  { id: "zara-blue-jumper", cat: "clothing", brand: "Zara", name: "Blue wool blend jumper", price: "£49.99", url: "https://www.zara.com/uk/en/regular-fit-wool-blend-jumper-p02632306.html?v1=479751243", gone: true },

  // Footwear
  { id: "vivobarefoot-primus-lite-iv", cat: "footwear", brand: "Vivobarefoot", name: "Primus Lite IV", note: "For running and training.", price: "£110", url: "https://www.vivobarefoot.com/uk/primus-lite-iv-mens?colour=Mineral", photoFrom: "https://www.rdrc.sg/products/vivobarefoot-primus-lite-iv-mineral-mens" },
  { id: "vivobarefoot-primus-lite-3-5", cat: "footwear", brand: "Vivobarefoot", name: "Primus Lite 3.5 in Obsidian", price: "£77", was: "£110", url: "https://www.vivobarefoot.com/uk/primus-lite-3-5-mens?colour=Obsidian", photoFrom: "https://www.outnorth.com/int/brands/vivobarefoot/vivobarefoot-men-s-primus-lite-3-5-obsidian-FS634071" },
  { id: "solovair-zip-derby", cat: "footwear", brand: "Solovair", name: "Burgundy Rub-Off 8 Eye Zip Derby Boot", price: "£189", url: "https://uk.nps-solovair.com/collections/mens/products/s8-551-bur-zip-g?variant=30679406542913" },
  { id: "ecco-grainer", cat: "footwear", brand: "Ecco", name: "Grainer black boots", note: "Looks like a proper combat boot and seems comfortable for all-day wear. Can replace the Birkenstock ones.", url: "https://gb.ecco.com/product/ecco-grainer/214724/01001" },
  { id: "red-wing-8864", cat: "footwear", brand: "Red Wing", name: "Classic Moc Toe Boots 8864 GORE-TEX, Russet Taos", note: "Unique and classic. Red Wing London no longer lists it, so this links to Son of a Stag in London.", price: "£349", url: "https://sonofastag.com/products/red-wing-8864-6-inch-gore-tex-moc-toe-boots-oro-russet-taos" },

  // Gadgets
  { id: "dji-mini-5-pro", cat: "gadget", brand: "DJI", name: "DJI Mini 5 Pro", note: "The full combo with the smart remote. £1,129 with a 256 GB SD card and the 2-year care plan.", price: "£979", url: "https://www.dji.com/uk/mini-5-pro", image: "https://www-cdn.djiits.com/cms/uploads/3462d29fa23cf5d29fce9171fb2b6b9d@374*374.png" },
  { id: "ray-ban-meta", cat: "gadget", brand: "Ray-Ban Meta", name: "Ray-Ban Meta glasses", price: "£400+", url: "https://www.ray-ban.com/uk/ray-ban-meta-ai-glasses", photoFrom: "https://business.currys.co.uk/catalogue/cameras-smart-tech/smart-tech/smart-toys-and-gadgets/ray-ban-meta-meta-wayfarer-gen-2-glasses-shiny-black-with-green-lenses/N740821W" },
  { id: "lumie-sad-lamp", cat: "gadget", brand: "Lumie", name: "Task SAD lamp, golden yellow", price: "£279", url: "https://www.lumie.com/products/task-golden-yellow" },
  { id: "vinyl-player", cat: "gadget", name: "A really good vinyl player", note: "Top quality. One with a speaker is great, or Bluetooth to a Sonos is enough." },

  // Home
  { id: "lightbox-noble-wall-light", cat: "home", brand: "Lightbox", name: "Noble Rechargeable Wall Light, Gold & Frosted", note: "Really good for the entrance.", price: "£245", url: "https://www.lightboxshop.co.uk/noble-rechargeable-wall-light-gold-and-frosted.html" },
  { id: "ninja-crispi-pro", cat: "home", brand: "Ninja", name: "Ninja Crispi Pro air fryer", url: "https://www.sharkninja.co.uk/kitchen/cooking-appliances/air-fryers/crispi-portable-air-fryers" },

  // Accessories
  { id: "blunt-metro-mister-mort", cat: "accessory", brand: "Blunt", name: "Mister Mort Metro umbrella", note: "Artsy, unique and fun.", price: "£85", url: "https://bluntumbrellas.co.uk/products/mister-mort-metro?variant=55726889435511", gone: true },
];

// Shops I like as a whole. Good for a gift card, or for browsing.
window.BRANDS = [
  { id: "kardo", cat: "clothing", brand: "Kardo", line: "Indian menswear with real craft", price: "£200–600", url: "https://kardo.co/product-category/aw25-craft-mens/" },
  { id: "universal-works", cat: "clothing", brand: "Universal Works", line: "Modern menswear", url: "https://universalworks.com/collections/clothing" },
  { id: "allsaints-leather", cat: "clothing", brand: "AllSaints", line: "Leather jackets, in XS and XXS", price: "£300–500+", url: "https://www.allsaints.com/men/leathers/leather-jackets" },
  { id: "embassy", cat: "footwear", brand: "Embassy", line: "Quirky leather shoes and boots", price: "£100–235", url: "https://embassylondon.co.uk/collections/mens-leather-footwear" },
  { id: "ecco-waterproof", cat: "footwear", brand: "Ecco", line: "Waterproof and hiking shoes, with arch support", price: "£100–200", url: "https://gb.ecco.com/men/shoes/waterproof-and-gore-tex" },
  { id: "onitsuka-tiger", cat: "footwear", brand: "Onitsuka Tiger", line: "Cool, fun trainers", price: "£120–250", url: "https://www.onitsukatiger.com/gb/en-gb/men/shoes/all-shoes/" },
];
