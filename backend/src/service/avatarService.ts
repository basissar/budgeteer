import { AvatarRepository } from "../repository/avatarRepository.ts";

export class AvatarService {

    private avatarRepository: AvatarRepository;

    constructor(avatarRepository: AvatarRepository) {
        this.avatarRepository = avatarRepository;
    }

    async getAllAvatars() {
        return await this.avatarRepository.findAll();
    }

    async getAvatarByID(id: number){
        return await this.avatarRepository.findById(id);
    }
}