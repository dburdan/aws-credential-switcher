#!/usr/bin/env node
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';
import { homedir } from 'os';
import yargs from 'yargs';


// Check CLI arg for custom credential file path
const customCredFileLocation = yargs?.argv?.credentialFile as string;
const customConfigFileLocation = yargs?.argv?.configFile as string;


/**
 * Load and parse credential/config file
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

const configFile = customConfigFileLocation || `${homedir}/.aws/config`;
const configFileFirstBackup = `${configFile}.switcher.firstbck`;
const configFileBackup = `${configFile}.switcher.bck`;
const configFileContent = readFileSync(configFile, { encoding: 'utf-8' });
const configSet: Record<string, Record<string, string>> = {};

let nConfig = '';
configFileContent.split('\n').forEach((line) => {
  const firstChar = line[0];

  // Profile name line
  if (line[0] === '[') {
    const profileName = line.substr(1, line.length - 2).replace('profile ', '');
    nConfig = profileName;
    configSet[profileName] = {};
  } else if (firstChar !== '#' && line.trim() !== '') {
    const [key, value] = line.split('=');
    configSet[nConfig][key] = value;
  }
});


if (currentProfile) {
  /**
   * Check if first backup created, if not, create
   */
  if (!existsSync(credentialFileFirstBackup)) {
    copyFileSync(credentialFile, credentialFileFirstBackup);
  }
  if (!existsSync(configFileFirstBackup)) {
    copyFileSync(configFileBackup, configFileFirstBackup);
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
    // Create backups for this run
    copyFileSync(credentialFile, credentialFileBackup);
    copyFileSync(configFile, configFileBackup);

    // Generate new credential string
    const credentialEntries = Object.entries(credentialSet[profile]).map(([key, value]) => {
      return `${key}=${value}`;
    }).join('\n');
    const newCreds = `[default]\n${credentialEntries}\n\n`;

    // Switch profile by overwriting default section with current settings
    const newCredFile = credentialFileContent.replace(/\[default([^[])*/gs, newCreds);
    writeFileSync(credentialFile, newCredFile, { encoding: 'utf-8' });

    // Generate new config string
    const configEntries = Object.entries(configSet[profile]).map(([key, value]) => {
      return `${key}=${value}`;
    }).join('\n');
    const newConfig = `[default]\n${configEntries}\n\n`;

    // Switch config by overwriting default section with current config
    if (configSet?.[currentProfile]) {
      const newConfigFile = configFileContent.replace(/\[default([^[])*/gs, newConfig);
      writeFileSync(configFile, newConfigFile, { encoding: 'utf-8' });
    }
  });
}
