import sys
from app import create_app

sys.stdout.reconfigure(encoding='utf-8')

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)