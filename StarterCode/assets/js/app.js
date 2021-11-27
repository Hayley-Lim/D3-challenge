// @TODO: YOUR CODE HERE!

// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Default x and y axis variables
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function to update x scale var when variable is chosen on the x-axis label
function xScale(data, chosenXAxis, chartWidth) {
    // Create x scale.
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * .8,
            d3.max(data, d => d[chosenXAxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}

// Function used to updating x-axis var when variable is chosen on the axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Function to update x scale var when variable is chosen on the x-axis label
function yScale(data, chosenYAxis, chartHeight) {
    // Create y scale.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * .8,
            d3.max(data, d => d[chosenYAxis]) * 1.2])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// Function used to updating x-axis var when variable is chosen on the axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// Update circles group with new circles as per variables chosen on the axis label
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}
// Update text in circles group with new text as per variables chosen on the axis label
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    return circletextGroup;
}

// Update circles group with new tooltip.
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
    //x-axis.
    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty: ";
    } else if (chosenXAxis === "income") {
        var xlabel = "Median Income: "
    } else {
        var xlabel = "Age: "
    }
    //y-axis
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    } else if (chosenYAxis === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }

    // Define tooltip
    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (chosenXAxis === "age") {
                // All yAxis tooltip labels presented and formated as %.
                // Display Age without format for xAxis
                return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
                } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
                // Display Income in dollars for xAxis
                return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
                } else {
                // Display Poverty as percentage for xAxis
                return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
                }      
        });

    circlesGroup.call(toolTip);
    // Create "mouseover" event listener to display tool tip when mouse is hovered over the circle
    circlesGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    textGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
    }

// Retrieve data from the CSV file
d3.csv("assets/data/data.csv").then(function (demographicdata, err) {
    if (err) throw err;

    // parse data(from string to int)
    demographicdata.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    console.log(demographicdata);

    // Create x, y linear scales
    var xLinearScale = xScale(demographicdata, chosenXAxis, width);
    var yLinearScale = yScale(demographicdata, chosenYAxis, height);

    // Create initial axis functions
    var bottomAxis =d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Bind data
    var circlesGroup = chartGroup.selectAll("circle")
    .data(demographicdata);

    // Create placeholder for circles
    var elemEnter = circlesGroup.enter();

   // Create circles
   var circle = elemEnter.append("circle")
   .attr("cx", d => xLinearScale(d[chosenXAxis]))
   .attr("cy", d => yLinearScale(d[chosenYAxis]))
   .attr("r", 15)
   .classed("stateCircle", true);

    // Create circle text inside each circle
    var circleText = elemEnter.append("text")            
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", ".35em") 
    .text(d => d.abbr)
    .classed("stateText", true);

    // Update tool tip function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);

    // Add x labels on the x-axis
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Add y labels on the y-axis
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 40 - margin.left)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    var smokesLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 20 - margin.left)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");
    var obeseLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");
    
    // x labels event listener on "click" event
    xLabelsGroup.selectAll("text")
    .on("click", function() {
        // Grab selected label
        chosenXAxis = d3.select(this).attr("value");
        // Update xLinearScale
        xLinearScale = xScale(demographicdata, chosenXAxis, width);
        // Render xAxis
        xAxis = renderXAxes(xLinearScale, xAxis);
        // Switch active/inactive labels
        if (chosenXAxis === "poverty") {
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
        } else if (chosenXAxis === "age") {
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", true)
                .classed("inactive", false);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
        } else {
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", false)
                .classed("inactive", true)
            incomeLabel
                .classed("active", true)
                .classed("inactive", false);
        }
        // Update circles with new x values
        circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        // Update tool tips with new values
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
        // Update circles text with new values
        circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
    });

//y labels event listener on "click" event
yLabelsGroup.selectAll("text")
    .on("click", function() {
        // Grab selected label
        chosenYAxis = d3.select(this).attr("value");
        // Update yLinearScale
        yLinearScale = yScale(demographicdata, chosenYAxis, height);
        // Update yAxis
        yAxis = renderYAxes(yLinearScale, yAxis);
        // Switch active/inactive labels
        if (chosenYAxis === "healthcare") {
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
        } else if (chosenYAxis === "smokes"){
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", true)
                .classed("inactive", false);
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
        } else {
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            obeseLabel
                .classed("active", true)
                .classed("inactive", false);
        }

        // Update circles with new y values
        circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // Update circles text with new values
        circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        
        // Update tool tips with new values
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
    });

});
