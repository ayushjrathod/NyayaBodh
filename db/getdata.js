const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Fetch all data from global_index along with related summary and ner
  const allData = await prisma.global_index.findMany({
    include: {
      summary: true,
      ner: true,
    },
  });

  // Convert the data to a JSON string
  const jsonData = JSON.stringify(allData, null, 2);

  // Write the JSON data to a file
  fs.writeFileSync("fetchedData.json", jsonData, "utf-8");

  console.log("Data has been written to fetchedData.json");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
