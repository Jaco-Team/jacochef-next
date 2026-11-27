import { setupServer } from "msw/node";

export const server = setupServer();
const unhandledRequests = [];

export function rejectUnhandledRequest(request, print) {
  unhandledRequests.push({ method: request.method, url: request.url });
  print.error();
}

export function takeUnhandledRequests() {
  return unhandledRequests.splice(0);
}
