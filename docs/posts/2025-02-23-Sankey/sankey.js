////////////////////////////////////////////////////////////
// Process Data and Setup Animated Sankey Diagram using NHANES.csv
////////////////////////////////////////////////////////////

let educationStarted = false;

// Define the order of PHQ_c categories (end states)
const phqOrder = [
  "Minimal (0-4)",
  "Mild (5-9)",
  "Moderate (10-14)",
  "Moderately Severe (15-19)",
  "Severe (20-27)"
];

d3.csv("NHANES.csv", d3.autoType)
  .then((csv) => {
    // Use all rows
    const filtered = csv;
    const genders = ["Female", "Male"];
    const stackedProbabilities = {};

    // For each gender, aggregate Count for each PHQ_c category.
    genders.forEach(gender => {
      const subset = filtered.filter(d => d.Gender === gender);
      const total = d3.sum(subset, d => d.Count);
      const counts = phqOrder.map(phq =>
        d3.sum(subset.filter(d => d.PHQ_c === phq), d => d.Count)
      );
      let cumulative = [];
      let sum = 0;
      counts.forEach(count => {
        sum += count;
        cumulative.push(total ? sum / total : 0);
      });
      // Use key "Gender-Not Seen" (where "Not Seen" is the starting state)
      stackedProbabilities[`${gender}-Not Seen`] = cumulative;
    });

    // Build the data object
    const data = {
      stackedProbabilities: stackedProbabilities,
      categories: genders,            // Two groups: Female and Male.
      starts: ["10,000 U.S. Adults"], // Starting state.
      ends: phqOrder,                 // End states.
      startTitle: "U.S. Adults",
      endTitle: "Depression (PHQ-9 Score)"
    };

    // Create the Sankey diagram base.
    const sankey = animatedSankey({
      container: d3.select(".chart-wrapper"),
      data,
    });

    // Create a dispatcher for simulation events.
    const dispatch = d3.dispatch("change");
    dispatch.on("change", sankey.simulate);

    // Optional: Initialize category controls if needed.
    initCategoryControls({ categories: data.categories, dispatch });

    // Render the static background so that pipes and labels are visible.
    sankey.renderStatic();

    // Auto-start the simulation.
    window.startEducationAnimation = function () {
      if (!educationStarted) {
        educationStarted = true;
        dispatch.call("change", {}, data.categories);
      }
    };

    window.startEducationAnimation();
  })
  .catch((error) => console.error("Error loading NHANES.csv:", error));



////////////////////////////////////////////////////////////
// Optional: Category Controls
////////////////////////////////////////////////////////////
function initCategoryControls({ categories, dispatch }) {
  const selects = d3.selectAll(".category-select")
    .data(d3.range(2))
    .on("change", toggleSelect);

  const options = selects.selectAll("option")
    .data(categories)
    .join("option")
    .attr("value", d => d)
    .each(function(d, j) {
      const i = d3.select(this.parentNode).datum();
      d3.select(this)
        .attr("selected", (i === 0 && j === 0) || (i === 1 && j === 1) ? "selected" : null)
        .attr("disabled", (i === 0 && j === 1) || (i === 1 && j === 0) ? "disabled" : null);
    })
    .text(d => d);

  function toggleSelect() {
    const selected = selects.nodes().map(node => node.value);
    dispatch.call("change", {}, selected);
    options.each(function(d) {
      const i = d3.select(this.parentNode).datum();
      d3.select(this)
        .attr("disabled", (i === 0 && d === selected[1]) || (i === 1 && d === selected[0]) ? "disabled" : null);
    });
  }
}



////////////////////////////////////////////////////////////
// Animated Sankey Function
////////////////////////////////////////////////////////////
function animatedSankey({ container, data: { stackedProbabilities, categories, starts, ends, startTitle, endTitle } }) {
  let width;
  const itemSize = 12;
  const pathWidth = 80;
  const pathInnerWidth = pathWidth - itemSize - 4;
  const pathPadding = 48;
  const margin = { top: 80, right: 250, bottom: 40, left: 40 };
  const height = Math.max(starts.length, ends.length) * (pathWidth + pathPadding) - pathPadding + margin.top + margin.bottom;
  const endBarWidth = 20;
  const dpr = window.devicePixelRatio || 1;

  // Force the start state to appear at the bottom.
  const yStartValue = height - margin.bottom - pathWidth / 2;

  // Colors and formatting.
  const categoryColors = ["#FF9F1C", "#1e90ff"];
  const emptyBarColor = "rgba(221, 221, 221, 0.9)";
  const pathColor = "rgba(221, 221, 221, 0.4)";
  const formatCount = d3.format(",");
  const formatPercentage = d3.format(".0%");

  // Append canvas and SVG.
  const canvas = container.append("canvas").attr("height", height * dpr);
  const svg = container.append("svg").attr("height", height);
  const context = canvas.node().getContext("2d");

  // Scales.
  const xScale = d3.scaleLinear().domain([0, 1]);
  const yEndScale = d3.scalePoint().domain(ends)
    .range([margin.top + pathWidth / 2, height - margin.bottom - pathWidth / 2]);
  const yProgressScale = d3.scaleLinear().domain([0.42, 0.58]).range([0, 1]).clamp(true);

  // Create static path data.
  const pathData = d3.cross(starts, ends).map(d => new Array(6).fill(d));
  const pathGenerator = d3.line()
    .y((d, i) => (i <= 2 ? yStartValue : yEndScale(d[1])))
    .curve(d3.curveMonotoneX)
    .context(context);

  updateDimension();
  window.addEventListener("resize", updateDimension);

  function updateDimension() {
    width = container.node().clientWidth;
    canvas.attr("width", width * dpr);
    context.scale(dpr, dpr);
    svg.attr("width", width);
    xScale.range([margin.left, width - margin.right]);
    pathGenerator.x((d, i) =>
      xScale.range()[0] + (i * (xScale.range()[1] - xScale.range()[0])) / 5
    );
  }

  // Render static background (pipes and labels).
  function renderStatic() {
    context.save();
    context.clearRect(0, 0, width, height);
    context.beginPath();
    pathData.forEach(d => pathGenerator(d));
    context.lineWidth = pathWidth;
    context.strokeStyle = pathColor;
    context.stroke();
    context.restore();

    svg.selectAll(".start-title")
      .data([startTitle])
      .join("text")
      .attr("class", "path-title start-title")
      .attr("x", xScale.range()[0])
      .attr("y", margin.top - 15)
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text(d => d);

    svg.selectAll(".end-title")
      .data([endTitle])
      .join("text")
      .attr("class", "path-title end-title")
      .attr("text-anchor", "end")
      .attr("x", xScale.range()[1] + endBarWidth)
      .attr("y", margin.top - 30)
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text(d => d);

    svg.selectAll(".start-label")
      .data(starts)
      .join("text")
      .attr("class", "path-label start-label")
      .attr("dy", "0.32em")
      .style("font-weight", "bold")
      .attr("y", yStartValue)
      .attr("x", xScale.range()[0] + 10)
      .style("font-size", "16px")
      .text(d => d);

    svg.selectAll(".end-label")
      .data(ends)
      .join("text")
      .attr("class", "path-label end-label")
      .attr("dy", "0.32em")
      .attr("y", d => yEndScale(d))
      .attr("x", xScale.range()[1] - 10)
      .attr("text-anchor", "end")
      .style("font-size", "16px")
      .text(d => d);
  }

  function renderStaticWrapper() {
    renderStatic();
  }

  renderStaticWrapper();

  // Simulation parameters.
  const itemCountMax = 100000;
  const itemCountIncrement = 10;
  const itemFlowDuration = 10000;
  let items;
  let selectedCategories;
  let timer;

  // Each particle gets a random speed factor.
  const generateItem = initGenerateItem({
    starts,
    ends,
    stackedProbabilities,
    pathInnerWidth
  });

  function updateItems(elapsed) {
    const xProgressAccessor = d => ((elapsed - d.time) / itemFlowDuration) * d.speed;

    if (items.length <= itemCountMax) {
      items = items.concat(
        d3.range(itemCountIncrement).map(() => generateItem(elapsed, selectedCategories))
      );
    }

    let visibleItems = [];
    let finishedItems = [];
    items.forEach(d => {
      if (xProgressAccessor(d) < 1) {
        visibleItems.push(d);
      } else {
        finishedItems.push(d);
      }
    });

    if (finishedItems.length >= itemCountMax) {
      d3.timeout(() => { timer.stop(); }, 1000);
    }

    visibleItems.forEach(d => {
      d.x = xScale(xProgressAccessor(d));
      const yStart = yStartValue;
      const yEnd = yEndScale(d.end);
      const yChange = yEnd - yStart;
      const yProgress = yProgressScale(xProgressAccessor(d));
      d.y = yStart + yChange * yProgress + d.yJitter;
    });

    // Update live counter.
    const counterEl = document.getElementById("child-counter");
    if (counterEl) {
      counterEl.innerText = items.length.toLocaleString();
    }

    const finishedGrouped = d3.group(finishedItems, d => d.end, d => d.categoryIndex);
    const finishedStats = ends.map(end => {
      const group = finishedGrouped.get(end);
      let total = 0;
      const value = selectedCategories.map((c, i) => {
        let count = 0;
        if (group && group.has(i)) count = group.get(i).length;
        const stackedCount = [total, total += count];
        return { key: i, value: { count, stackedCount } };
      });
      value.forEach(({ value }) => {
        value.percentage = value.count / (total || 1);
        value.stackedPercentage = value.stackedCount.map(c => c / (total || 1));
        value.totalCount = total;
      });
      return { key: end, value };
    });

    drawCanvas(visibleItems, finishedStats);
    drawSVG(finishedStats);
  }

  function drawCanvas(visibleItems, finishedStats) {
    context.save();
    context.clearRect(0, 0, width, height);

    // Draw static pipes.
    context.beginPath();
    pathData.forEach(d => pathGenerator(d));
    context.lineWidth = pathWidth;
    context.strokeStyle = pathColor;
    context.stroke();

    // Draw moving particles.
    selectedCategories.forEach((c, i) => {
      context.beginPath();
      visibleItems.filter(d => d.categoryIndex === i)
        .forEach(d => {
          context.moveTo(d.x, d.y);
          context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
        });
      context.fillStyle = categoryColors[i];
      context.fill();
    });

    // Draw end bars.
    finishedStats.forEach(({ key, value }) => {
      context.save();
      context.translate(xScale.range()[1], yEndScale(key) - pathWidth / 2);
      value.forEach(({ value }, i) => {
        context.beginPath();
        if (value.totalCount === 0) {
          context.fillStyle = emptyBarColor;
          context.fillRect(0, 0, endBarWidth, pathWidth);
        } else {
          context.fillStyle = categoryColors[i];
          context.fillRect(
            0,
            pathWidth * value.stackedPercentage[0],
            endBarWidth,
            pathWidth * (value.stackedPercentage[1] - value.stackedPercentage[0])
          );
        }
      });
      context.restore();
    });
    context.restore();
  }

  function drawSVG(finishedStats) {
    svg.selectAll(".start-title")
      .data([startTitle])
      .join("text")
      .attr("class", "path-title start-title")
      .attr("x", xScale.range()[0])
      .attr("y", margin.top - 15)
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text(d => d);

    svg.selectAll(".end-title")
      .data([endTitle])
      .join("text")
      .attr("class", "path-title end-title")
      .attr("text-anchor", "end")
      .attr("x", xScale.range()[1] + endBarWidth)
      .attr("y", margin.top - 30)
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text(d => d);

    svg.selectAll(".start-label")
      .data(starts)
      .join("text")
      .attr("class", "path-label start-label")
      .attr("dy", "0.32em")
      .style("font-weight", "bold")
      .attr("y", yStartValue)
      .attr("x", xScale.range()[0] + 10)
      .style("font-size", "16px")
      .text(d => d);

    svg.selectAll(".end-label")
      .data(ends)
      .join("text")
      .attr("class", "path-label end-label")
      .attr("dy", "0.32em")
      .attr("y", d => yEndScale(d))
      .attr("x", xScale.range()[1] - 10)
      .attr("text-anchor", "end")
      .style("font-size", "16px")
      .text(d => d);

    svg.selectAll(".end")
      .data(finishedStats, d => d.key)
      .join(enter => enter.append("g").attr("class", "end"))
      .attr("transform", d =>
        `translate(${xScale.range()[1] + endBarWidth + 10},${yEndScale(d.key)})`
      )
      .selectAll(".stats")
      .data(d => d.value, d => d.key)
      .join(enter =>
        enter.append("g")
          .attr("class", "stats")
          .attr("transform", (d, i) =>
            `translate(${((margin.right - margin.left - endBarWidth - 10) / 2) * (i + 1)},0)`
          )
          .attr("text-anchor", "end")
          .call(g => g.append("text").attr("class", (d, i) => `stat-count category-${i}`))
          .call(g => g.append("text")
                        .attr("class", (d, i) => `stat-percentage category-${i}`)
                        .attr("dy", "1.2em"))
      )
      .call(g => g.select(".stat-count").text(d => formatCount(d.value.count)))
      .call(g => g.select(".stat-percentage")
        .text(d => formatPercentage(d.value.percentage))
        .attr("fill", (d, i) => (i === 0 ? "#FF9F1C" : "#1e90ff")));
  }

  // The simulation function starts a timer that updates moving particles.
  function simulate(selected) {
    selectedCategories = selected;
    items = [];
    timer = d3.timer(updateItems);
  }

  return { simulate, renderStatic: renderStaticWrapper };

  function renderStaticWrapper() {
    renderStatic();
  }
}



////////////////////////////////////////////////////////////
// Item Generation Helper
////////////////////////////////////////////////////////////
function initGenerateItem({ starts, ends, stackedProbabilities, pathInnerWidth }) {
  let index = -1;
  const getRandomCategoryIndex = getRandomFrom([0, 1]);
  const getRandomStart = getRandomFrom(starts);
  const timeJitter = d3.randomUniform(-0.1, 0.1);
  const yJitter = d3.randomUniform(-pathInnerWidth / 2, pathInnerWidth / 2);
  const getRandomSpeed = d3.randomUniform(1.5, 2);

  return function (elapsed, currentCategories) {
    index++;
    const categoryIndex = getRandomCategoryIndex();
    const start = getRandomStart();
    const category = currentCategories[categoryIndex];
    const key = `${category}-Not Seen`;
    const p = stackedProbabilities[key];
    const end = ends[d3.bisect(p, Math.random())];
    return {
      index,
      categoryIndex,
      category,
      start,
      end,
      time: elapsed + timeJitter(),
      yJitter: yJitter(),
      speed: getRandomSpeed()
    };
  };
}

function getRandomFrom(arr) {
  const getRandomIndex = d3.randomInt(arr.length);
  return function () {
    return arr[getRandomIndex()];
  };
}
