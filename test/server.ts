import { expect } from 'chai'
import { createServerRouter } from "../src/server"

describe('Server invocation', () => {
    it('parse GET parameters', () => {
        let passedParams = null

        const router = createServerRouter("", {
            getSmth(params) {
                passedParams = params
                return "ok"
            }
        })

        router.routes().call(null, {
            method: 'GET',
            path: "/smth",
            request: {
                is: () => false
            },
            query: { a: 'b', c: 'd' }
        }, () => {})

        expect(passedParams).to.eql({
            a: 'b',
            c: 'd'
        })
    });
});
