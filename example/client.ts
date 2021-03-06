import 'isomorphic-fetch'

import { createClient } from "../src/client"
import { Backend } from "./shared"

(async function() {
    try {
        const client: Backend = createClient("http://localhost:9090/api")

        console.log(await client.login({ username: "admin", password: "123456" }))

        await client.login({ username: "invalid", password: "password" })
    } catch (e) {
        console.log(e)
    }
})()