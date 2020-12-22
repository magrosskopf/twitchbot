const tmi = require('tmi.js');
const puppeteer = require('puppeteer');
const keys = require('./keys.json')

const io = require('socket.io')(3000, {
    cors: {
      origin: "http://127.0.0.1:5500",
      methods: ["GET", "POST"],
      allowedHeaders: ["Access-Control-Allow-Origin"],
      credentials: true
    }
  });



//   // or with emit() and custom event names
//   socket.emit('greetings', 'Hey!');

//   // handle the event sent with socket.send()
//   socket.on('message', (data) => {
//     console.log(data);
//   });

//   // handle the event sent with socket.emit()
//   socket.on('salutations', (elem1, elem2, elem3) => {
//     console.log(elem1, elem2, elem3);
//   });




 

// Define configuration options
const opts = {
  identity: {
    username: keys.username,
    password: keys.pwd
  },
  channels: keys.channels
};
// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
    client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg;

  // If the command is known, let's execute it
  if (commandName.indexOf("?") != 0) {
      
    scrapeImages(commandName).then(res => {
       // client.say(target, res);
        console.log("start emmiting");
        io.on('connection', socket => {
            socket.send(res);
            res = "";
        });
    }).catch(error => {
        io.on('connection', socket => {
            socket.send(error);
            error = "";
        });
    });
    console.log(`* Executed ${commandName} command`);
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

// Crawl first answer in Google Search

function searchQuestion() {
 

}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}


const scrapeImages = async (question) => {
    const browser = await puppeteer.launch( { headless: true });
    const page = await browser.newPage();
    
    await page.goto('https://www.google.de');


    // Login form
    await page.screenshot({path: '1.png'});

    await page.type('[aria-label="Suche"]', question);

    await page.screenshot({path: '2.png'});

    await page.click('[type=submit]');

    // Social Page

    await page.waitFor(5000);

    await page.waitForSelector('img ', {
        visible: true,
    });


    await page.screenshot({path: '3.png'});


    // Execute code in the DOM
    const data = await page.evaluate( () => {

        const images = document.getElementsByClassName('aCOpRe');
        console.log("images");

        const urls = Array.from(images).map(v => v.innerHTML);
        let url = urls[0];
        url = url.replace(/<\/?[^>]+(>|$)/g, "");

        return url
    });
  
    await browser.close();

    console.log(data);

    return data;
}

