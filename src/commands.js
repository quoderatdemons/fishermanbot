import dotenv from 'dotenv';
import { capitalize, InstallGlobalCommands } from './utils.js';
dotenv.config({ path: '.dev.vars' });
// Get the game choices from game.js


// Simple test command
const FISH_COMMAND = {
  name: 'fish',
  description: 'Fishes',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const REGISTER_COMMAND = {
  name: 'register',
  description: 'Registers you as a user',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const INVENTORY_COMMAND = {
  name: 'inventory',
  description: "Displays user's inventory",
  options: [
    {
      type: 6,
      name: 'user',
      description: 'User',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [FISH_COMMAND, REGISTER_COMMAND, INVENTORY_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
