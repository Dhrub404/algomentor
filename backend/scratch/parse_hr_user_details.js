const fs = require("fs");
const path = require("path");

const statePath = path.join(__dirname, "hr_parsed_state.json");
if (!fs.existsSync(statePath)) {
  console.log("File not found:", statePath);
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
const viewProfiles = state.community && state.community.viewProfiles;
if (!viewProfiles) {
  console.log("community.viewProfiles not found in state");
  process.exit(1);
}

console.log("Available profiles in state:", Object.keys(viewProfiles));
const userProfile = viewProfiles.dheeraj;
if (userProfile) {
  console.log("Keys in dheeraj profile:", Object.keys(userProfile));
  
  // Print some key details
  console.log("Level:", userProfile.level);
  console.log("Country:", userProfile.country);
  console.log("School:", userProfile.school);
  
  // Print scores summary
  if (userProfile.scores) {
    console.log("Scores categories:", Object.keys(userProfile.scores));
    // Print first category details
    const cat = Object.keys(userProfile.scores)[0];
    console.log(`Scores details for category ${cat}:`, userProfile.scores[cat]);
  }

  // Print badges count or certificates count
  // Wait, let's see if badges are inside dheeraj profile or somewhere else in state.community
  // Let's check state.community.viewProfiles.dheeraj.badges or similar
  if (userProfile.badges) {
    console.log("Badges in user profile:", userProfile.badges);
  } else {
    console.log("No badges field in user profile directly.");
  }
}
