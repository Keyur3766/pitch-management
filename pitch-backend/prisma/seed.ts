import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, SlotStatus } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

async function main() {

    await prisma.pitch.deleteMany();

    /* Create Pitches and Slots */
    const pitches = [
        {
            name: "Arena Turf",
            location: "Ahmedabad",
            price_per_hour: 1200,
        },
        {
            name: "Champions Ground",
            location: "Surat",
            price_per_hour: 1500,
        },
        {
            name: "Victory Sports Hub",
            location: "Vadodara",
            price_per_hour: 1000,
        },
    ];

    for (const pitchData of pitches) {
        const pitch = await prisma.pitch.create({
            data: {
                ...pitchData,
            },
        });

        console.log(`Created 24 slots for ${pitch.name}`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });