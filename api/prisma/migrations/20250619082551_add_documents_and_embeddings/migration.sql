-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "filename" TEXT,
    "petitioner" TEXT,
    "respondent" TEXT,
    "summary" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentEmbedding" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "embedding" JSONB NOT NULL,
    "model_name" TEXT NOT NULL DEFAULT 'sentence-transformers/all-MiniLM-L6-v2',
    "dimension" INTEGER NOT NULL DEFAULT 384,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_uuid_key" ON "Document"("uuid");

-- CreateIndex
CREATE INDEX "Document_uuid_idx" ON "Document"("uuid");

-- CreateIndex
CREATE INDEX "Document_petitioner_idx" ON "Document"("petitioner");

-- CreateIndex
CREATE INDEX "Document_respondent_idx" ON "Document"("respondent");

-- CreateIndex
CREATE INDEX "DocumentEmbedding_document_id_idx" ON "DocumentEmbedding"("document_id");

-- CreateIndex
CREATE INDEX "DocumentEmbedding_model_name_idx" ON "DocumentEmbedding"("model_name");

-- AddForeignKey
ALTER TABLE "DocumentEmbedding" ADD CONSTRAINT "DocumentEmbedding_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
