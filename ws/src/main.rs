/// An example of a chat web application server
extern crate docopt;
extern crate serde;
extern crate serde_json;
extern crate ws;

#[macro_use]
extern crate serde_derive;

use std::fmt::Debug;
use std::time::{Duration, Instant};

use docopt::Docopt;

use ws::{listen, CloseCode, Handler, Handshake, Message, Request, Response, Result, Sender};

const USAGE: &'static str = "
The Reactions WebSockets server.

Usage:
  reactions [--host=<host>] [--port=<port>]
  reactions (-h | --help)

Options:
  -h --help      Show this screen.
  --host=<host>  Host to listen on [default: 127.0.0.1].
  --port=<port>  Port to listen on [default: 8000].
";

#[derive(Debug, Copy, Clone, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
enum Payload {
    Welcome {
        id: usize,
    },
    Reaction {
        id: usize,
        seq: usize,
        payload: Emoji,
    },
}

impl Payload {
    fn from_json(json: &str) -> std::result::Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }

    fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap()
    }
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
enum Emoji {
    Like,   // 👍
    Lol,    // 😂
    Shook,  // 😮
    Scream, // 😱
    Sweat,  // 😅
    Angry,  // 😡
    Cry,    // 😭
    Scare,  // 😨
    Heart,  // ❤️
    Poop,   // 💩
}

struct Session {
    out: Sender,
    last_sent_at: Option<Instant>,
}

impl Session {
    fn id(&self) -> usize {
        self.out.token().0
    }

    fn send(&self, message: String) -> Result<()> {
        self.out.send(message)
    }

    fn broadcast(&mut self, message: String) -> Result<()> {
        let now = Instant::now();

        match self.last_sent_at {
            Some(last_sent_at) if now - last_sent_at < Duration::from_secs(1) => {
                println!("Dropping message from {}", self.id());
                Ok(())
            }
            _ => {
                self.last_sent_at = Some(now);
                self.out.broadcast(message)
            }
        }
    }

    fn unsupported<T: Debug>(&self, message: T) -> Result<()> {
        println!(
            "Ignoring unsupported message from session {}: {:?}",
            self.id(),
            message
        );
        self.out.close(CloseCode::Unsupported)
    }
}

impl Handler for Session {
    fn on_request(&mut self, req: &Request) -> Result<(Response)> {
        Response::from_request(req)
    }

    fn on_open(&mut self, _: Handshake) -> Result<()> {
        let payload = Payload::Welcome { id: self.id() };

        self.send(payload.to_json())
    }

    // Handle messages recieved in the websocket (in this case, only on /ws)
    fn on_message(&mut self, msg: Message) -> Result<()> {
        use Message::*;
        use Payload::*;

        // Broadcast to all connections
        match msg {
            Text(string) => match Payload::from_json(&string) {
                Ok(Reaction { id, .. }) if id == self.id() => self.broadcast(string),
                _ => self.unsupported(string),
            },
            _ => self.unsupported(msg),
        }
    }
}

fn main() {
    let args = Docopt::new(USAGE)
        .and_then(|dopt| dopt.parse())
        .unwrap_or_else(|e| e.exit());

    let address = format!("{}:{}", args.get_str("--host"), args.get_str("--port"),);

    // Listen on an address and call the closure for each connection
    listen(address, |out| Session {
        out,
        last_sent_at: None,
    }).unwrap()
}
