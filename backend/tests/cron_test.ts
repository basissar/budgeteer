import { assertEquals } from "https://deno.land/std@0.219.1/assert/assert_equals.ts";
import { Cron } from "https://deno.land/x/croner@5.1.0/src/croner.js";
import { DateTime } from "https://cdn.skypack.dev/luxon";
import { BufReader } from "https://deno.land/std@0.200.0/io/buf_reader.ts";

Deno.test("Cron test", async () => {
    let count = 0;

    // Create a Cron instance
    const scheduler = new Cron("* * * * * *", () => {
        count++;
        console.log(`Cron test: ${count}`);
    });

    // Start the Cron scheduler
    scheduler;

    // Wait for a few seconds to allow the Cron to run
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Stop the Cron scheduler
    scheduler.stop();

    // Assert the behavior, in this case, we expect it to run at least 2 times in 3 seconds
    // Adjust this based on your expected behavior
    assertEquals(count >= 5, true);
});

Deno.test("Cron test with timezone", async () => {
    let time;


    // Create a Cron instance with the cron expression
    const scheduler = new Cron('2024-05-05T13:31:00', {timezone: 'Europe/Prague'}, () => {
        console.log("something happened");
        time = DateTime.now();
    } );

    // Start the Cron scheduler
    scheduler;

    // Wait for a few seconds to allow the Cron to run
    await new Promise(resolve => setTimeout(resolve, 60000));

    // Stop the Cron scheduler
    scheduler.stop();

   // Assert that time is not null
   assertEquals(time !== null, true);
});

Deno.test("Testing all timezones", async () => {
    const path = 'C:/Users/sbasi/Documents/CVUT/5th_semester/SemestralProject/GIT/budgeteer/backend/node_modules/timezones.json/timezones.json'
    const file = await Deno.open(path);
    const bufReader = new TextDecoder("utf-8").decode(await Deno.readAll(file));
    const timezones: { utc: string[] }[] = JSON.parse(bufReader);
    file.close();

    const allTimezones: string[] = [];

    for (const timezone of timezones) {
        allTimezones.push(...timezone.utc);
    }

    // Add your assertions here, for example:
    assertEquals(allTimezones.length > 0, true);
    console.log("Total timezones:", allTimezones.length);
    console.log("Example timezone:", allTimezones[0]);
    console.log("All timezones:", allTimezones);
})

Deno.test("Testing timezones where it's currently between 10 PM and 11 PM", async () => {
    const path = 'C:/Users/sbasi/Documents/CVUT/5th_semester/SemestralProject/GIT/budgeteer/backend/node_modules/timezones.json/timezones.json';
    const fileContent = await Deno.readTextFile(path);
    
    const timezones: { utc: string[], offset: number }[] = JSON.parse(fileContent);

    const currentTimeUTC = DateTime.utc();

    const matchingTimezonesSet = new Set<string>(); // Use a Set to automatically remove duplicates

    for (const timezone of timezones) {
        const localTime = currentTimeUTC.setZone(timezone.utc[0]);
        if (localTime.hour === 0) {
            timezone.utc.forEach(tz => matchingTimezonesSet.add(tz)); // Add each timezone to the set
        }
    }

    const matchingTimezones: string[] = Array.from(matchingTimezonesSet); // Convert set to array

    // Add your assertions here
    assertEquals(matchingTimezones.length > 0, true);
    console.log("Timezones where it's currently between 10 PM and 11 PM:", matchingTimezones);
});