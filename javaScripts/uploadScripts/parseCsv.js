// Simple CSV parser function
function parseCSV(data) {
    const rows = data.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const parsedRows = rows.slice(1).map(row => {
        return row.reduce((acc, curr, index) => {
            acc[headers[index].trim()] = curr.trim(); // Create an object for each row
            return acc;
        }, {});
    });
    return parsedRows;
}

       // Function to parse CSV data
       function parseCSV(csvString) {
        // Split CSV string into rows and trim each cell
        const rows = csvString.split("\n").map(row => 
            row.split(",").map(cell => cell.trim())
        );
    
        const headers = rows[0]; // First row contains headers
    
        // Map rows to objects using headers as keys
        const data = rows.slice(1) // Exclude header row
            .filter(row => row.some(cell => cell !== '')) // Filter out empty rows
            .map(row => {
                const obj = {};
                headers.forEach((header, i) => {
                    obj[header.trim()] = row[i] ? row[i].trim() : null; // Handle missing values
                });
                return obj; // Return object for each row
            });
    
        return data; // Return parsed data
    }
    