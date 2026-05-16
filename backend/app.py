import os
from flask import Flask
from extensions import db, cors

def create_app(test_config=None):
    app = Flask(__name__)
    
    app.config.from_mapping(
        SECRET_KEY='dev',
        SQLALCHEMY_DATABASE_URI='mysql+pymysql://root:root@127.0.0.1:3306/ecommerce',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    db.init_app(app)
    cors.init_app(app, supports_credentials=True)

    with app.app_context():
        import models
        import routes
        app.register_blueprint(routes.bp)
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
