import dotenv from 'dotenv';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomFish, DiscordRequest } from './utils.js';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, onSnapshot } from "firebase/firestore";
dotenv.config({ path: '.dev.vars' });
// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7kFnKBqku5jUklTMNX2U5G68Y-Om0o3w",
  authDomain: "fisherman-51cc5.firebaseapp.com",
  projectId: "fisherman-51cc5",
  storageBucket: "fisherman-51cc5.firebasestorage.app",
  messagingSenderId: "63119395855",
  appId: "1:63119395855:web:5c1be085aa8ce9130ae77a"
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);
const db = getFirestore(app);
/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;
  const context = req.body.context
  const username = context === 0 ? req.body.member.user.username : req.body.user.username
  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    const user = req.body.data.options[0]
    let docSnap = await getDoc(doc(db, "users", username))
    if (docSnap.exists()) {
      // "test" command
    if (name === 'fish') {
      // Send a message into the channel where command was triggered from
      let randomFish = getRandomFish()
      let mapassign = "fishes." + randomFish
      const userRef = doc(db, "users", username);
      await updateDoc(userRef, {
        [mapassign]: increment(1)
      })
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              // Fetches a random emoji to send from a helper function
              content: `You caught a ${randomFish}!`
            }
          ]
        },
      });
    }
    
    }
    if (name === 'register' & !docSnap.exists()) {
      // Send a message into the channel where command was triggered from
      try {
        const docRef = await setDoc(doc(db, "users", username), {
          fishes: {
            anchovy: 0,
            carp: 0,
            herring: 0,
            salmon: 0,
            sardine: 0,
            trout: 0,
            tuna: 0
          },
          money: 0,
          rod: "Basic Rod"
        });
        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              // Fetches a random emoji to send from a helper function
              content: `Registered!`
            }
          ]
        },
      });
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    if (name === 'inventory') {
      // Send a message into the channel where command was triggered from
      const userId = data.options[0].value;
      const user = data.resolved.users[userId];
      let docSnap = await getDoc(doc(db, "users", user.username))
      if (docSnap.exists()) {
        const inventory = docSnap.data().fishes
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                // Fetches a random emoji to send from a helper function
                content: `${inventory.anchovy} anchovies, ${inventory.carp} carp, ${inventory.herring} herring, ${inventory.salmon} salmon, ${inventory.sardine} sardines, ${inventory.trout} trout, ${inventory.tuna} tuna!`
              }
            ]
          },
        })};
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
