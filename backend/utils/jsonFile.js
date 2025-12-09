const fs = require("fs").promises;
const path = require("path");

async function appendToJson(filePath, newItem) {
    try {
        const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, filePath);

        // Ensure directory exists
        const dir = path.dirname(fullPath);
        await fs.mkdir(dir, { recursive: true });

        let data = [];
        try {
            const content = await fs.readFile(fullPath, "utf-8");
            data = JSON.parse(content);
            if (!Array.isArray(data)) data = [];
        } catch (e) {
            // If file doesn't exist or is invalid, start empty
            data = [];
        }

        data.push(newItem);

        await fs.writeFile(fullPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        console.error(`Error writing to JSON file ${filePath}:`, error);
    }
}

module.exports = { appendToJson };
