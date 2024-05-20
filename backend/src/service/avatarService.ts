import { AVATAR_REPOSITORY } from "../config/macros.ts";
import { AvatarRepository } from "../repository/avatarRepository.ts";
import { container } from "../utils/container.ts";

export class AvatarService {

    private avatarRepository: AvatarRepository;

    constructor() {
        const avatarRepo = container.resolve(AVATAR_REPOSITORY);

        if (avatarRepo == null) {
            const newAvatarRepo = new AvatarRepository();
            container.register(AVATAR_REPOSITORY, newAvatarRepo);
            this.avatarRepository = newAvatarRepo;
        } else {
            this.avatarRepository = avatarRepo;
        }
    }

    async getAllAvatars() {
        return await this.avatarRepository.findAll();
    }

    async getAvatarByID(id: number){
        return await this.avatarRepository.findById(id);
    }
}