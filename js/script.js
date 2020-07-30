getData()

function getData() {
    d3.csv('data/data.csv')  //data is downloaded from https://population.un.org/wpp/Download/Standard/Population/
        .then(data => {
            data.forEach(row => {
                row.Population = +row.Population * 1000;
                row.Country = row.Country
            });
            render(data);
        })
        .catch(err => console.log(err))
}

const render = (data) => {
    const chartData = initializeChart();
    const { xValue, yValue, margin, innerWidth, innerHeight, svg } = chartData;

    const scales = scale(innerWidth, innerHeight, data, xValue, yValue);
    const { xScale, yScale } = scales;

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    addingAxes(xScale, yScale, innerWidth, innerHeight, g);
    addingTitle(g, innerWidth);
    appendTooltip();

    g.selectAll('.bar').data(data)
        .enter().append('rect').attr("class", "bar")
        .attr('x', d => xScale(xValue(d)))
        .attr('y', d => yScale(yValue(d)))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(yValue(d)))
        .on('mouseover', hoverEffectOver)
        .on('mouseout', hoverEffectDone)
};

//Hover effect on bars - opacity decrease and data display
function hoverEffectOver() {
    const tooltip = d3.select('.tooltip');
    const selectedElement = d3.select(this);

    selectedElement.transition()
        .duration('50')
        .attr('opacity', '.85')

    tooltip.transition()
        .duration(50)
        .style("opacity", 1)

    const tooltipInfo = selectedElement._groups[0][0].__data__.Population
    tooltip.html(d3.format("s")(tooltipInfo).replace('G', 'B')) //display the data when hovering https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
}

//Hover effect on bars - back to normal
function hoverEffectDone() {
    const tooltip = d3.select('.tooltip');

    d3.select(this).transition()
        .duration('50')
        .attr('opacity', '1');

    tooltip.transition()
        .duration('50')
        .style("opacity", 0);
}

const appendTooltip = () => {
    d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}

//Adding the X and Y axes and their labels
const addingAxes = (xScale, yScale, innerWidth, innerHeight, g) => {
    const xAxisLabel = 'Country';
    const yAxisLabel = 'Population';

    const xAxis = d3.axisBottom(xScale)
        .tickPadding(10);

    const formatNumberYaxis = number => d3.format('.2s')(number).replace('G', 'B') //format the numbers for Y Axis
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(formatNumberYaxis)
        .tickSize(-innerWidth)
        .tickPadding(5);

    const yAxisG = g.append('g').call(yAxis);
    const xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', -50)
        .attr('x', -innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90)`)
        .text(yAxisLabel);

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 50)
        .attr('x', innerWidth / 2)
        .text(xAxisLabel);
}

//Initialize some data for our chart
const initializeChart = () => {
    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const xValue = d => d.Country;
    const yValue = d => d.Population;
    const margin = { top: 120, right: 40, bottom: 88, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    return { xValue, yValue, margin, innerWidth, innerHeight, svg }
}

//Adding the title for our chart
const addingTitle = (g, innerWidth) => {
    const title = 'Top 15 countries with highest population';
    g.append('text')
        .attr('class', 'title')
        .attr('y', -20)
        .attr('x', innerWidth / 3.6)
        .text(title);
}

//Scales the values from our data to the screen
const scale = (innerWidth, innerHeight, data, xValue, yValue) => {
    const xScale = d3.scaleBand()
        .domain(data.map(xValue))
        .range([0, innerWidth])

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, yValue)])
        .range([innerHeight, 0])

    return { xScale, yScale }
}


