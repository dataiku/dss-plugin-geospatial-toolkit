/*
Helper function to query webapp backend with a default implementation for error handling
v 1.0.1
*/

function checkMandatoryParameters(param, webAppConfig) {
    if (param.mandatory) {
        let val = webAppConfig[param.name];
        if (val === null || val === "") {
            throw new Error("Mandatory column '" + param.name + "' not specified.");
        }
    }
}


function isEqual(object1, object2) {
    return JSON.stringify(object1) === JSON.stringify(object2)
}


dataiku.webappBackend = (function() {
    function getUrl(path) {
        return dataiku.getWebAppBackendUrl(path);
    }

    function post(path, body={}, displayErrors=true) {
        console.log("[POST Fix]", body);

        return fetch(`${getUrl(path)}?`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(response => {
                if (response.status == 502) {
                    throw Error("Webapp backend not started");
                } else if (response.status == 414) {
                    throw Error("Exclude filter might be too long, select at least one value");
                }
                else if (!response.ok) {
                    response.text().then(text => dataiku.webappMessages.displayFatalError(`Backend error:\n${text}.\nCheck backend log for more information.`))
                    throw Error("Response not ok!")
                }
                try {
                    return response.json();
                } catch {
                    throw Error('The backend response is not JSON: '+ response.text());
                }
            })
            .catch(function(error) {
                if (displayErrors && error.message && !error.message.includes('not started')) { // little hack, backend not started should be handled elsewhere
                    dataiku.webappMessages.displayFatalError(error)
                }
                throw error;
            });
    }

    return Object.freeze({getUrl, post: post});
})();


dataiku.webappMessages = (function() {
    function displayFatalError(err) {
        $("#error-message").text(err);
        $("#error-warning-view").show();
    }
    return  Object.freeze({displayFatalError})
})();
