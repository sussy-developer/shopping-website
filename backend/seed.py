from app import create_app
from extensions import db
from models import Category, Product, Inventory

categories = [
    { 'category_name': 'Electronics' },
    { 'category_name': 'Fashion' },
    { 'category_name': 'Home & Living' },
    { 'category_name': 'Books' },
    { 'category_name': 'Beauty' },
    { 'category_name': 'Sports' }
]

products = [
  { 'product_name': "Aurora Wireless Headphones", 'brand': "Sonata Audio", 'cat_name': "Electronics",
    'price': 189.00,
    'description': "Studio-grade active noise cancellation with 40-hour battery life. Plush memory-foam cups, lossless Bluetooth 5.3, and an adaptive EQ that tunes itself to your hearing profile.",
    'stock': 24 },
  { 'product_name': "Lumen 14 Pro Laptop", 'brand': "Northwave", 'cat_name': "Electronics",
    'price': 1499.00,
    'description': "14-inch micro-OLED display, 18-core ARM silicon, 22-hour battery. Engineered for creative professionals who refuse to plug in.",
    'stock': 8 },
  { 'product_name': "Helix 5G Smartphone", 'brand': "Northwave", 'cat_name': "Electronics",
    'price': 899.00,
    'description': "Triple-lens computational camera, titanium chassis, and a 6.7-inch LTPO display that drops to 1Hz to sip battery on the lock screen.",
    'stock': 15 },
  { 'product_name': "Orbit Smartwatch GS", 'brand': "Sonata Audio", 'cat_name': "Electronics",
    'price': 349.00,
    'description': "Sapphire crystal face, dual-frequency GPS, blood-oxygen and ECG sensors. Seven days on a single charge.",
    'stock': 0 },
  { 'product_name': "Linen Heritage Shirt", 'brand': "Marlow & Co", 'cat_name': "Fashion",
    'price': 89.00,
    'description': "Garment-dyed Belgian linen with mother-of-pearl buttons and reinforced split-tail hem. Pre-washed for that perfect Sunday-afternoon drape.",
    'stock': 42 },
  { 'product_name': "Stride Runner Sneakers", 'brand': "Kestrel", 'cat_name': "Fashion",
    'price': 145.00,
    'description': "Nitrogen-infused foam midsole and a recycled-knit upper. Tested across 12,000 km of city pavement so your knees don't have to be.",
    'stock': 30 },
  { 'product_name': "Atelier Leather Tote", 'brand': "Marlow & Co", 'cat_name': "Fashion",
    'price': 320.00,
    'description': "Full-grain vegetable-tanned Tuscan leather. Hand-stitched in Florence. Develops a patina that becomes uniquely yours.",
    'stock': 12 },
  { 'product_name': "Cascade Pour-Over Set", 'brand': "Hearthworks", 'cat_name': "Home & Living",
    'price': 68.00,
    'description': "Borosilicate glass server, ceramic cone, and 100 unbleached filters. The third-wave coffee ritual, distilled.",
    'stock': 56 },
  { 'product_name': "Halcyon Floor Lamp", 'brand': "Hearthworks", 'cat_name': "Home & Living",
    'price': 240.00,
    'description': "Hand-blown opal glass diffuser on a brushed-brass column. Warm-dimming LED from 2200K to 3000K.",
    'stock': 9 },
  { 'product_name': "Modular Lounge Sofa", 'brand': "Atelier Nord", 'cat_name': "Home & Living",
    'price': 1899.00,
    'description': "Reconfigurable five-piece system in boucle wool. Kiln-dried hardwood frame, eight-way hand-tied springs, and a lifetime structural warranty.",
    'stock': 4 },
  { 'product_name': "The Cartographers' Field Guide", 'brand': "Folio Press", 'cat_name': "Books",
    'price': 32.00,
    'description': "A literary atlas of imaginary places, with foldout maps and silver-foil endpapers. A National Book Critics Circle finalist.",
    'stock': 78 },
  { 'product_name': "Quiet Architectures", 'brand': "Folio Press", 'cat_name': "Books",
    'price': 45.00,
    'description': "A photographic survey of brutalist libraries across Europe. Smyth-sewn binding, 312 plates, with an essay by Juhani Pallasmaa.",
    'stock': 22 },
  { 'product_name': "Vetiver & Bergamot Eau de Parfum", 'brand': "Ondine", 'cat_name': "Beauty",
    'price': 125.00,
    'description': "Top notes of Calabrian bergamot give way to a heart of Haitian vetiver and a dry-down of warm tonka bean. Cruelty-free, made in Grasse.",
    'stock': 33 },
  { 'product_name': "Renewal Night Serum", 'brand': "Ondine", 'cat_name': "Beauty",
    'price': 88.00,
    'description': "Time-release retinaldehyde with niacinamide and bakuchiol. Dermatologist-formulated for visible results in 28 nights.",
    'stock': 17 },
  { 'product_name': "Trailhead 45L Backpack", 'brand': "Kestrel", 'cat_name': "Sports",
    'price': 215.00,
    'description': "Recycled ripstop nylon, custom-molded hipbelt, integrated rain cover. Tested above 14,000 ft in the Cordillera Blanca.",
    'stock': 19 },
  { 'product_name': "Ascent Climbing Rope 60m", 'brand': "Kestrel", 'cat_name': "Sports",
    'price': 189.00,
    'description': "9.5mm dynamic, dry-treated single rope. UIAA-certified for 8 falls. The redpoint workhorse of the sport-climbing world.",
    'stock': 11 },
]

def seed_db():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()
        
        cat_map = {}
        for cat_data in categories:
            cat = Category(**cat_data)
            db.session.add(cat)
            db.session.commit()
            cat_map[cat.category_name] = cat.category_id
            
        for prod_data in products:
            stock = prod_data.pop('stock')
            cat_name = prod_data.pop('cat_name')
            prod_data['category_id'] = cat_map[cat_name]
            
            prod = Product(**prod_data)
            db.session.add(prod)
            db.session.commit()
            
            inv = Inventory(product_id=prod.product_id, stock_quantity=stock)
            db.session.add(inv)
            
        db.session.commit()
        print("Database seeded successfully with MySQL schema!")

if __name__ == '__main__':
    seed_db()
