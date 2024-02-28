const express = require('express')
const app = express()
const path = require('path')
const dbpath = path.join(__dirname, 'covid19India.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
//INTIALIZATION OF DB AND SERVER
const intializationofDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB ERROR ${e.message}`)
    process.exit(1)
  }
}
intializationofDBAndServer()
app.use(express.json())
//API1 (
app.get('/states/', async (request, response) => {
  const getStates = `
    SELECT * 
    FROM state;
    `
  const statesArray = await db.all(getStates)
  const result = statesArray => {
    return {
      stateId: statesArray.state_id,
      stateName: statesArray.state_name,
      population: statesArray.population,
    }
  }
  response.send(statesArray.map(each => result(each)))
})
//API2
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getState = `
    SELECT *
    FROM state
    WHERE state_id = ${stateId};
    `
  const getState1 = await db.get(getState)
  response.send({
    stateId: getState1.state_id,
    stateName: getState1.state_name,
    population: getState1.population,
  })
})
//API 3
app.post('/districts/', async (request, response) => {
  const bodydetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = bodydetails
  const createdistrictsQuery = `
    INSERT INTO 
    district (district_name,state_id,cases,cured,active,deaths)
    VALUES(
        '${districtName}',
        '${stateId}',
        '${cases}',
        '${cured}', 
        '${active}',
        '${deaths}'
    );
    `
  const dbresponse = await db.run(createdistrictsQuery)
  response.send('District Successfully Added')
})
//API 4
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getDistrict = `
    SELECT *
    FROM district
    WHERE district_id = ${districtId};
    `
  const getDistrict1 = await db.get(getDistrict)
  response.send({
    districtId: getDistrict1.district_id,
    districtName: getDistrict1.district_name,
    stateId: getDistrict1.state_id,
    cases: getDistrict1.cases,
    cured: getDistrict1.cured,
    active: getDistrict1.active,
    deaths: getDistrict1.deaths,
  })
})
//API 5
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteDistrict = `
    DELETE FROM district
    WHERE district_id = ${districtId};
    `
  await db.run(deleteDistrict)
  response.send('District Removed')
})
//API 6
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const bodydetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = bodydetails
  const updatedistrictQuery = `
    UPDATE district
    SET 
    district_name = '${districtName}',
    state_id = '${stateId}',
    cases = '${cases}',
    cured = '${cured}',
    active = '${active}',
    deaths = '${deaths}'
    WHERE district_id = ${districtId}; 
    `
  await db.run(updatedistrictQuery)
  response.send('District Details Updated')
})
//API  7
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getTotal = `
    SELECT 
    SUM(cases),
    SUM(cured),
    SUM(active),
    SUM(deaths)
    FROM district
    WHERE state_id = ${stateId};
    `
  const gettotal1 = await db.get(getTotal)
  response.send({
    totalCases: gettotal1['SUM(cases)'],
    totalCured: gettotal1['SUM(cured)'],
    totalActive: gettotal1['SUM(active)'],
    totalDeaths: gettotal1['SUM(deaths)'],
  })
})
//API 8
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDistrict = `
    SELECT state_id
    FROM district
    WHERE district_id = ${districtId};
    `
  const getdistrictQuery = await db.get(getDistrict)
  const stateNameQuery = `
    SELECT state_name as stateName 
    FROM state
    WHERE state_id = ${getdistrictQuery.state_id};
    `
  const getstatenamequery = await db.get(stateNameQuery)
  response.send(getstatenamequery)
})
module.exports = app
