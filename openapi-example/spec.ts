export interface Backend {
    auth: AuthService
    client: ClientService
}

export interface Client {
    id: number
    name: string
    lastModified: Date
}

export interface AuthService {
    login({ username, password }): Promise<{ token: string }>
}

export interface ClientService {
    getClient({ id }: { id: number }): Promise<Client>
    getAllClients(): Promise<Client[]>
}
