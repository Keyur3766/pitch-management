import { ApiResponse } from "../utils/ApiResponse.js";
import prisma from "../../db/prisma-client.js";
import { BookingStatus, SlotStatus } from "@prisma/client";


const reserverBooking = async(req: any, res: any) => {
    try {
        const userId: number = req.user.id;

        const {
            date,
            pitchId,
            starttimeStamp,
            endTimestamp
        } = req.body;

        // Check overlapping booking
        const existingBooking = await prisma.booking.findFirst({
            where: {
                pitchId,
                status: {
                    in: [
                        BookingStatus.BOOKING_IN_PROGRESS,
                        BookingStatus.BOOKED
                    ]
                },
                slot: {
                    start_time: {
                        lt: new Date(endTimestamp)
                    },
                    end_time: {
                        gt: new Date(starttimeStamp)
                    }
                }
            },
            include: {
                slot: true
            }
        });

        if (existingBooking) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "Booking already exists."
                )
            );
        }

        
        let slot = await prisma.slot.findFirst({
            where: {
                pitchId,
                start_time: new Date(starttimeStamp),
                end_time: new Date(endTimestamp)
            }
        });

        if (!slot) {
            slot = await prisma.slot.create({
                data: {
                    pitchId,
                    start_time: new Date(starttimeStamp),
                    end_time: new Date(endTimestamp),
                    status: SlotStatus.NOT_AVAILABLE
                }
            });
        }

        // Create booking
        const bookingCreate = await prisma.booking.create({
            data: {
                slotId: slot.id,
                userId: Number(userId),
                pitchId: Number(pitchId),
                booking_date: new Date(date),
                status: BookingStatus.BOOKING_IN_PROGRESS
            }
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                bookingCreate,
                "Booking created successfully"
            )
        );

    }
    catch (error: any) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}

const confirmBooking = async (
    req: any,
    res: any
) => {
    try {
        const { bookingId } = req.body;
        const userId: number = req.user.id;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });
        }

        // Find booking
        const booking = await prisma.booking.findFirst({
            where: {
                id: Number(bookingId)
            },
            include: {
                slot: true,
                pitch: true,
                user: true
            }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Prevent duplicate confirmation
        if (booking.status === BookingStatus.BOOKED) {
            return res.status(400).json({
                success: false,
                message: "Booking already confirmed"
            });
        }

        // Confirm booking
        const updatedBooking = await prisma.booking.update({
            where: {
                id: booking.id
            },
            data: {
                status: BookingStatus.BOOKED
            },
            include: {
                slot: true,
                pitch: true,
                user: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Booking confirmed successfully",
            data: updatedBooking
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export {
    reserverBooking,
    confirmBooking
}