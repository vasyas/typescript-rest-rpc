import { expect } from 'chai'
import { ClientOperationDescription } from "../src/client"

describe('client operator test', () => {
    it('get renders arg to query string', () => {
        const operation = new ClientOperationDescription("getClients", [{ page: 1, size: 10, missing: null, empty: '' }])
        expect(operation.getMethod()).eql("GET")
        expect(operation.getBody()).is.null
        expect(operation.getUrl()).eql("/clients?page=1&size=10&empty=")
    });
});
