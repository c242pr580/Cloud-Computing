import sys
from app import create_app
from waitress import serve

sys.stdout.reconfigure(encoding='utf-8')

app = create_app()

if __name__ == '__main__':
    port = app.config.get('PORT_FACE', 8080)
    host = '0.0.0.0'
    
    print(f'Running on http://{host}:{port}')
    
    serve(app, host=host, port=port)  