import { prisma } from "../config/prisma"; 

export const getAllUsers = async () => {
    return prisma.user.findMany();
}