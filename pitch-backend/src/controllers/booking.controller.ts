import type { Request, Response } from 'express';
import { ApiResponse } from "../utils/ApiResponse.js";
import prisma from "../../db/prisma-client.js";
import { BookingStatus, SlotStatus } from "@prisma/client";
import { redisClient } from "../lib/redis.js";


const reserverBooking = async(req: Request, res: Response) => {
    try {
        const userId: number = Number(req.user?.id);

        const {
            date,
            pitchId,
            starttimeStamp,
            endTimestamp
        } = req.body;

        /* Lock using Redis */
        const lockKey =
            `lock:pitch:${Number(pitchId)}:${starttimeStamp}`;
        
        
        const lock = await redisClient.set(
            lockKey,
            String(userId),
            {
                NX: true,
                EX: 120
            }
        );

        if (!lock) {
            return res.status(400).json({
                success: false,
                message:
                    "Slot is currently reserved by another user"
            });
        }

        let slot = await prisma.slot.findFirst({
            where: {
                pitchId: Number(pitchId),
                start_time: new Date(starttimeStamp),
                end_time: new Date(endTimestamp)
            }
        });

        if (!slot) {

            slot = await prisma.slot.create({
                data: {
                    pitchId: Number(pitchId),
                    start_time: new Date(starttimeStamp),
                    end_time: new Date(endTimestamp),
                    status: SlotStatus.NOT_AVAILABLE
                }
            });

        }
        /* Check overlapping booking */
        const existingBooking =
            await prisma.booking.findFirst({
                where: {
                    slotId: slot.id,

                    OR: [
                        {
                            status:
                                BookingStatus.BOOKED
                        },
                        {
                            status:
                                BookingStatus.BOOKING_IN_PROGRESS,

                            expires_at: {
                                gt: new Date()
                            }
                        }
                    ]
                }
            });

        if (existingBooking) {
            // release redis lock
            await redisClient.del(lockKey);

            return res.status(400).json({
                success: false,
                message: "Slot already booked"
            });
        }

        

        

        // Create booking
        const bookingCreate = await prisma.booking.create({
            data: {
                slotId: slot.id,
                userId: Number(userId),
                pitchId: Number(pitchId),
                booking_date: new Date(date),
                status: BookingStatus.BOOKING_IN_PROGRESS,
                expires_at: new Date(
                    Date.now() + 120000
                )
            }
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                bookingCreate,
                "Slot reserved for 2 minutes"
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
    req: Request,
    res: Response
) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });
        }

        const booking = await prisma.booking.findUnique({
            where: {
                id: Number(bookingId)
            },
            include: {
                slot: true
            }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Reservation expiry
        if (
            booking.expires_at &&
            booking.expires_at < new Date()
        ) {
            await prisma.booking.update({
                where: {
                    id: booking.id
                },
                data: {
                    status: BookingStatus.EXPIRED
                }
            });


            return res.status(400).json({
                success: false,
                message: "Reservation expired"
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

const getAllPitches = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const pitches = await prisma.pitch.findMany({
            orderBy: {
                id: "desc"
            }
        });

        return res.status(200).json({
            success: true,
            data: pitches
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getSlotsByPitchAndDate = async (
    req: Request,
    res: Response
): Promise<Response> => {

    try {

        const pitchId = Number(req.query.pitchId);

        const date = String(req.query.date);

        if (!pitchId || !date) {

            return res.status(400).json({
                success: false,
                message: "pitchId and date are required"
            });
        }

        const startOfDay = new Date(date);

        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);

        endOfDay.setHours(23, 59, 59, 999);

        const slots = await prisma.slot.findMany({
            where: {
                pitchId,

                start_time: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },

            include: {
                booking: true
            },

            orderBy: {
                start_time: "asc"
            }
        });

        const formattedSlots = slots.map((slot) => {
            const activeBooking = slot.booking.find((booking) => {

                // CONFIRMED BOOKING
                if (
                    booking.status === BookingStatus.BOOKED
                ) {
                    return true;
                }

                // ACTIVE TEMP RESERVATION
                if (
                    booking.status ===
                    BookingStatus.BOOKING_IN_PROGRESS &&

                    booking.expires_at &&
                    booking.expires_at > new Date()
                ) {
                    return true;
                }

                return false;
            });

            const isBooked = !!activeBooking;
            

            return {
                slotId: slot.id,
                startTime: slot.start_time,
                endTime: slot.end_time,
                available: !isBooked
            };
        });

        return res.status(200).json({
            success: true,
            data: formattedSlots
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getMyBookings = async (
    req: Request,
    res: Response
): Promise<Response> => {

    try {
        const userId = Number(req.user?.id)

        const bookings = await prisma.booking.findMany({
            where: {
                userId,

                NOT: {
                    status: BookingStatus.EXPIRED,
                }
            },

            include: {

                pitch: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        price_per_hour: true
                    }
                },

                slot: {
                    select: {
                        id: true,
                        start_time: true,
                        end_time: true
                    }
                }
            },

            orderBy: {
                created_at: "desc"
            }
        });

        const formattedBookings =
            bookings.filter((booking) => {

                // REMOVE EXPIRED TEMP BOOKINGS
                if (
                    booking.status ===
                    BookingStatus.BOOKING_IN_PROGRESS &&

                    booking.expires_at &&
                    booking.expires_at < new Date()
                ) {
                    return false;
                }

                return true;
            }).map((booking) => {

                return {

                    bookingId: booking.id,

                    status: booking.status,

                    bookingDate:
                        booking.booking_date,

                    createdAt:
                        booking.created_at,

                    expiresAt:
                        booking.expires_at,

                    pitch: booking.pitch,

                    slot: {
                        slotId: booking.slot.id,

                        startTime:
                            booking.slot.start_time,

                        endTime:
                            booking.slot.end_time
                    }
                };
            });

        return res.status(200).json({
            success: true,
            data: formattedBookings
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
    confirmBooking,
    getAllPitches,
    getSlotsByPitchAndDate,
    getMyBookings
}