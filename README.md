# Simple  WebSocket Server for Maverick

A simple node.js WebSocket server that reads a JSON file and sends its contents to Maverick.

## Usage


### 1. Run the server:

```
node server.js <filename>
```

#### Arguments

- `<filename>`: Path to the JSON file containing an array of data.

#### Example

```
node server.js data/example.json
```

### 2. Configure Maverick to use the server:

```
[server]
addr = "ws://localhost:8080"
```

### 3. Run Maverick

On macOS/Linux:
```
./maverick
```

On Windows:
```
maverick.exe
```
