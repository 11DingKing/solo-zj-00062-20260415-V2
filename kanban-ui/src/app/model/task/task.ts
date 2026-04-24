import { TaskHistory } from './task-history';

export class Task {
    
    id: number;
    title: String;
    description: String;
    color: String;
    status: string;
    dueDate: string;
    history?: TaskHistory[];
}

export const TASK_STATUS = {
    TODO: 'TODO',
    IN_PROGRESS: 'INPROGRESS',
    DONE: 'DONE',
    ARCHIVED: 'ARCHIVED'
};

export function getAllowedTransitions(status: string): string[] {
    switch (status) {
        case TASK_STATUS.TODO:
            return [TASK_STATUS.IN_PROGRESS];
        case TASK_STATUS.IN_PROGRESS:
            return [TASK_STATUS.TODO, TASK_STATUS.DONE];
        case TASK_STATUS.DONE:
            return [TASK_STATUS.ARCHIVED];
        case TASK_STATUS.ARCHIVED:
            return [];
        default:
            return [];
    }
}

export function canTransitionTo(from: string, to: string): boolean {
    return getAllowedTransitions(from).includes(to);
}

export function isImmutable(status: string): boolean {
    return status === TASK_STATUS.ARCHIVED;
}

export function isDoneOrArchived(status: string): boolean {
    return status === TASK_STATUS.DONE || status === TASK_STATUS.ARCHIVED;
}
