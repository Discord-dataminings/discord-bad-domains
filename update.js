const fs = require("fs");


async function fetchDomains() {
  try {
    const response = await fetch('https://cdn.discordapp.com/bad-domains/updated_hashes.json');
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch rollouts: ${error.message}`);
  }
}
// Saves the data //
async function main() {
  try {
    const domains = await fetchDomains();



    fs.writeFile('domains.txt', domains.join('\n'), 'utf8', (err) => {
      if (err) {
        throw new Error(`Error writing to domains.txt: ${err.message}`);
      }
      console.log('Data has been written to data.json on your local machine.');
    });
  } catch (error) {
    console.error(error);
  }
}

main();
