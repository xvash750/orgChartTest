// Declare these as global variables so that other scripts like buttons.js can access them
let root, nodes;

// Load the data from localStorage
const csvData = localStorage.getItem("csvData");

if (csvData) {
    let parsedData = JSON.parse(csvData);

    // If the data is a CSV string, parse it
    if (typeof parsedData === 'string') {
        parsedData = parseCSV(parsedData);
    }

    // Convert parsed data into the correct format for the org chart
    const employeeData = parsedData.map(row => ({
        id: row['ID'],             // Assuming your CSV has an 'ID' column
        name: row['Name'],         // Assuming 'Name' column in the CSV
        managerId: row['Manager ID'], // Assuming 'Manager ID' column in the CSV
        team: row['Team'],         // Assuming 'Team' column in the CSV
        jobTitle: row['Job Title'] // Assuming 'Job Title' column in the CSV
    }));

    // Define the SVG dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

   // Create the SVG and set its dimensions
const svg = d3.select("#org-chart")
.attr("width", width)
.attr("height", height)
.call(d3.zoom().on("zoom", zoomed)) // Add zoom behavior
.append("g"); // Group to apply zoom transformations


    // Create a group to hold the tree and adjust its initial vertical position
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 9})`); // Change height/3 to your desired position

    // Prepare the data for the tree layout
    const root = d3.stratify()
        .id(d => d.id)
        .parentId(d => d.managerId)(employeeData);

    // Define the tree layout
    const treeLayout = d3.tree()
        .nodeSize([200, 150]);

    // Count children for each employee
    employeeData.forEach(employee => {
        employee.childCount = employeeData.filter(e => e.managerId === employee.id).length; // Count children
    });

    let treeData = treeLayout(root);
    let nodes = treeData.descendants();
    let links = treeData.links();

    // Expand nodes at first render
    nodes.forEach(d => {
        d.data.visible = true; // Ensure all nodes are visible
        if (d.depth > 0) { // Expand all nodes
            expand(d);
        }
    });

    // Initial layout
     update(root);


// Start of Filtering

// Add event listener for the level dropdown
document.getElementById("levelDropdown").addEventListener("change", showLevelsFromTop);


// Listeners for expand/collapse all buttons
document.getElementById("expandAllBtn").addEventListener("click", expandAll);
document.getElementById("collapseAllBtn").addEventListener("click", collapseAll);

// Listening event for team filter
document.getElementById("teamDropdown").addEventListener("change", function () {
    const selectedTeam = this.value;
    const selectedName = document.getElementById("nameDropdown").value; // Get the current name filter
    applyFilters(selectedTeam, selectedName);
});

// Listening event for name filter
document.getElementById("nameDropdown").addEventListener("change", function () {
    const selectedName = this.value;
    const selectedTeam = document.getElementById("teamDropdown").value; // Get the current team filter
    applyFilters(selectedTeam, selectedName);
});

// Add event listener for the level dropdown
document.addEventListener("DOMContentLoaded", function () {
    populateLevelDropdown(); // Populate the dropdown
    const levelDropdown = document.getElementById("levelDropdown");
    levelDropdown.value = "10"; // Set default value to Level 10
});

// Function to apply both filters together
function applyFilters(selectedTeam, selectedName) {
    nodes.forEach(node => {
        // Set node to invisible by default
        node.data.visible = false;
    });

    // Apply filters
    nodes.forEach(node => {
        const teamMatches = (selectedTeam === "All" || node.data.team === selectedTeam);
        const nameMatches = (selectedName === "All" || node.data.name === selectedName);

        if (teamMatches && nameMatches) {
            node.data.visible = true;
            expand(node); // Ensure the node and its children are expanded
        }
    });

    // Ensure that visible nodes' parents and children remain visible
    nodes.forEach(node => {
        if (node.parent && node.parent.data.visible) {
            node.data.visible = true; // Keep child visible if parent is visible
        }
        if (node.children) {
            node.children.forEach(child => {
                if (node.data.visible) {
                    child.data.visible = true; // Keep children visible if node is visible
                }
            });
        }
    });

    update(root); // Re-render the chart with filtered nodes
    populateLevelDropdown(); // Refresh level dropdown after filtering
    applyFilterAndZoom(); // Trigger zoom after filtering and updating
}

// Function to populate the level dropdown based on the top visible node
function populateLevelDropdown() {
    const topVisibleNode = findTopVisibleNode(root); // Find the top visible node

    if (!topVisibleNode) return; // If no visible node is found, exit

    const maxDepth = getMaxDepthFromNode(topVisibleNode); // Get max depth from the top visible node
    const levelDropdown = document.getElementById("levelDropdown");

    // Clear existing options
    levelDropdown.innerHTML = "";

   // Create options based on the max depth from the top visible node
   for (let i = 1; i <= maxDepth; i++) {
    const option = document.createElement("option");
    option.value = i; // Changed to just use the number as the value
    option.textContent = `Level ${i}`;
    levelDropdown.appendChild(option);
}

    // Set default value to the maximum level
    levelDropdown.value = maxDepth; // Setting the dropdown value to the max depth
}

// Function to apply filter and zoom to the top visible node
function applyFilterAndZoom() {
    // After filtering, trigger the zoom to re-center the top visible node
    const initialTransform = d3.zoomIdentity; // Default transform (no zoom)
    zoomed({ transform: initialTransform });
}

// End of Filtering

// Update function (now globally accessible)
function update(source) {
    console.log("Updating chart..."); // Debugging

    const treeData = treeLayout(root);  // Re-layout the tree
    const nodes = treeData.descendants();
    const links = treeData.links();

    g.selectAll("*").remove(); // Clear existing nodes and links

   // Render links with right-angled lines (orthogonal connectors)
const link = g.selectAll(".link")
    .data(links.filter(link => link.source.data.visible && link.target.data.visible)) // Only render links between visible nodes
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d => {
        // Define the start and end points
        const startX = d.source.x;
        const startY = d.source.y;
        const endX = d.target.x;
        const endY = d.target.y;

        // Create a path with right angles
        return `M${startX},${startY} 
                L${startX},${(startY + endY) / 2} 
                L${endX},${(startY + endY) / 2} 
                L${endX},${endY}`;
    })
    .attr("stroke-width", "2px");


    // Render only visible nodes
    const node = g.selectAll(".node")
        .data(nodes.filter(node => node.data.visible)) // Only render visible nodes
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

        node.append("rect")
            .attr("width", 200)
            .attr("height", 60)
            .attr("x", -100)
            .attr("y", -30)
            .style("fill", "#f4f4f4")
            .style("stroke", "")
            .style("rx", 10)
            .style("ry", 10)
            .on("click", click);

        node.append("text")
            .attr("dy", -15)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .text(d => `${d.data.name} (${d.data.childCount})`)
            .style("font-size", "15px")
            .style("fill", "#5e4b8a");

        node.append("text")
            .attr("dy", 0)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .text(d => `Position Code - ${d.data.id}`) // Updated line
            .style("font-size", "10px")
            .style("fill", "#333");

        node.append("text")
            .attr("dy", 0)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .text(d => d.data.jobTitle)
            .style("font-size", "10px")
            .style("fill", "#333");

        node.append("text")
            .attr("dy", 10)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .text(d => d.data.team)
            .style("font-size", "10px")
            .style("fill", "#333");

         node.append("text")
            .attr("dy", 20)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .text(d => `Manager Position Code - ${d.data.managerId}`) // Updated line
            .style("font-size", "10px")
            .style("fill", "#333");
    }

//Expand all/Collapse All Start
// Expand all nodes
function expandAll() {
    nodes.forEach(d => {
        if (d._children) {
            expand(d);  // Expand any nodes with hidden children (_children)
        }
    });
    update(root);  // Re-render the tree
}

function collapseAll() {
    // Find the top-most visible node based on the applied filters
    let topVisibleNode = root;
    
    nodes.forEach(node => {
        if (node.data.visible && (!topVisibleNode || node.depth < topVisibleNode.depth)) {
            topVisibleNode = node;
        }
    });

    // If no visible node is found, do nothing
    if (!topVisibleNode) {
        return;
    }

    // Collapse all nodes except the top-most visible node
    nodes.forEach(node => {
        if (node !== topVisibleNode && node.children) {
            collapse(node); // Collapse the node
        }
    });

    // Keep the top-most visible node's children collapsed as well
    if (topVisibleNode.children) {
        topVisibleNode.children.forEach(child => collapse(child));
    }

    update(root); // Re-render the tree after collapsing
}

// Helper function to expand a node
function expand(d) {
    if (d._children) {
        d.children = d._children;  // Move _children back to children to show them
        d._children = null;  // Clear the _children array
    }
}

// Helper function to collapse a node
function collapse(d) {
    if (d.children) {
        d._children = d.children;  // Move children to _children to hide them
        d.children = null;  // Clear the children array
    }
}


    function click(event, d) {
        if (d.children) {
            // Collapse only the children of the clicked node's parent
            collapse(d);
        } else {
            // Expand only the immediate children, not all descendants
            expand(d);
        }
        update(d); // Update the tree
    }
//Expand All/Collapse All Finish

//Expand Level/Collapse Level Start
// Function to show nodes up to a specified level from the top visible node and collapse the rest
function showLevelsFromTop() {
    // Get the selected level from the dropdown
    const selectedLevel = parseInt(document.getElementById("levelDropdown").value);

    // Find the top visible node starting from the root
    const topVisibleNode = findTopVisibleNode(root);

    if (topVisibleNode) {
        // Collapse all nodes by default
        nodes.forEach(node => {
            collapse(node); // Collapse all nodes
        });

        // Recursive function to expand nodes up to the selected level
        function expandToLevel(node, currentLevel) {
            if (currentLevel <= selectedLevel) {
                expand(node); // Expand the current node
                node.data.visible = true; // Make the node visible
                if (node.children) {
                    node.children.forEach(child => {
                        expandToLevel(child, currentLevel + 1); // Go deeper into the tree
                    });
                }
            }
        }

        // Start expanding from the top visible node
        expandToLevel(topVisibleNode, 0);
    }

    update(root); // Re-render the chart with updated visibility and collapsed nodes
}

// Helper functions for collapsing and expanding nodes
function collapse(node) {
    if (node.children) {
        node._children = node.children; // Store the children in a temporary variable
        node.children = null; // Remove the children to collapse
    }
}

function expand(node) {
    if (node._children) {
        node.children = node._children; // Restore the children to expand
        node._children = null; // Clear the temporary storage
    }
}

// Helper function to find the top visible node starting from the root
function findTopVisibleNode(node) {
    if (node.data.visible) {
        return node; // Return the first visible node found
    }

    // Check children if no visible node found
    if (node.children) {
        for (const child of node.children) {
            const visibleNode = findTopVisibleNode(child);
            if (visibleNode) {
                return visibleNode; // Return the first visible child found
            }
        }
    }

    return null; // No visible node found
}

// Add event listener for the level dropdown
document.getElementById("levelDropdown").addEventListener("change", showLevelsFromTop);

// Function to show nodes up to a specified level from the top visible node
function showLevelsFromTop() {
    // Get the selected level from the dropdown
    const selectedLevel = parseInt(document.getElementById("levelDropdown").value);

    // Find the top visible node starting from the root
    const topVisibleNode = findTopVisibleNode(root);

    if (topVisibleNode) {
        // Clear visibility for all nodes
        nodes.forEach(node => {
            node.data.visible = false; // Make all nodes invisible
        });

        // Recursive function to set visibility up to the selected level
        function setVisibility(node, currentLevel) {
            if (currentLevel < selectedLevel) {
                node.data.visible = true; // Make the current node visible
                if (node.children) {
                    node.children.forEach(child => {
                        setVisibility(child, currentLevel + 1); // Go deeper into the tree
                    });
                }
            }
        }

        // Start visibility setting from the top visible node
        setVisibility(topVisibleNode, 0);
    }

    // Call update to re-render the chart with updated visibility
    update(root);
}

// Function to get the maximum depth from a given node
function getMaxDepthFromNode(node) {
    let maxDepth = 0;

    // Recursive function to calculate max depth
    function traverse(node, depth) {
        if (!node || !node.data.visible) return; // Skip if node is not visible

        // Update maxDepth if current depth is greater
        maxDepth = Math.max(maxDepth, depth);

        // Traverse children
        if (node.children) {
            node.children.forEach(child => traverse(child, depth + 1));
        }
    }

    traverse(node, 0); // Start traversing from the node at depth 0
    return maxDepth+1; // Return the maximum depth found
}

// Function to populate the level dropdown based on the top visible node
function populateLevelDropdown() {
    const topVisibleNode = findTopVisibleNode(root); // Find the top visible node

    if (!topVisibleNode) return; // If no visible node is found, exit

    const maxDepth = getMaxDepthFromNode(topVisibleNode); // Get max depth from the top visible node
    const levelDropdown = document.getElementById("levelDropdown");

    // Clear existing options
    levelDropdown.innerHTML = "";

    // Create options based on the max depth from the top visible node
    for (let i = 1; i <= maxDepth; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `Level ${i}`;
        levelDropdown.appendChild(option);
    }

    // Set default value to the maximum level
    levelDropdown.value = maxDepth;
}

// Call this function when the page loads or when the filters are applied
document.addEventListener("DOMContentLoaded", function () {
    populateLevelDropdown(); // Populate the level dropdown initially
});



function zoomed(event) {
    svg.attr("transform", event.transform);
}

    
    
}
