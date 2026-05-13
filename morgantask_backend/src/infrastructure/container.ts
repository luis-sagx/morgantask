import { MongoTaskRepository } from './repositories/MongoTaskRepository'
import { MongoProjectRepository } from './repositories/MongoProjectRepository'
import { MongoUserRepository } from './repositories/MongoUserRepository'
import { MongoNoteRepository } from './repositories/MongoNoteRepository'
import { AuthUseCases } from '../application/usecases/AuthUseCases'
import { ProjectUseCases } from '../application/usecases/ProjectUseCases'
import { TaskUseCases } from '../application/usecases/TaskUseCases'
import { NoteUseCases } from '../application/usecases/NoteUseCases'
import { TeamUseCases } from '../application/usecases/TeamUseCases'

const taskRepository = new MongoTaskRepository()
const projectRepository = new MongoProjectRepository()
const userRepository = new MongoUserRepository()
const noteRepository = new MongoNoteRepository()

export const authUseCases = new AuthUseCases(userRepository)
export const projectUseCases = new ProjectUseCases(projectRepository)
export const taskUseCases = new TaskUseCases(taskRepository, projectRepository)
export const noteUseCases = new NoteUseCases(noteRepository, taskRepository)
export const teamUseCases = new TeamUseCases(projectRepository, userRepository)
