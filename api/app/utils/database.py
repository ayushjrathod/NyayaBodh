import logging
from dotenv import load_dotenv
from prisma import Prisma

load_dotenv()

logger = logging.getLogger(__name__)
prisma = Prisma()
