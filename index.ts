import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';
import { homedir } from 'os';
import yargs from 'yargs';


// Check CLI arg for custom credential file path
const customCredFileLocation = yargs?.argv?.credentialFile as string;


/**
 * Load and parse credential file
 */
const credentialFile = customCredFileLocation || `${homedir}/.aws/credentials`;
const credentialFileFirstBackup = `${credentialFile}.switcher.firstbck`;
const credentialFileBackup = `${credentialFile}.switcher.bck`;
const credentialFileContent = readFileSync(credentialFile, { encoding: 'utf-8' });
const credentialSet: Record<string, Record<string, string>> = {};

let nProfile = '';
credentialFileContent.split('\n').forEach((line) => {
  const firstChar = line[0];

  // Profile name line
  if (line[0] === '[') {
    const profileName = line.substr(1, line.length - 2);
    nProfile = profileName;
    credentialSet[profileName] = {};
  } else if (firstChar !== '#' && line.trim() !== '') {
    const [key, value] = line.split('=');
    credentialSet[nProfile][key] = value;
  }
});
const currentProfile = Object.entries(credentialSet).find(([key, values]) => {
  if (key === 'default') return false;
  return values?.aws_access_key_id === credentialSet?.default?.aws_access_key_id;
})?.[0];


/**
 * Check if first backup created, if not, create
 */
if (!existsSync(credentialFileFirstBackup)) {
  copyFileSync(credentialFile, credentialFileFirstBackup);
}


/**
 * List profiles, show current, ask for new, update credentials
 */
const profiles = Object.keys(credentialSet).filter((k) => k !== 'default');
inquirer.prompt([
  {
    name: 'profile',
    message: 'Select a profile',
    suffix: `  - Current: ${currentProfile}`,
    type: 'list',
    choices: profiles,
  }
]).then(({ profile }) => {
  // Create backup for this run
  copyFileSync(credentialFile, credentialFileBackup);

  // Generate new credential string
  const entries = Object.entries(credentialSet[profile]).map(([key, value]) => {
    return `${key}=${value}`;
  }).join('\n');
  const newCreds = `[default]\n${entries}\n\n`;

  // Switch profile by overwriting default section with current settings
  const newFile = credentialFileContent.replace(/\[default([^[])*/gs, newCreds);
  writeFileSync(credentialFile, newFile, { encoding: 'utf-8' });
});
