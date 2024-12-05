-- CreateTable
CREATE TABLE "global_index" (
    "uuid" TEXT NOT NULL,
    "filename" TEXT NOT NULL,

    CONSTRAINT "global_index_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "summary" (
    "id" SERIAL NOT NULL,
    "summary" TEXT NOT NULL,
    "global_index_uuid" TEXT NOT NULL,

    CONSTRAINT "summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ner" (
    "uuid" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "CASE_NUMBER" TEXT NOT NULL,
    "COURT" TEXT NOT NULL,
    "DATE" TEXT,
    "GPE" TEXT NOT NULL,
    "JUDGE" TEXT NOT NULL,
    "LAWYER" TEXT NOT NULL,
    "ORG" TEXT NOT NULL,
    "OTHER_PERSON" TEXT NOT NULL,
    "PETITIONER" TEXT NOT NULL,
    "PRECEDENT" TEXT NOT NULL,
    "PROVISION" TEXT NOT NULL,
    "RESPONDENT" TEXT NOT NULL,
    "STATUTE" TEXT NOT NULL,
    "WITNESS" TEXT NOT NULL,
    "global_index_uuid" TEXT NOT NULL,

    CONSTRAINT "ner_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "summary_global_index_uuid_key" ON "summary"("global_index_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ner_global_index_uuid_key" ON "ner"("global_index_uuid");

-- AddForeignKey
ALTER TABLE "summary" ADD CONSTRAINT "summary_global_index_uuid_fkey" FOREIGN KEY ("global_index_uuid") REFERENCES "global_index"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ner" ADD CONSTRAINT "ner_global_index_uuid_fkey" FOREIGN KEY ("global_index_uuid") REFERENCES "global_index"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
