const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const makeUrl = (baseUrl, path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimTrailingSlash(baseUrl)}${normalizedPath}`;
};

export const API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"
);

export const PYTHON_API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_PYTHON_API_BASE_URL || "http://localhost:8000"
);

export const apiUrl = (path) => makeUrl(API_BASE_URL, path);
export const pythonApiUrl = (path) => makeUrl(PYTHON_API_BASE_URL, path);
