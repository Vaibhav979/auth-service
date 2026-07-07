import * as userRepo from "./user.repo";

export const getAllUsers = async () => {
    return userRepo.getAllUsers();
}