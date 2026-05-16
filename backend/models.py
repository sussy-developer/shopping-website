from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'USERS'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    phone = db.Column(db.String(15), unique=True)
    password_hash = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.user_id),
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Category(db.Model):
    __tablename__ = 'CATEGORIES'
    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(100), unique=True)

    def to_dict(self):
        # Frontend fallbacks
        icon_map = {
            'Electronics': 'Cpu', 'Fashion': 'Shirt', 'Home & Living': 'Sofa', 
            'Books': 'BookOpen', 'Beauty': 'Sparkle', 'Sports': 'Dumbbell'
        }
        return {
            'id': str(self.category_id),
            'name': self.category_name,
            'slug': self.category_name.lower().replace(" ", "-"),
            'icon': icon_map.get(self.category_name, "Package"),
            'accent': "#171717",
            'tint': "#F5F5F5",
            'description': ""
        }

class Product(db.Model):
    __tablename__ = 'PRODUCTS'
    product_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_id = db.Column(db.Integer, db.ForeignKey('CATEGORIES.category_id'))
    product_name = db.Column(db.String(200))
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2))
    brand = db.Column(db.String(100))
    
    category = db.relationship('Category', backref='products')

    def to_dict(self):
        # Fallback image logic based on ID hash for demonstration
        images = ["/images/prod_headphones.png", "/images/prod_laptop.png", "/images/prod_shirt.png", "/images/prod_lamp.png"]
        img = images[self.product_id % len(images)] if self.product_id else images[0]
        
        return {
            'id': str(self.product_id),
            'name': self.product_name,
            'brand': self.brand,
            'category_id': str(self.category_id),
            'price': float(self.price) if self.price else 0.0,
            'image': img, 
            'description': self.description,
            'created_at': datetime.utcnow().isoformat()
        }

class Inventory(db.Model):
    __tablename__ = 'INVENTORY'
    inventory_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('PRODUCTS.product_id'), unique=True)
    stock_quantity = db.Column(db.Integer, nullable=False)

class Cart(db.Model):
    __tablename__ = 'CARTS'
    cart_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('USERS.user_id'), unique=True, nullable=True)
    session_id = db.Column(db.String(36), unique=True, nullable=True) # Extension for guest carts
    
    items = db.relationship('CartItem', backref='cart', lazy=True, cascade="all, delete-orphan")

class CartItem(db.Model):
    __tablename__ = 'CART_ITEMS'
    cart_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('CARTS.cart_id'))
    product_id = db.Column(db.Integer, db.ForeignKey('PRODUCTS.product_id'))
    quantity = db.Column(db.Integer)
    
    product = db.relationship('Product')

class Order(db.Model):
    __tablename__ = 'ORDERS'
    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('USERS.user_id'))
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    order_status = db.Column(db.String(50))
    
    items = db.relationship('OrderItem', backref='order', lazy=True)
    payment = db.relationship('Payment', backref='order', uselist=False)

    def to_dict(self):
        total = sum(float(i.price) * i.quantity for i in self.items) if self.items else 0.0
        return {
            'id': str(self.order_id),
            'user_id': str(self.user_id),
            'status': self.order_status,
            'total': total,
            'shipping': {},
            'created_at': self.order_date.isoformat() if self.order_date else None,
            'timeline': [{'status': self.order_status, 'label': self.order_status, 'at': self.order_date.isoformat()}] if self.order_date else [],
            'items': [i.to_dict() for i in self.items],
            'payment': self.payment.to_dict() if self.payment else None
        }

class OrderItem(db.Model):
    __tablename__ = 'ORDER_ITEMS'
    order_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('ORDERS.order_id'))
    product_id = db.Column(db.Integer, db.ForeignKey('PRODUCTS.product_id'))
    quantity = db.Column(db.Integer)
    price = db.Column(db.Numeric(10, 2))

    product = db.relationship('Product')

    def to_dict(self):
        return {
            'product_id': str(self.product_id),
            'product_name': self.product.product_name if self.product else "Unknown",
            'product_icon': "Box",
            'product_accent': "#171717",
            'brand': self.product.brand if self.product else "",
            'quantity': self.quantity,
            'price_at_purchase': float(self.price) if self.price else 0.0,
            'subtotal': float(self.price * self.quantity) if self.price and self.quantity else 0.0
        }

class Payment(db.Model):
    __tablename__ = 'PAYMENTS'
    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('ORDERS.order_id'))
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(50))
    amount = db.Column(db.Numeric(10, 2))

    def to_dict(self):
        return {
            'id': str(self.payment_id),
            'order_id': str(self.order_id),
            'method': self.payment_method,
            'amount': float(self.amount) if self.amount else 0.0,
            'status': self.payment_status,
            'transaction_id': "tx_" + str(self.payment_id),
            'created_at': datetime.utcnow().isoformat()
        }

class Review(db.Model):
    __tablename__ = 'REVIEWS'
    review_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('USERS.user_id'))
    product_id = db.Column(db.Integer, db.ForeignKey('PRODUCTS.product_id'))
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)

    user = db.relationship('User')

    def to_dict(self):
        return {
            'id': str(self.review_id),
            'user_id': str(self.user_id),
            'user_name': self.user.full_name if self.user else "Anonymous",
            'product_id': str(self.product_id),
            'rating': self.rating,
            'comment': self.comment,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
