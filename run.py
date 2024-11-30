import sys
from app import create_app
from waitress import serve

sys.stdout.reconfigure(encoding='utf-8')

app = create_app()

if __name__ == '__main__':
    print('Running on http://'+app.config['HOST']+':'+app.config['PORT'])
    serve(app, host=app.config['HOST'], port=app.config['PORT'])