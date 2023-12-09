const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const app = express();

const { open } = sqlite;
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db;

const initializeDBAndServer = async () => {
  //initilization of database
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  //start the server
  app.listen(3000, () => {
    console.log("server started at http://localhost:3000");
  });
};
initializeDBAndServer();

const convertPlayerDbObjectToResponseCase = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDetailsObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

// app.get(path, middleware, handler)
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
       SELECT 
        * 
       FROM
      player_details;`;
  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((playerObject) =>
      convertPlayerDbObjectToResponseCase(playerObject)
    )
  );
});

//API 2
app.get("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayerQuery = `
       SELECT 
        * 
       FROM
      player_details
       WHERE 
       player_id= ${playerId};`;
    const player = await db.get(getPlayerQuery);
    response.send(convertPlayerDbObjectToResponseCase(player));
  } catch (e) {
    console.log(e.message);
  }
});

//API 3

app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const { playerName } = request.body;
    const updatePlayerQuery = `
       UPDATE
       player_details
       SET 
        player_name='${playerName}'
       WHERE
       player_id = ${playerId};`;
    await db.run(updatePlayerQuery);

    response.send("Player Details Updated");
  } catch (e) {
    console.log(e.message);
  }
});

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  try {
    const { matchId } = request.params;
    const getMatchQuery = `
       SELECT 
        * 
       FROM
      match_details
       WHERE 
       match_id= ${matchId};`;
    const match = await db.get(getMatchQuery);
    response.send(convertMatchDetailsObjectToResponseObject(match));
  } catch (e) {
    console.log(e.message);
  }
});

//API 5
app.get("/players/:playerId/matches/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayerMatchesQuery = `
       SELECT 
        * 
       FROM
      player_match_score 
      NATURAL JOIN match_details
       WHERE 
       player_id= ${playerId};`;
    const playerMatches = await db.get(getPlayerMatchesQuery);
    response.send(
      playerMatches.map((eachMatch) =>
        convertMatchDetailsDbObjectToResponseObject(eahMatch)
      )
    );
  } catch (e) {
    console.log(e.message);
  }
});

//API 6
app.get("/matches/:matchId/players/", async (request, response) => {
  try {
    const { matchId } = request.params;
    const getMatchPlayersQuery = `
       SELECT 
        player_details.player_id as playerId,
        player_details.player_name as playerName
       FROM
       player_match_score 
       Natural JOIN
      player_details
       WHERE 
       match_id= ${matchId};`;
    const playersArray = await db.all(getMatchPlayersQuery);
  } catch (e) {
    console.log(e.message);
  }
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getMatchPlayersQuery = `
       SELECT 
        player_id as playerId,
        player_name as playerName,
        SUM(score) as totalScore,
        SUM(fours) as totalFours,
        SUM(sixes) as totalSixes,
       FROM
       player_match_score 
       Natural JOIN
      player_details
       WHERE 
      player_match_score. player_id= ${playerId};`;
    const playerMatchDetails = await db.get(getMatchPlayersQuery);
    response.send(playerMatchDetails);
  } catch (e) {
    console.log(e.message);
  }
});
//jbwjebfwbef
module.exports = app;
