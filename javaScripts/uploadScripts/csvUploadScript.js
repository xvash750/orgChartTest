function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            const parsedData = parseCSV(content);
            localStorage.setItem("csvData", JSON.stringify(parsedData)); // Store data in localStorage
            alert('File uploaded successfully! Now you can view it in the Table and Org Chart pages.');
        };
        
        reader.readAsText(file);
    } else {
        alert('Please select a file to upload.');
    }
}