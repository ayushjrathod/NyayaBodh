\
import logging
from dotenv import load_dotenv
from prisma import Prisma

# Load environment variables once for the application
load_dotenv()

logger = logging.getLogger(__name__)
prisma = Prisma()
