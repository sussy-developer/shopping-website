import os
from flask import Flask
from extensions import db, cors

def create_app(test_config=None):
    app = Flask(__name__)
    
    app.config.from_mapping(
        SECRET_KEY=os.getenv("SECRET_KEY"),

SQLALCHEMY_DATABASE_URI=os.getenv("MYSQL_PUBLIC_URL"),
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
    cors.init_app(
    app,
    supports_credentials=True,
    origins=["https://shopping-website-pi-roan.vercel.app"]
)

    with app.app_context():
        import models
        import routes
        app.register_blueprint(routes.bp)
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
