export interface Backend {
    login({ username, password }): Promise<{ token: string }>
}

