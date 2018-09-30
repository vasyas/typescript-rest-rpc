import { expect } from 'chai'
import { ClientOperationDescription } from "../src/client"

describe('client operator test', () => {
    describe('get renders arg to query string', () => {
        it('supportrs different params types', () => {
            const operation = new ClientOperationDescription("getClients", [{ page: 1, size: 10, missing: null, empty: '' }])
            expect(operation.getMethod()).eql("GET")
            expect(operation.getBody()).is.null
            expect(operation.getUrl()).eql("/clients?page=1&size=10&empty=")
        })

        it('supportrs arrays', () => {
            const operation = new ClientOperationDescription("getClients", [{ page: [1, 2, 3] }])
            expect(operation.getMethod()).eql("GET")
            expect(operation.getBody()).is.null
            expect(operation.getUrl()).eql("/clients?page=1&page=2&page=3")
        })

        it('empty array no param', () => {
            const operation = new ClientOperationDescription("getClients", [{ page: [] }])
            expect(operation.getMethod()).eql("GET")
            expect(operation.getBody()).is.null
            expect(operation.getUrl()).eql("/clients")
        })
    });
});
