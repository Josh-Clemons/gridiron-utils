require('dotenv').config();
const axios = require('axios');


const updateDb = async () => {
    const now = new Date();
    const updateUrl = process.env.UPDATE_URL;
    const bearToken = process.env.BEARER_TOKEN;

    console.log(`Trying to update database at ${now}`);
    
    try {
        const response = await axios.get(updateUrl, {
            headers: {
              'Authorization': `Bearer ${bearToken}`
            }
          });
        console.log(`GET request to ${updateUrl} was succesful at ${new Date()}!`);
        findNextUpdate(response.data, now);
    } catch (error) {
        console.log(`Error updating grid-iron database at ${new Date()}`);
        console.log(error.message);
    }
    
}

const findNextUpdate = (competitors, now) => {
    let nextGameStart;

    for (let competitor of competitors) {
        const startDate = new Date(competitor.startDate);
        const isAfterNow = startDate > now;

        if((!nextGameStart && isAfterNow) || (startDate < nextGameStart && isAfterNow)){
            nextGameStart = startDate;
        }
    }

    let timeUntilNextRun = 8 * 60 * 60 * 1000;
    const timeUntilNextGameUpdate = nextGameStart - now + 210 * 60 * 1000;

    if(timeUntilNextGameUpdate < timeUntilNextRun) {
        timeUntilNextRun = timeUntilNextGameUpdate;
    }

    console.log(`\nNext game start: ${nextGameStart}
        \ntime until next run (ms): ${timeUntilNextRun}\n`);
    
    scheduleNextRun(timeUntilNextRun, now);
}

const scheduleNextRun = (timeUntilNextRun, now) => {
    const scheduledTime = new Date(now.getTime() + timeUntilNextRun);
    console.log(`Next run scheduled for: ${scheduledTime}`); 
    setTimeout(() => {
        updateDb();
    }, timeUntilNextRun);
}


updateDb();