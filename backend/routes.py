from flask import Blueprint, request, jsonify, session
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, Category, Product, Inventory, Cart, CartItem, Order, OrderItem, Payment, Review
import uuid
import datetime

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.before_request
def validate_session():
    user_id = session.get('user_id')
    if user_id is not None:
        try:
            int(user_id)
        except (ValueError, TypeError):
            session.pop('user_id', None)

def get_cart_obj():
    user_id = session.get('user_id')
    if user_id:
        return Cart.query.filter_by(user_id=user_id).first()
    session_id = session.get('session_id')
    if session_id:
        return Cart.query.filter_by(session_id=session_id).first()
    return None

def get_or_create_cart():
    cart = get_cart_obj()
    if not cart:
        user_id = session.get('user_id')
        if user_id:
            cart = Cart(user_id=user_id)
        else:
            if 'session_id' not in session:
                session['session_id'] = str(uuid.uuid4())
            cart = Cart(session_id=session['session_id'])
        db.session.add(cart)
        db.session.commit()
    return cart

def merge_guest_cart(user):
    session_id = session.get('session_id')
    if not session_id: return
    
    guest_cart = Cart.query.filter_by(session_id=session_id).first()
    if not guest_cart: return
    
    user_cart = Cart.query.filter_by(user_id=user.user_id).first()
    
    if guest_cart and user_cart:
        for item in guest_cart.items:
            existing = CartItem.query.filter_by(cart_id=user_cart.cart_id, product_id=item.product_id).first()
            if existing:
                existing.quantity += item.quantity
            else:
                item.cart_id = user_cart.cart_id
        db.session.delete(guest_cart)
    elif guest_cart:
        guest_cart.user_id = user.user_id
        guest_cart.session_id = None
        
    db.session.commit()
    session.pop('session_id', None)

# --- AUTH ROUTES ---
@bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing data'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        full_name=data.get('full_name', ''),
        email=data['email'],
        phone=data.get('phone', ''),
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(user)
    db.session.commit()
    
    session['user_id'] = user.user_id
    merge_guest_cart(user)
    return jsonify({'user': user.to_dict()}), 201

@bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not check_password_hash(user.password_hash, data.get('password')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    session['user_id'] = user.user_id
    merge_guest_cart(user)
    return jsonify({'user': user.to_dict()}), 200

@bp.route('/auth/current', methods=['GET'])
def current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'user': None}), 200
    user = User.query.get(user_id)
    if not user:
        return jsonify({'user': None}), 200
    return jsonify({'user': user.to_dict()}), 200

@bp.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'}), 200

# --- PRODUCT & CATEGORY ROUTES ---
@bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([c.to_dict() for c in categories]), 200

@bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    result = []
    for p in products:
        p_dict = p.to_dict()
        inventory = Inventory.query.filter_by(product_id=p.product_id).first()
        p_dict['stock'] = inventory.stock_quantity if inventory else 0
        
        reviews = Review.query.filter_by(product_id=p.product_id).all()
        if reviews:
            p_dict['rating'] = sum([r.rating for r in reviews]) / len(reviews)
            p_dict['reviewsCount'] = len(reviews)
        else:
            p_dict['rating'] = 0
            p_dict['reviewsCount'] = 0
            
        result.append(p_dict)
    return jsonify(result), 200

# --- CART ROUTES ---
@bp.route('/cart', methods=['GET'])
def get_cart():
    cart = get_cart_obj()
    if not cart: return jsonify([])
    
    result = []
    for item in cart.items:
        result.append({
            'product_id': str(item.product_id),
            'quantity': item.quantity
        })
            
    return jsonify(result), 200

@bp.route('/cart', methods=['POST'])
def add_to_cart():
    cart = get_or_create_cart()
    data = request.get_json()
    product_id = data.get('product_id')
    
    if not product_id:
        return jsonify({'error': 'Missing product_id'}), 400
        
    if isinstance(product_id, str) and product_id.startswith('p_'):
        # Legacy ID from frontend fallback check
        return jsonify({'error': 'Invalid product ID format. Please refresh.'}), 400
        
    inv = Inventory.query.filter_by(product_id=product_id).first()
    item = CartItem.query.filter_by(cart_id=cart.cart_id, product_id=product_id).first()
    
    desired = (item.quantity if item else 0) + 1
    if not inv or inv.stock_quantity < desired:
        return jsonify({'error': f'Only {inv.stock_quantity if inv else 0} in stock'}), 400
        
    if item:
        item.quantity += 1
    else:
        item = CartItem(cart_id=cart.cart_id, product_id=product_id, quantity=1)
        db.session.add(item)
        
    db.session.commit()
    return jsonify({'message': 'Added to cart'}), 201

@bp.route('/cart/<product_id>', methods=['PUT'])
def update_cart_item(product_id):
    cart = get_cart_obj()
    if not cart: return jsonify({'error': 'No cart'}), 400
        
    data = request.get_json()
    quantity = data.get('quantity')
    
    item = CartItem.query.filter_by(cart_id=cart.cart_id, product_id=product_id).first()
    if item:
        if quantity <= 0:
            db.session.delete(item)
        else:
            inv = Inventory.query.filter_by(product_id=product_id).first()
            if not inv or inv.stock_quantity < quantity:
                return jsonify({'error': f'Only {inv.stock_quantity if inv else 0} in stock'}), 400
            item.quantity = quantity
        db.session.commit()
    return jsonify({'message': 'Cart updated'}), 200

@bp.route('/cart/<product_id>', methods=['DELETE'])
def remove_cart_item(product_id):
    cart = get_cart_obj()
    if not cart: return jsonify({'error': 'No cart'}), 400
    
    CartItem.query.filter_by(cart_id=cart.cart_id, product_id=product_id).delete()
    db.session.commit()
    return jsonify({'message': 'Item removed'}), 200

@bp.route('/cart/clear', methods=['POST'])
def clear_cart():
    cart = get_cart_obj()
    if not cart: return jsonify({'message': 'Already clear'}), 200
    
    CartItem.query.filter_by(cart_id=cart.cart_id).delete()
    db.session.commit()
    return jsonify({'message': 'Cart cleared'}), 200

# --- ORDER ROUTES ---
@bp.route('/orders', methods=['POST'])
def place_order():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.get_json()
    shipping = data.get('shipping')
    
    cart = get_cart_obj()
    if not cart or not cart.items:
        return jsonify({'error': 'Cart is empty'}), 400
        
    order = Order(user_id=user_id, order_status='confirmed')
    db.session.add(order)
    db.session.flush() # to get order_id
    
    total = 0
    for item in cart.items:
        product = item.product
        if not product: continue
        
        inv = Inventory.query.filter_by(product_id=product.product_id).first()
        if not inv or inv.stock_quantity < item.quantity:
            db.session.rollback()
            return jsonify({'error': f'Insufficient stock for {product.product_name}'}), 400
            
        inv.stock_quantity -= item.quantity
        subtotal = product.price * item.quantity
        total += subtotal
        
        order_item = OrderItem(
            order_id=order.order_id,
            product_id=product.product_id,
            quantity=item.quantity,
            price=product.price
        )
        db.session.add(order_item)
        
    payment = Payment(
        order_id=order.order_id,
        payment_method=data.get('paymentMethod', 'card'),
        payment_status='completed',
        amount=total
    )
    db.session.add(payment)
    
    # Clear cart
    CartItem.query.filter_by(cart_id=cart.cart_id).delete()
    db.session.commit()
    
    return jsonify(order.to_dict()), 201

@bp.route('/orders', methods=['GET'])
def get_orders():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200

# --- REVIEWS ROUTES ---
@bp.route('/reviews', methods=['GET'])
def get_reviews():
    product_id = request.args.get('product_id')
    if not product_id:
        return jsonify([]), 400
    reviews = Review.query.filter_by(product_id=product_id).all()
    return jsonify([r.to_dict() for r in reviews]), 200

@bp.route('/reviews', methods=['POST'])
def add_review():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    user = User.query.get(user_id)
    data = request.get_json()
    product_id = data.get('product_id')
    
    review = Review.query.filter_by(user_id=user_id, product_id=product_id).first()
    if review:
        review.rating = data.get('rating')
        review.comment = data.get('comment')
        review.updated_at = datetime.datetime.utcnow()
    else:
        review = Review(
            user_id=user_id,
            product_id=product_id,
            rating=data.get('rating'),
            comment=data.get('comment')
        )
        db.session.add(review)
    
    db.session.commit()
    return jsonify(review.to_dict()), 201
