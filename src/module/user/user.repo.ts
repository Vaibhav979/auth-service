import { prisma } from "../../config/prisma";

export const find = async (email: string) => {
    return prisma.user.findUnique({
        where: {
            email
        }, select: {
            id: true,
            name: true,
            password: true,
            email: true,
            role: true
        }
    });
};

export const findById = async (id: string) => {
    return prisma.user.findUnique({
        where: {
            id: id
        }
    });
};

export const create = async (name: string, email: string, hashedPassword: string) => {
    return prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }, select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
};

export const getAllUsers = async () => {
    return prisma.user.findMany();
}