/**
 * Makes an request.Has the below capabilities
    * - adds Auth token to the header`
 */
function makeRequest(url, options = {}) {
  const newHeaders = options.headers || {};
  if (AUTH_TOKEN) {
    newHeaders.Authentication = `Token ${AUTH_TOKEN} `;
  }

  return new Promise((resolve, reject) => {
    // store the request response so we can use it in `then` and `catch ` block.
    let reqResponse = null;

    fetch(url, {
      method: 'GET',
      ...options,
    })
      .then((response) => {
        reqResponse = response;

        if (response.ok) {
          // if (response.headers.contentType === JSON_MIME_TYPE) {
          return response.json();
          // } else {
          // return response.text();
          // }
        } else {
          reject(`Request ${url} failed.Server responded with status ${response.status} `);
        }
      })
      .then(async (data) => {
        let shouldReturn = true;

        // Do we have a hook, we expect the hook to return if we should proceed or not..
        if (responseHook) {
          shouldReturn = await responseHook(reqResponse, data);
        }
        if (shouldReturn) {
          resolve(data);
        }
      })
      .catch(async (ex) => {
        let shouldReturn = true;

        // Do we have a hook, we expect the hook to return if we should proceed or not..
        if (responseHook) {
          shouldReturn = await responseHook(reqResponse, ex);
        }

        if (shouldReturn) {
          reject(ex);
        }
      });
  });
}

/**
 * Build the url with passed in object as query param
 * This is useful for GET query.
 */
function buildUrlWithQuery(url, params) {
  const queryParts = [];
  Object.keys(params).forEach(p => {
    queryParts.push(`${p}=${params[p]} `);
  });

  return `${url} ${queryParts.length ? `?${queryParts.join('&')}` : ''} `;
}

/**
 * Make a GET call to the url and passed in param as object.
 */
export function get(url, params = {}) {
  return makeRequest(buildUrlWithQuery(url, params));
}

/**
 * Make a GET JSON call to the url and passed in param as object.
 */
export function getJSON(url, params = {}) {
  return makeRequest(buildUrlWithQuery(url, params), {
    headers: {
      'Content-Type': JSON_MIME_TYPE,
    }
  });
}

/**
 * Make a POST JSON call to the url.
 */
export function postJSON(url, body = {}) {
  return makeRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': JSON_MIME_TYPE,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Make a POST JSON call to the url.
 */
export function putJSON(url, body = {}) {
  return makeRequest(url, {
    method: 'PUT',
    headers: {
      'Content-Type': JSON_MIME_TYPE,
    },
    body: JSON.stringify(body),
  });
}
