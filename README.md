# servera

Simple web development server focused on two things:

- Serve things
- Provide hooks for change notifications

**NOTE:** This server must not be used in production. It isn't nearly as fast as many other available products, and probably has many severe security issues. Do not – under any circumstance – use this for anything but local web development purposes.

# Installation

```bash
$ npm install --save-dev @websdk/servera
```

# Usage

```bash
usage: servera [<root>] [options ...]

arguments:

  <root>

    The root path from which files will be served. Clients will not be able to request files outside of this path. Symbolic links will not be resolved. (Default: current working directory.)

options:

  -h,--help

    Prints this information.

  -p,--port=<pattern>

    Port to listen on. The following patterns are valid:

    - Single numeric value: e.g. `8080`
    - Inclusive range: `8080-9090`
    - Random: `random` or `0`
    - Combinations: `1337,8080-9090,random`

    If multiple patterns are used, they are attempted in order until one works; or the list of ports is exhausted in which case the server exits with an error. (Default: `random`.)

  -a,--address=<value>

    Address to listen on. If omitted, the server will accept connections on any IPv4 address (0.0.0.0).

  --no-dir

    By default, the server will generate a directory listing whenever the requested URL path refers to a path under `<root>`. If this option is present, this behaviour is disabled.

  -s,--silent

    Suppresses all messages except errors.

  -o,--open[=<browser>]

    Opens a browser after starting the server. Also enables a shortcut to open a browser, whenever pressed in the terminal. The shortcut is presented in the terminal output when the server starts. The list of available browsers is dependant on environment, and unless `<browser>` is specified whatever is the system default will be opened. Use `--no-open` to avoid opening a browser.

  -c,--cache[=<seconds>]

    Controls how resources are cached. E.g. to cache resources for 30 seconds, use `-c 10` or `--cache 10`. Set to 0 to disable caching. (Default: 0)

  --proxy=<url>

    If set, the server will proxy any requests that can't be resolved to `<url>`. The request is not redirected, so the URL doesn't change, but whatever response is returned from `<url>` is proxied. This can be used to proxy paths.

  --cors

    Enable CORS.
```

## Triggering updates

When the server has started, it is possible to trigger updates by sending a request to `./well-known/updates/{path}` – where `{path}` is the path relative to `<root>` that was updated. The following content types of this update request are supported:

- `application/json`: the body *must* be an array of strings, which represent the paths relative to `<root>` that should be updated
- `text/plain`: the body will be split on line breaks, and each line should be a path relative to `<root>`

The HTTP method of the request represents certain semantics, and trigger different events:

- `PUT` will trigger a `create` event
- `POST` will trigger an `update` event
- `DELETE` will trigger a `delete` event

Any other method, including `GET`, is not supported.

## Handling updates

Clients that opt to polling only have to `GET ./well-known/updates` to retrieve the updates of all files under `<root>`. This will include *all* updates, based on file creation and modification times. Because of this, files that were deleted will not be present. The server will be able to return updates in `application/json` or `text/plain` format.

Clients may opt to stream updates, in which case they will not only receive `create` and `update` events, but also `delete` events. To do this, clients should request `Content-Type: text/event-stream`. This will return a stream of events, whenever files are created, updated, or deleted.

To listen for updates, a client can `GET ./well-known/updates`. If the content type of the request is `Content-Type: text/event-stream` a stream of events will be returned.

# Rationale

Most development servers try too hard to please, and do things like watch for file changes and what not. These might seem like *good things* but they really aren't. It's incredibly difficult, perhaps impossible even, to generalize logic for dealing with project updates and particularly so in the rapidly changing world of web development. Some questions that inevitably arise when trying to create a highly interactive development environment:

- Which files should trigger reloads?
- Is a reload a full page reload?
- Can bits of code be replaced without replacing others?
- Should styles be reloaded?
- How do you notify connected clients?
- Must developers include special logic to deal with all this?
- Why is all the rum gone?

The approach of this server is the eschew all those responsibilities that inexorably ends up in its lap, were it to actually watch for changes. Instead, it provides APIs to easily notify the server that some files changed, and that those files should trigger some sort of update. When such a trigger happens, it lets the client know – if it cares – such that the *client* can deal with those events.

--

[License](LICENSE)