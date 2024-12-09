from prisma import Prisma

def init_db():
    prisma = Prisma()
    prisma.connect()
    # Prisma uses migrations, ensure to run `prisma migrate deploy` externally
    print("Database initialized with Prisma migrations.")

if __name__ == "__main__":
    init_db()
