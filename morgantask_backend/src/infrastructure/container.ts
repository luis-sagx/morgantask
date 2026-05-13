import { AuthUseCases } from '../application/usecases/AuthUseCases'
import { NoteUseCases } from '../application/usecases/NoteUseCases'
import { ProjectUseCases } from '../application/usecases/ProjectUseCases'
import { TaskUseCases } from '../application/usecases/TaskUseCases'
import { TeamUseCases } from '../application/usecases/TeamUseCases'

import { MongoNoteRepository } from './repositories/MongoNoteRepository'
import { MongoProjectRepository } from './repositories/MongoProjectRepository'
import { MongoTaskRepository } from './repositories/MongoTaskRepository'
import { MongoUserRepository } from './repositories/MongoUserRepository'

const taskRepository = new MongoTaskRepository()
const projectRepository = new MongoProjectRepository()
const userRepository = new MongoUserRepository()
const noteRepository = new MongoNoteRepository()

export const authUseCases = new AuthUseCases(userRepository)
export const projectUseCases = new ProjectUseCases(projectRepository)
export const taskUseCases = new TaskUseCases(taskRepository, projectRepository)
export const noteUseCases = new NoteUseCases(noteRepository, taskRepository)
export const teamUseCases = new TeamUseCases(projectRepository, userRepository)
