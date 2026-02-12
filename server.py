from http.server import HTTPServer, SimpleHTTPRequestHandler
import socket
import webbrowser
import os

os.chdir('public')

handler = SimpleHTTPRequestHandler
server = HTTPServer(('localhost', 3000), handler)

print("🚀 Сервер запущен на http://localhost:3000")
print("⚠️ ВНИМАНИЕ: Это простой HTTP сервер!")
print("❌ Мультиплеер НЕ БУДЕТ работать!")
print("✅ Только локальное видео и демонстрация")

webbrowser.open('http://localhost:3000')
server.serve_forever()