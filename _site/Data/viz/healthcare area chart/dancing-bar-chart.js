console.log({ d3 })

    let width = 962;
    let height = 498;

    let svg = d3.select("body")
        .select("svg")

    d3.csv("healthcare-disposable-inc.csv").then(function (data) {

        let margin = { top: 10, right: 10, bottom: 0, left: 0 };

        let sel_cols = [
            "Medicaid",
            "Medicare",
            "Medicare+Medicaid",
            "Employer",
            "Uninsured",
            "Direct Purchase",
            "Subsidized Exchange",
            "CHIP",
            "Military",
            "Other"]

        let sel_colors = [
            "#f44336", // "Medicaid",
            "#FF9800", // "Medicare",
            "#FDD835", // "Medicare+Medicaid",
            "#FFF8E1", // "Employer",
            "#26A69A", // "Uninsured",
            "#4DD0E1", // "Direct Purchase",
            "#F06292", // "Subsidized Exchange",
            "#5C6BC0", // "CHIP",
            "#90A4AE", // "Military",
            "#E0E0E0"  // "Other"
        ]

        let year_state = 2020;

        let d2020 = data.filter(d => d.year == 2020)
        let d2009 = data.filter(d => d.year == 2009)

        let series2020 = d3.stack().keys(sel_cols)(d2020);
        let series2009 = d3.stack().keys(sel_cols)(d2009);

        let color = d3.scaleOrdinal()
            .domain(sel_cols)
            .range(sel_colors)

        let x = d3.scaleLinear()
            .domain([0, 100])
            .range([margin.left, width])

        let y = d3.scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom, margin.top])

        let area = d3.area()
            .x(d => x(d.data.Percentile))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))

        let xAxisSettings = d3.axisBottom(x)
            .tickSize(6)
            .tickPadding(6)
            .tickValues([5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95])
            .tickFormat(d3.format(".0f"))

        let xAxis = svg.append("g")
            .attr("class", "x axis")
            .call(xAxisSettings)
            .call(g => g.selectAll(".domain").remove())
            .attr("transform", "translate(0," + height + ")")

        let yAxisSettings = d3.axisLeft(y)
            .tickValues([.2, .4, .6, .8])
            .tickSize(6)
            .tickPadding(4)
            .tickFormat(d3.format(".0%"))

        let yAxis = svg.append("g")
            .attr("class", "y axis")
            .call(yAxisSettings)
            .call(g => g.selectAll(".domain").remove())

        let stacks = svg.append("g")
            .attr("class", "stacks")

        let hed = d3.select(".headline")
        let employer = svg.append("text")
                            .attr("class", "label")
                            .attr("x", 818)
                            .attr("y", 238)
                            .text("Employer")

        let medicaid = svg.append("text")
                            .attr("class", "label")
                            .attr("x", 30)
                            .attr("y", 422)
                            .text("Medicaid")
                            .style("fill", "white")

        let uninsured = svg.append("text")
                            .attr("class", "label")
                            .attr("x", 164)
                            .attr("y", 94)
                            .text("Uninsured")
                            .style("fill", "white")

        let medicare = svg.append("text")
                            .attr("class", "label")
                            .attr("x", 48)
                            .attr("y", 282)
                            .text("Medicare")

        stacks
            .selectAll("path")
            .data(series2020)
            .join("path")
            .attr("class", d => d.key)
            .attr("fill", d => color(d.key))
            .attr("d", area)

        svg.append("text")
            .attr("class", "smallLabel")
            .attr("x", 970)
            .attr("y", 38)
            .text("Direct Purchase")

        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .text("income percentile")
            .attr("text-anchor", "middle")

        function update() {
            if (year_state == 2020) {
                year_state = 2009
                dance(series2009, 828, 266, 44, 430, 54, 122, 77, 330)
                hed.html("Health Insurance by Income: 2009")
            } else {
                year_state = 2020
                dance(series2020, 818, 232, 30, 422, 164, 94, 48, 282)
                hed.html("Health Insurance by Income: 2020")
            }
        }

        function dance(series, x1, y1, x2, y2, x3, y3, x4, y4) {
            stacks
                .selectAll("path")
                .data(series)
                .join("path")
                .attr("class", d => d.key)
                .transition()
                .duration(1300)
                .ease(d3.easeCubic)
                .attr("fill", d => color(d.key))
                .attr("d", area)

            employer
                .transition()
                .duration(1300)
                .ease(d3.easeCubic)
                .attr("class", "label")
                .attr("x", x1)
                .attr("y", y1)
                .text("Employer")

            medicaid
                .transition()
                .duration(1300)
                .ease(d3.easeCubic)
                .attr("class", "label")
                .attr("x", x2)
                .attr("y", y2)
                .text("Medicaid")
                .style("fill", "white")

            uninsured
                .transition()
                .duration(1300)
                .ease(d3.easeCubic)
                .attr("class", "label")
                .attr("x", x3)
                .attr("y", y3)
                .text("Uninsured")
                .style("fill", "white")

            medicare
                .transition()
                .duration(1300)
                .ease(d3.easeCubic)
                .attr("class", "label")
                .attr("x", x4)
                .attr("y", y4)
                .text("Medicare")

        }

        var timer = d3.interval(update, 3000)
        stacks.on("click", () => { timer.stop()})

    })
