    let margin = { top: 0, right: 0, bottom: 50, left: 30 };
    let width = 700;
    let height = 500;

    let sel_var_state = "year";
    let sel_max = "year_end";

    d3.tsv("football.tsv").then(function (data){
        data.forEach(function (row) {
            row.age = +row.age
            row.tot_wins = +row.tot_wins
            row.playoff_wins = +row.playoff_wins
            row.year = +row.year
            row.year_end = +row.year_end
        })

        let svg = d3.select("body")
            .select("svg")

        let x = d3.scaleLinear()
            .domain(d3.extent(data.map(function(d) { return d[sel_var_state]} )))
            .range([margin.left, width-margin.right])

        let y = d3.scaleLinear()
            .domain(d3.extent(data.map(function(d) { return d.playoff_wins} )))
            .range([height-margin.bottom, margin.top])

        let xAxisSettings = d3.axisBottom(x)
            .tickValues([1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020])
            .tickSize(8)
            .tickFormat(d3.format("d"))
            .tickPadding(10)

        let yAxisSettings = d3.axisRight(y)
            .tickValues([5, 10, 15, 20, 25, 30, 35])
            .tickSize(width-margin.right)
            .tickPadding(10)

        let yAxisTicks = svg.append("g")
            .attr("class", "y axis")
            .call(yAxisSettings)

        let xAxisTicks = svg.append("g")
            .attr("class", "x axis")
            .call(xAxisSettings)
            .attr("transform", `translate(0, ${height - margin.bottom})`)

        let line = d3.line()
            .defined(d => !isNaN(d.playoff_wins))
            .x(function (d) { return x(d[sel_var_state]) })
            .y(function (d) { return y(d.playoff_wins) })

        let grouped_data = d3.group(data, d => d.player_id)
        let highlighted_players = ["StarBa00", "BradTe00", "TarkFr00", "MontJo01", "ElwaJo00"]

        let points = svg.append("g")
            .selectAll("circles")
            .data(grouped_data)
            .enter()
            .append("circle")
            .attr("fill", d => {
                if (d[1].slice(-1)[0]["year_end"] >= 2021) {
                    return "#54b3e5" }
                else if (highlighted_players.indexOf(d[0]) >= 0){
                    return "#555555" }
                else {
                    return "#d0d0d0"}
                })


            .attr("id", (d, i)=> "circles" + i)
            .attr("stroke", "none")
            .attr("cx", function(d) { return x(d[1].slice(-1)[0]["year_end"]) })
            .attr("cy", function(d) { return y(d[1].slice(-1)[0]["tot_wins"]) })
            .attr("r", d => {
                if(d[0] == "BradTo00") {
                    return 4.5
                }
                else {
                    return 1.5
                }
            })

        points.filter(function(d) {return highlighted_players.indexOf(d[0]) >= 0}).raise();
        points.filter(function(d) {return d[1].slice(-1)[0]["year_end"] >= 2021}).raise();

        let line_path = svg.append("g")
            .selectAll(".line")
            .data(grouped_data)
            .join("path")
            .attr("class", function(d) { return "line " +  d[0] })
            .attr("d", function(d) { return line(d[1]) })
            .style("fill", "none")
            .style("stroke", d => {
                if ( d[1].slice(-1)[0]["year"] >= 2021) {
                    return "#54b3e5" }
                else if ( highlighted_players.indexOf(d[0]) >= 0){
                    return "#555555" }
                else {
                    return "#d0d0d0"}} )
            .style("stroke-width", d => {
                if(d[0] == "BradTo00") {
                    return "3px"
                }
                else {
                    return "1px"
                }
            }).on("mouseover", function(event, d) {
                    if(d[1].slice(-1)[0]["year_end"] < 2021 && highlighted_players.indexOf(d[0]) == -1){
                        d3.select(this).style("stroke", "black").raise()}})
                .on("mouseout", function(event, d) {
                    if(d[1].slice(-1)[0]["year_end"] < 2021 && highlighted_players.indexOf(d[0]) == -1){
                        d3.select(this).style("stroke", "#d0d0d0").lower()}})

        line_path.filter(function(d) {return highlighted_players.indexOf(d[0]) >= 0}).raise();
        line_path.filter(function(d) {return d[1].slice(-1)[0]["year_end"] >= 2021}).raise();

        let labels = svg.append("g")
            .selectAll("labels")
            .data(grouped_data)
            .enter()
            .filter(function(d) {
                return highlighted_players.indexOf(d[0]) >= 0 || d[0] == "BradTo00" })
            .append("text")
            .attr("x", d => {
                if( d[0] == "BradTo00") {
                    return x(d[1].slice(-1)[0]["year_end"]) - 50 }
                else {
                    return x(d[1].slice(-1)[0]["year_end"]) + 4 }})
            .attr("y", d => {
                if (d[0] == "BradTo00") {
                    return y(d[1].slice(-1)[0]["tot_wins"]) - 15 }
                else {
                    return y(d[1].slice(-1)[0]["tot_wins"]) + 3 }})
            .text(function(d) {
                return d[1].slice(-1)[0]["last name"]})
            .style("font-size", d => {
                if (d[0] == "BradTo00") {
                    return 20 }
                else {
                    return 10 }})
            .style("font-family", "Arial")
            .style("stroke", "white")
            .style("stroke-width", 0.3)
            .style("fill", "black")
            .attr("letter-spacing", 0.4)

        let hidden_labels = svg.append("g")
            .selectAll("hidden_labels")
            .data(grouped_data)
            .enter()
            .append("text")
            .attr("x", d => {
                if( d[0] == "BradTo00") {
                    return x(d[1].slice(-1)[0]["year_end"]) + 10 }
                else {
                    return x(d[1].slice(-1)[0]["year_end"]) + 4 }})
            .attr("y", d => {
                if (d[0] == "BradTo00") {
                    return y(d[1].slice(-1)[0]["tot_wins"]) + 4 }
                else {
                    return y(d[1].slice(-1)[0]["tot_wins"]) + 3 }})
            .text(function(d) {
                return d[1].slice(-1)[0]["full name"] + " (" + d[1].slice(-1)[0]["age"] + ")"})
            .style("font-size", d => {
                if (d[0] == "BradTo00") {
                    return 20 }
                else {
                    return 10 }})
            .style("font-family", "Arial")
            .style("stroke", "white")
            .style("stroke-width", 0.3)
            .style("fill", "black")
            .attr("letter-spacing", 0.4)
            .style("visibility", "hidden")

        let baseline = svg.append("line")
            .attr("x1", margin.left)
            .attr("x2", width)
            .attr("y1", y(0))
            .attr("y2", y(0))
            .style("stroke", "black")
            .style("stroke-width", "1.5px")

        let button = d3.select(".change-btn").on("click", update);

        function update(){

            if (sel_var_state == "year") {
                sel_var_state = "age";
                sel_var_max = "end_age"
                button.html("By Year");

                xAxisSettings.tickValues([25, 30, 35, 40])
            }

            else {
                sel_var_state = "year";
                sel_var_max = "year_end";
                button.html("By Age");

                xAxisSettings.tickValues([1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020])
            }

            var t = d3.transition()
                .duration(600)

            x.domain(d3.extent(data.map(function(d) { return d[sel_var_state]} )))
            xAxisTicks.call(xAxisSettings)

            line.x(function (d) { return x(d[sel_var_state]) })

            line_path
                .transition(t)
                .attr("d", function(d) { return line(d[1]) })

            line_path.filter(function(d) {return highlighted_players.indexOf(d[0]) >= 0}).raise();
            line_path.filter(function(d) {return d[1].slice(-1)[0]["year_end"] >= 2021}).raise();

            points
                .transition(t)
                .attr("cx", function(d) { return x(d[1].slice(-1)[0][sel_var_max]) })

            points.filter(function(d) {return highlighted_players.indexOf(d[0]) >= 0}).raise();
            points.filter(function(d) {return d[1].slice(-1)[0]["year_end"] >= 2021}).raise();

            labels
                .transition(t)
                .attr("x", d => {
                    if( d[0] == "BradTo00") {
                        return x(d[1].slice(-1)[0][sel_var_max]) - 50 }
                    else {
                        return x(d[1].slice(-1)[0][sel_var_max]) + 4 }
                    })
            }
        })
