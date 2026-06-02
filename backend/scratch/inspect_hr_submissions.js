const fs = require("fs");
const path = require("path");

const statePath = path.join(__dirname, "hr_parsed_state.json");
if (!fs.existsSync(statePath)) {
  console.log("File not found:", statePath);
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
const userProfile = state.community && state.community.viewProfiles && state.community.viewProfiles.dheeraj;
if (userProfile) {
  console.log("submissionHistory keys/details:", typeof userProfile.submissionHistory);
  if (userProfile.submissionHistory) {
    console.log("submissionHistory keys:", Object.keys(userProfile.submissionHistory));
    // Let's print out the first few keys or items
    const keys = Object.keys(userProfile.submissionHistory);
    console.log("Sample submissionHistory data:");
    console.log(JSON.stringify(userProfile.submissionHistory).substring(0, 1000));
  }
}
