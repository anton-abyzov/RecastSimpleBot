/*
 * bot.js
 *
 * In this file:
 * - received message from a connected channel will be transformed with Recast.AI SDK
 * - received message from test command will be processed by Recast.AI
 *   You can run this command for testing:
 *   curl -X "POST" "http://localhost:5000" -d '{"text": "YOUR_TEXT"}' -H "Content-Type: application/json; charset=utf-8"
 *
 *
 * The Recast.AI SDK will handle the message and call your reply bot function (ie. replyMessage function)
 */

const recastai = require('recastai').default

// Instantiate Recast.AI SDK
const client = new recastai(process.env.REQUEST_TOKEN)

/*
 * Callback for BotConnector messages
 * Parameters:
 * - message: Message received from BotConnector
 */

const moviesDb = [{
  name: 'speed',
  year: '1982',
  description: 'peed is a 1994 American action thriller film directed by Jan de Bont in his feature film directorial debut. The film stars Keanu Reeves, Dennis Hopper, Sandra Bullock'
},
{
  name: 'titanic',
  year: '1997',
  description: 'Titanic is a 1997 American epic romance-disaster film directed, written, co-produced and co-edited by James Cameron. A fictionalized account of the sinking of the RMS Titanic'
},
{
  name: 'terminator',
  year: '1990',
  description: 'The Terminator is a 1984 American science-fiction action film directed by James Cameron. It stars Arnold Schwarzenegger as the Terminator were instrumental in the film\'s financing and production. '
},
{
  name: 'matrix',
  year: '1995',
  description: 'The Matrix is a science fiction action media franchise created by The Wachowskis, about heroes who fight a desperate war against machine overlords that have enslaved humanity in an extreme '
}
]

const printMovie = function (theMovie) {
  return `This movie was released in ${theMovie.year}. ${theMovie.description}`
}

const replyMessage = message => {

  const text = message.content
  console.log('I receive: ', text)

  return client.request.analyseText(text)
    .then(nlp => {
      let reply = 'I\'m sorry but I don\'t understand what you are talking about.'      
      const intent = nlp.intent()
      var movie = nlp.entities.movie;      
      if (!intent) {
        reply = "Please clearify your question"
        message.addReply({ type: 'text', content: reply })
        return message.reply().then(p => p.body)
      } else {
        console.log(intent.confidence)
      }
      if (movie && movie.length != 0) {

        const theMovie = moviesDb.find((x, index) => {
          return x.name == movie[0].value;
        })
        
        if (theMovie) {
          reply = printMovie(theMovie)
        } else {
          let allMoviesList = "Please, select a movie from a list. "
          moviesDb.map((x) => allMoviesList += printMovie(x))
          reply = allMoviesList
        }
      } else {
        reply = `I understand that you talk about ${intent.slug}.`
      }
      
      message.addReply({ type: 'text', content: reply })

      return message.reply().then(p => p.body)
    })
}

/*
 * Main bot function
 * Parameters are:
 * - body: Request body
 * - response: Response of your server (can be a blank object if not needed: {})
 */
const reply = (request, response) => {
  return client.connect.handleMessage(request, response, replyMessage)
}

module.exports = {
  reply,
}
