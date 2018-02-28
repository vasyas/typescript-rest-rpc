import 'isomorphic-fetch'

import { createClient } from "../src"
import { Backend } from "./shared"

(async function() {
    try {
        const client: Backend = createClient("http://localhost:9090/api")

        console.log(await client.login({username: "admin", password: "123456"}))
    } catch (e) {
        console.log(e)
    }
})()