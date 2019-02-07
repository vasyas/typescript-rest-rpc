export interface Backend {
    auth: AuthService
    logged: LoggedBackend
}

export interface LoggedBackend {
    client: ClientService
}

export interface Client {
    id: number
    name: string
    lastModified: Date
}

export interface AuthService {
    login({ username, password }): Promise<{ token: string }>
    sendResetPassword({ username }): Promise<void>
}

export interface ClientService {
    getClient({ id }: { id: number }): Promise<Client>
    getAllClients(): Promise<Client[]>
}
