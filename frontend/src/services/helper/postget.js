

export class POSTGET {
    /**
     * @type {RequestType}
     */
    static async request(url, init) {
        return new POSTGET().request(url, init);
    }

    /**
     * @private
     * @type {RequestType}
     */
    async request(url, init) {
        const CTYPE = 'Content-Type';
        const headers = {};
        let body = init.body;

        if(init.bodyType) {
            switch(init.bodyType) {
                case 'HTML':
                    headers[CTYPE] = 'text/html'
                    break
                case 'JS':
                    headers[CTYPE] = 'application/javascript'
                    break
                case 'JSON':
                    headers[CTYPE] = 'application/json'
                    body = JSON.stringify(init.body);
                    break;
                case 'Text':
                    headers[CTYPE] = 'application/plain'
                    break
                case 'XML':
                    headers[CTYPE] = 'application/xml'
                    break;
                default:
                    headers[CTYPE] = init.bodyType
                    break;
            }
        } else if(typeof init.body === 'object') {
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(init.body)
        }

        try {
            const response = await fetch(url, {
                method: init.method,
                headers: {
                    ...headers,
                    ...init.headers
                },
                body,
            });
    
            if (!response.ok) {
                throw new Error(data?.message || `Ошибка ${response.status}`);
            }
    
            return response;
            
        } catch (error) {
            console.log(error?.message || `Ошибка ${response.status}`)
            throw error
        }
    }
}