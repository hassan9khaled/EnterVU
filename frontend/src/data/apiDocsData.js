import postmanCollection from '../../../backend/app/assets/EnterVU_API_V2.json';

// This function processes the raw Postman collection into a simpler format for our UI.
function simplifyCollection(collection) {
    return collection.item.map(folder => ({
        name: folder.name,
        description: folder.description,
        endpoints: folder.item.map(endpoint => {
            const request = endpoint.request;
            const url = request.url.raw.replace(/{{base_url}}/g, '');
            const method = request.method;
            const description = request.description || 'No description available.';
            
            let exampleBody = null;
            if (request.body && request.body.raw) {
                try {
                    exampleBody = JSON.stringify(JSON.parse(request.body.raw), null, 2);
                } catch (e) {
                    exampleBody = request.body.raw;
                }
            }
            
            let exampleResponse = null;
            if (endpoint.response && endpoint.response[0] && endpoint.response[0].body) {
                 try {
                    exampleResponse = JSON.stringify(JSON.parse(endpoint.response[0].body), null, 2);
                } catch (e) {
                    exampleResponse = endpoint.response[0].body;
                }
            }

            return {
                name: endpoint.name,
                method,
                url,
                description,
                exampleBody,
                exampleResponse,
            };
        })
    }));
}

export const apiDocsData = simplifyCollection(postmanCollection);
