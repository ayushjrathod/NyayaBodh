const fs = require("fs");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const results = [];

  fs.createReadStream("./ner_data.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      for (const row of results) {
        await prisma.global_index.create({
          data: {
            uuid: row.uuid,
            filename: row.file_name,
            summary: row.summary
              ? {
                  create: {
                    summary: row.summary,
                  },
                }
              : undefined,
            ner: {
              create: {
                uuid: row.uuid,
                file_name: row.file_name,
                CASE_NUMBER: row.CASE_NUMBER,
                COURT: row.COURT,
                DATE: row.DATE,
                GPE: row.GPE,
                JUDGE: row.JUDGE,
                LAWYER: row.LAWYER,
                ORG: row.ORG,
                OTHER_PERSON: row.OTHER_PERSON,
                PETITIONER: row.PETITIONER,
                PRECEDENT: row.PRECEDENT,
                PROVISION: row.PROVISION,
                RESPONDENT: row.RESPONDENT,
                STATUTE: row.STATUTE,
                WITNESS: row.WITNESS,
              },
            },
          },
        });
      }
      console.log("Data imported successfully");
      await prisma.$disconnect();
    });
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
