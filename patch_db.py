import psycopg2

conn = psycopg2.connect("postgresql://fxtrading_user:p5kZazAXvcgC8F8CX4eVcUblG2fG5GQa@dpg-d8ak3ireo5us739oddn0-a.oregon-postgres.render.com/fxtrading")
cur = conn.cursor()

# Update the tier
cur.execute("UPDATE users SET subscription_tier = 'AUTOMATED_EXECUTION' WHERE email = 'abdujude@gmail.com';")
conn.commit()

# Verify the update
cur.execute("SELECT email, subscription_tier FROM users WHERE email = 'abdujude@gmail.com';")
print("🎯 DB Status:", cur.fetchone())

cur.close()
conn.close()