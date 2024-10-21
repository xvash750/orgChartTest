
// Function to sort the table by a specific column
function sortTable(column) {
    // Determine sort order
    if (currentSortColumn === column) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; // Toggle sort order
    } else {
        sortOrder = 'asc'; // Default to ascending
    }
    currentSortColumn = column;

    // Sort data
    csvData.sort((a, b) => {
        // Convert values to numbers for numeric comparison
        const valueA = isNaN(a[column]) ? a[column] : Number(a[column]);
        const valueB = isNaN(b[column]) ? b[column] : Number(b[column]);

        if (valueA < valueB) {
            return sortOrder === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortOrder === 'asc' ? 1 : -1;
        }
        return 0; // Equal values
    });

    renderTable(csvData); // Re-render the table with sorted data
}