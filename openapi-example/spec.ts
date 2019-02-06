export interface Backend {
    auth: AuthService
    client: ClientService
}

export interface AuthService {
    login({ username, password }): Promise<{ token: string }>
}

export interface ClientService {
    getClient({ id }: { id: number }): Promise<void>
}
