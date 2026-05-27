-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'EXPIRED';

-- DropIndex
DROP INDEX "Booking_slotId_key";
