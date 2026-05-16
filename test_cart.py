import requests

s = requests.Session()
r = s.post('http://127.0.0.1:5000/api/auth/login', json={'email': 'parnavo@example.com', 'password': 'password'}) # Wait, I don't know Parnavo's password.
