import sqlite3

conn = sqlite3.connect('hospital.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM users WHERE email='testing123@gmail.com'")
print(cursor.fetchall())
conn.close()
