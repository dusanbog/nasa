// Declare the chart dimensions and margins.
const marginTop = 30; // the top margin, in pixels
const marginRight = 30; // the right margin, in pixels
const marginBottom = 30; // the bottom margin, in pixels
const marginLeft = 30; // the left margin, in pixels
const width = 960; // the outer width of the chart, in pixels
const goldenRatio = 1.618033988749894;
const height = width / goldenRatio;
const apiKey = "L2RVpyHPSsvfTDaECnTmlpEnuqa5Fdns8So91S2P";

const random = d3.randomUniform();

const innerHeight = height - marginTop - marginBottom;
const innerWidth = width - marginLeft - marginRight;

const yScale = d3
  .scaleLinear()
  .range([innerHeight - 4, 4])
  .domain([0, 1]);

const area = d3
  .area()
  // .defined(i => D[i])
  .curve(d3.curveBasis)
  .y((d) => yScale(d.y))
  .x0((d) => d.x1)
  .x1((d) => d.x2);

const svg = d3
  .select("#art-container")
  .append("svg")
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto; height: intrinsic;")

const g = svg
  .append("g")
  .attr("transform", `translate(${marginLeft}, ${marginTop})`);

const lineScale = d3
  .scaleLinear()
  .range([18, innerWidth - 18])
  .domain([0, 1]);


const widthScale = d3.scaleLinear().range([0, 7]).domain([0, 1]);
//assign a current date to from dat
fetchData();

async function fetchData() {
  let fromDate = new Date(); 
  let totalLineData = [];
  let totalLines = 0;
  for(let month = 3; month >= 1; --month) 
  {
    //Change the date to a 2 months ago
    fromDate.setMonth(fromDate.getMonth() - month);
    //Remove time from the date
    const fromDateString = fromDate.toISOString().split("T")[0];
    //Build API url with the date as parameter
    const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${apiKey}&start_date=${fromDateString}`;
    //Call the api and fetch the data
    await fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
          //Pull dates from the near_eath_objects object
          let near_earth_objects = Object.entries(data.near_earth_objects);
          //Iterate through the dates
          for (let element of near_earth_objects) {            
            let lineData = [];
            let yOffset = 0.5;
            element[1].forEach((nmo) => {
              lineData.push({ 
                x1: -nmo.estimated_diameter.kilometers.estimated_diameter_min*10, 
                x2: nmo.estimated_diameter.kilometers.estimated_diameter_max*10, 
                y: yOffset / near_earth_objects.length 
              });

                          
              lineData.push({ 
                x1: -nmo.close_approach_data[0].relative_velocity.kilometers_per_second, 
                x2: nmo.close_approach_data[0].relative_velocity.kilometers_per_second, 
                y: yOffset / near_earth_objects.length 
              });  
              yOffset++
            });
      
            totalLines++;
            totalLineData.push(lineData);
          }

      })
      .catch((error) => {
        console.log(error);
      });      
  }
 
  for(let i = 0; i < totalLines; i++) 
  {
    g.append("path")
    .attr("stroke", "#777")
    .attr("fill", getColourScheme(Math.floor(Math.random() * 6) + 1))
    .attr("fill-opacity", 0.3)
    .attr("d", area(totalLineData[i]))
    .attr("transform", `translate(${lineScale(i / totalLines)},0)`);
  }
}

//
getColourScheme = (number) => {
  switch (number) {
    case 1:
      return d3.schemeBlues[6][4];
    case 2:
      return d3.schemePurples[6][4];
    case 3:
      return d3.schemeReds[6][4];;
    case 4:
      return  d3.schemeGreens[6][4];
    case 5:
      return d3.schemeGreys[6][4];
    case 6:
      return d3.schemeOranges[6][4]
    default:
      // purple        
      return d3.schemePurples[6][4];
      
  }
}

  

