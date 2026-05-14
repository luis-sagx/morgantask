import { IPublicUser } from '../../domain/entities/User'
import { IProjectRepository } from '../../domain/ports/IProjectRepository'
import { IUserRepository } from '../../domain/ports/IUserRepository'

export class TeamUseCases {
    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly userRepository: IUserRepository
    ) {}

    async findMemberByEmail(email: string): Promise<IPublicUser> {
        const user = await this.userRepository.findByEmailPublic(email)
        if (!user) throw new Error('Usuario No Encontrado')
        return user
    }

    async getTeam(projectId: string): Promise<IPublicUser[]> {
        return this.projectRepository.getTeamPopulated(projectId)
    }

    async addMember(projectId: string, userId: string): Promise<void> {
        const user = await this.userRepository.findByIdPublic(userId)
        if (!user) throw new Error('Usuario No Encontrado')

        const project = await this.projectRepository.findById(projectId)
        if (project.team.includes(userId)) throw new Error('El usuario ya existe en el proyecto')

        await this.projectRepository.addMember(projectId, userId)
    }

    async removeMember(projectId: string, userId: string): Promise<void> {
        const project = await this.projectRepository.findById(projectId)
        if (!project.team.includes(userId)) throw new Error('El usuario no existe en el proyecto')

        await this.projectRepository.removeMember(projectId, userId)
    }
}
