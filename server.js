/**
 * A simple WebSocket server that reads a JSON file and sends its contents to Maverick.
 *
 * Usage:
 *   node server.js <filename>
 *
 * Arguments:
 *   <filename>  Path to the JSON file containing an array of data.
 *
 * Example:
 *   node server.js data/example.json
 *
 * The server listens on ws://localhost:8080 and sends each element of the JSON array
 * to Maverick as soon as it connects and reports a "SessionReady" event.
 * 
 * Make sure to configure Maverick to use this server.
 * 
 */


const WebSocket = require('ws');
const fs = require('fs');

// Get the JSON file name from command-line arguments
const filename = process.argv[2];

if (!filename) {
    console.error('Usage: node server.js <filename>');
    process.exit(1);
}

// Read and parse the JSON commandsfile
let commands = []
try {
    const fileContent = fs.readFileSync(filename, 'utf8');
    commands = JSON.parse(fileContent);
    if (!Array.isArray(commands)) {
        throw new Error('JSON content is not an array');
    }
    console.log(`Loaded ${commands.length} commands from ${filename}`);
}
catch (error) {
    console.error('Error reading or parsing JSON file:', error.message);
    process.exit(1);
}

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 }, () => {
    console.log('WebSocket server started on ws://localhost:8080');
    console.log("Configure Maverick to connect to this server.")
});

// An await-able sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Prints a 30-char preview of the command
function printCommandPreview(command) {
    console.log(`Sending command: ${JSON.stringify(command).substring(0, 50)}${command.length > 50 ? '...' : ''}`);
}

// Handle new Maverick connections
wss.on('connection', (ws) => {
    console.log('Maverick connected');

    // Handle incoming messages from Maverick
    ws.on('message', async (message) => {
        try {
            // Parse incoming message
            const parsedMessage = JSON.parse(message);
            // Session is ready
            if (parsedMessage.SessionReady) {
                const sessionData = parsedMessage.SessionReady;
                const date = new Date(sessionData.date);
                const startBalance = sessionData.start_balance['www.bet365.es'];

                console.log(`Session started at: ${date.toISOString()}`);
                console.log(`Starting balance for www.bet365.es: ${startBalance}`);

                // Give it time to breathe
                await sleep(3000);

                // Send the commands
                console.log("Sending commands to Maverick...");
                for (const command of commands) {
                    printCommandPreview(command);
                    ws.send(JSON.stringify(command), { binary: false });
                    await sleep(1000);
                }
                console.log("Done.");
            }
            // Handle request results
            else if (parsedMessage.RequestResult) {
                const requestResult = parsedMessage.RequestResult;
                console.log(`Received result for request ${requestResult.id}:`);
                console.log(JSON.stringify(requestResult, null, 2));
                // ...
            }
        } catch (error) {
            console.error('Error parsing message:', error.message);
        }
    });

    // Handle Maverick disconnection
    ws.on('close', () => {
        console.log('Maverick disconnected');
    });
});
