-- CreateTable
CREATE TABLE "Rent_Extensions" (
    "id" SERIAL NOT NULL,
    "rentId" INTEGER NOT NULL,
    "extendedDaysQuantity" INTEGER NOT NULL,
    "status" "Status" NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentType" "PaymentType" NOT NULL,

    CONSTRAINT "Rent_Extensions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rent_Extensions" ADD CONSTRAINT "Rent_Extensions_rentId_fkey" FOREIGN KEY ("rentId") REFERENCES "Rent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
